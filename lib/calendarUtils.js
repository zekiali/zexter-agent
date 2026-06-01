// ─── Tier 1: High-impact economic data (8:30 AM ET) ──────────────────────────
const TIER1_KEYWORDS = [
  'cpi', 'consumer price index', 'core cpi', 'core consumer price',
  'ppi', 'producer price', 'core ppi',
  'pce', 'personal consumption expenditure', 'core pce',
  'inflation',
  'nonfarm payroll', 'nfp', 'non-farm payroll', 'nonfarm employment',
  'initial jobless claims', 'initial claims', 'jobless claims',
  'continuing claims', 'unemployment claims',
  'retail sales', 'core retail sales', 'advance retail',
]

// ─── Tier 2 Economic: Secondary data ─────────────────────────────────────────
const TIER2_KEYWORDS = [
  'ism', 'purchasing manager', 'pmi', 'manufacturing pmi', 'services pmi',
  'consumer confidence', 'consumer sentiment', 'michigan sentiment',
  'jolts', 'job openings',
  'durable goods', 'core durable goods',
  'gdp', 'gross domestic product',
  'trade balance', 'current account',
  'housing starts', 'building permits', 'existing home sales', 'new home sales',
  'industrial production', 'capacity utilization',
  'chicago pmi', 'empire state', 'philly fed',
]

// ─── FOMC: Rate decisions ─────────────────────────────────────────────────────
const FOMC_KEYWORDS = [
  'fed rate', 'federal funds rate', 'fomc', 'fomc decision',
  'federal open market', 'fed decision', 'interest rate decision',
]

// ─── Fed Minutes: 3 weeks post-FOMC, 100-200pt potential ─────────────────────
const FED_MINUTES_KEYWORDS = [
  'fomc minutes', 'fed minutes', 'fed meeting minutes',
  'minutes of the federal', 'federal reserve minutes',
]

// ─── Fed Speaker: 50-150pt depending on Powell vs regional ───────────────────
const FED_SPEAKER_KEYWORDS = [
  'fed speaker', 'powell speaks', 'powell speech', 'fed chair',
  'fed chair speaks', 'fed governor', 'fed president speaks',
  'fomc member', 'fomc member speaks', 'fed testimony',
  'humphrey hawkins', 'semiannual monetary', 'fed press conference',
  'fed remarks', 'williams speaks', 'waller speaks', 'fed official',
  'jefferson speaks', 'kugler speaks', 'barr speaks', 'cook speaks',
  'bostic speaks', 'daly speaks', 'kashkari speaks',
]

// ─── OpEx: Monthly third Friday, quarterly triple witching ───────────────────
const OPEX_KEYWORDS = [
  'options expiration', 'option expiration', 'opex',
  'triple witching', 'quadruple witching', 'quarterly expiration',
  'index rebalance',
]

// ─── Mag7 symbols for earnings calendar ──────────────────────────────────────
export const MAG7_SYMBOLS = ['NVDA', 'MSFT', 'AAPL', 'GOOGL', 'GOOG', 'META', 'AMZN', 'TSLA']

// ─── OpEx date math: returns true if date is 3rd Friday of its month ─────────
export function isThirdFriday(date) {
  const d = new Date(date)
  if (d.getDay() !== 5) return false // must be Friday
  const dayOfMonth = d.getDate()
  return dayOfMonth >= 15 && dayOfMonth <= 21
}

// ─── Build a synthetic OpEx event for the calendar ───────────────────────────
export function buildOpExEvent(dateStr) {
  const d = new Date(dateStr)
  const month = d.toLocaleString('en-US', { month: 'long', timeZone: 'UTC' })
  const year = d.getFullYear()
  // Determine if quarterly (March, June, September, December)
  const qMonths = [2, 5, 8, 11] // 0-indexed
  const isQuarterly = qMonths.includes(d.getMonth())
  return {
    name: isQuarterly
      ? `Quarterly Triple Witching — ${month} ${year}`
      : `Monthly Options Expiration — ${month} ${year}`,
    timeET: 'All Day',
    timeCT: 'All Day',
    rawTime: null,
    country: 'US',
    actual: null,
    estimate: null,
    prev: null,
    impact: 2,
    tier: 'opex',
    isQuarterly,
  }
}

// ─── Check if any Mag7 name reported last night (from Finnhub earnings data) ──
export function checkMag7Earnings(earningsEvents) {
  if (!earningsEvents || earningsEvents.length === 0) return null
  const amcReports = earningsEvents.filter(e => e.hour === 'amc' || e.hour === 'amc ')
  const bmoReports = earningsEvents.filter(e => e.hour === 'bmo' || e.hour === 'bmo ')
  return { amcReports, bmoReports, hasMag7: earningsEvents.length > 0 }
}

// ─── Main classifier ──────────────────────────────────────────────────────────
export function classifyEvent(eventName) {
  const lower = (eventName || '').toLowerCase()
  if (FOMC_KEYWORDS.some(k => lower.includes(k))) return 'fomc'
  if (FED_MINUTES_KEYWORDS.some(k => lower.includes(k))) return 'fed_minutes'
  if (FED_SPEAKER_KEYWORDS.some(k => lower.includes(k))) return 'fed_speaker'
  if (OPEX_KEYWORDS.some(k => lower.includes(k))) return 'opex'
  if (TIER1_KEYWORDS.some(k => lower.includes(k))) return 'tier1'
  if (TIER2_KEYWORDS.some(k => lower.includes(k))) return 'tier2'
  return 'tier3'
}

export function classifyEarnings(symbol) {
  if (MAG7_SYMBOLS.includes((symbol || '').toUpperCase())) return 'mag7'
  return null
}

export function convertToET(timeStr, dateStr) {
  if (!timeStr || timeStr === 'N/A' || timeStr === '') return { et: 'TBA', ct: 'TBA' }
  try {
    let utcDate
    if (timeStr.includes('T') || timeStr.includes(' ')) {
      utcDate = new Date(timeStr)
    } else {
      utcDate = new Date(`${dateStr}T${timeStr}Z`)
    }
    if (isNaN(utcDate.getTime())) return { et: 'TBA', ct: 'TBA' }
    const etFormatter = new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/New_York',
      hour: '2-digit', minute: '2-digit', hour12: true,
    })
    const ctFormatter = new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/Chicago',
      hour: '2-digit', minute: '2-digit', hour12: true,
    })
    return { et: etFormatter.format(utcDate), ct: ctFormatter.format(utcDate) }
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

export function parseMag7Earnings(earningsData, dateStr) {
  if (!Array.isArray(earningsData)) return []
  return earningsData
    .filter(ev => MAG7_SYMBOLS.includes((ev.symbol || '').toUpperCase()))
    .map(ev => {
      const isAMC = (ev.hour || '').toLowerCase().trim() === 'amc'
      const isBMO = (ev.hour || '').toLowerCase().trim() === 'bmo'
      return {
        name: `${ev.symbol} Earnings${isAMC ? ' (After Close)' : isBMO ? ' (Pre-Market)' : ''}`,
        symbol: ev.symbol.toUpperCase(),
        timeET: isAMC ? 'After Close' : isBMO ? 'Pre-Market' : 'TBA',
        timeCT: isAMC ? 'After Close' : isBMO ? 'Pre-Market' : 'TBA',
        rawTime: ev.date,
        actual: ev.epsActual ?? null,
        estimate: ev.epsEstimate ?? null,
        prev: null,
        impact: 3,
        tier: 'mag7',
        hour: ev.hour,
      }
    })
}

// ─── UI helpers ───────────────────────────────────────────────────────────────
export function getTierColor(tier) {
  switch (tier) {
    case 'tier1':       return 'border-terminal-gold'
    case 'tier2':       return 'border-terminal-cyan'
    case 'fomc':        return 'border-terminal-purple'
    case 'fed_minutes': return 'border-terminal-purple'
    case 'fed_speaker': return 'border-purple-400'
    case 'opex':        return 'border-terminal-orange'
    case 'mag7':        return 'border-terminal-green'
    default:            return 'border-terminal-muted'
  }
}

export function getTierBadge(tier) {
  switch (tier) {
    case 'tier1':
      return { label: 'TIER 1',   color: 'text-terminal-gold bg-terminal-gold/10' }
    case 'tier2':
      return { label: 'TIER 2',   color: 'text-terminal-cyan bg-terminal-cyan/10' }
    case 'fomc':
      return { label: 'FOMC',     color: 'text-terminal-purple bg-terminal-purple/10' }
    case 'fed_minutes':
      return { label: 'FED MIN',  color: 'text-terminal-purple bg-terminal-purple/10' }
    case 'fed_speaker':
      return { label: 'FED SPK',  color: 'text-purple-400 bg-purple-400/10' }
    case 'opex':
      return { label: 'OPEX',     color: 'text-terminal-orange bg-terminal-orange/10' }
    case 'mag7':
      return { label: 'MAG7',     color: 'text-terminal-green bg-terminal-green/10' }
    default:
      return { label: 'TIER 3',   color: 'text-terminal-muted bg-terminal-muted/10' }
  }
}

export function assessActualVsEstimate(actual, estimate) {
  if (actual == null || estimate == null || actual === '' || estimate === '') return null
  const a = parseFloat(String(actual).replace(/[^0-9.-]/g, ''))
  const e = parseFloat(String(estimate).replace(/[^0-9.-]/g, ''))
  if (isNaN(a) || isNaN(e)) return null
  const diff = a - e
  const pct = e !== 0 ? Math.abs(diff / e) * 100 : Math.abs(diff)
  if (pct < 0.5) return 'IN-LINE'
  return diff > 0 ? 'HOT' : 'COOL'
}
