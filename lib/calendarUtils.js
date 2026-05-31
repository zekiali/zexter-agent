// Tier classification keyword lists
const TIER1_KEYWORDS = [
  'cpi', 'consumer price index', 'inflation',
  'ppi', 'producer price',
  'nonfarm payroll', 'nfp', 'non-farm payroll',
  'pce', 'personal consumption',
  'retail sales',
]

const TIER2_KEYWORDS = [
  'ism', 'purchasing manager', 'pmi',
  'consumer confidence', 'consumer sentiment',
  'jobless claims', 'initial claims', 'continuing claims',
  'jolts', 'job openings',
  'durable goods',
  'gdp',
]

const FOMC_KEYWORDS = [
  'fed rate', 'federal funds', 'fomc',
  'federal open market', 'fed decision',
]

export function classifyEvent(eventName) {
  const lower = (eventName || '').toLowerCase()

  if (FOMC_KEYWORDS.some(k => lower.includes(k))) return 'fomc'
  if (TIER1_KEYWORDS.some(k => lower.includes(k))) return 'tier1'
  if (TIER2_KEYWORDS.some(k => lower.includes(k))) return 'tier2'
  return 'tier3'
}

export function convertToET(timeStr, dateStr) {
  if (!timeStr || timeStr === 'N/A' || timeStr === '') return { et: 'TBA', ct: 'TBA' }

  try {
    // Finnhub returns times in UTC format like "09:30:00" or full ISO strings
    let utcDate
    if (timeStr.includes('T') || timeStr.includes(' ')) {
      utcDate = new Date(timeStr)
    } else {
      utcDate = new Date(`${dateStr}T${timeStr}Z`)
    }

    if (isNaN(utcDate.getTime())) return { et: 'TBA', ct: 'TBA' }

    const etFormatter = new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/New_York',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    })

    const ctFormatter = new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/Chicago',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    })

    return {
      et: etFormatter.format(utcDate),
      ct: ctFormatter.format(utcDate),
    }
  } catch {
    return { et: 'TBA', ct: 'TBA' }
  }
}

export function parseFinnhubEvents(rawEvents, dateStr) {
  if (!Array.isArray(rawEvents)) return []

  return rawEvents
    .filter(ev => {
      const country = (ev.country || '').toUpperCase()
      const impact = Number(ev.impact)
      return (country === 'US' || country === 'UNITED STATES') && impact >= 2
    })
    .map(ev => {
      const tier = classifyEvent(ev.event)
      const times = convertToET(ev.time, dateStr)
      return {
        name: ev.event || 'Unknown Event',
        timeET: times.et,
        timeCT: times.ct,
        rawTime: ev.time,
        country: ev.country,
        actual: ev.actual ?? null,
        estimate: ev.estimate ?? null,
        prev: ev.prev ?? null,
        impact: Number(ev.impact),
        tier,
      }
    })
    .sort((a, b) => {
      if (!a.rawTime) return 1
      if (!b.rawTime) return -1
      return new Date(a.rawTime) - new Date(b.rawTime)
    })
}

export function getTierColor(tier) {
  switch (tier) {
    case 'tier1': return 'border-terminal-gold'
    case 'tier2': return 'border-terminal-cyan'
    case 'fomc': return 'border-terminal-purple'
    default: return 'border-terminal-muted'
  }
}

export function getTierBadge(tier) {
  switch (tier) {
    case 'tier1': return { label: 'TIER 1', color: 'text-terminal-gold bg-terminal-gold/10' }
    case 'tier2': return { label: 'TIER 2', color: 'text-terminal-cyan bg-terminal-cyan/10' }
    case 'fomc': return { label: 'FOMC', color: 'text-terminal-purple bg-terminal-purple/10' }
    default: return { label: 'TIER 3', color: 'text-terminal-muted bg-terminal-muted/10' }
  }
}

export function assessActualVsEstimate(actual, estimate) {
  if (actual == null || estimate == null || actual === '' || estimate === '') return null
  const a = parseFloat(String(actual).replace(/[^0-9.-]/g, ''))
  const e = parseFloat(String(estimate).replace(/[^0-9.-]/g, ''))
  if (isNaN(a) || isNaN(e)) return null
  const diff = a - e
  const pct = Math.abs(diff / e) * 100
  if (pct < 0.5) return 'IN-LINE'
  return diff > 0 ? 'HOT' : 'COOL'
}
