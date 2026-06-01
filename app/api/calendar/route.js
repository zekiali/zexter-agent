import { NextResponse } from 'next/server'
import {
  parseFinnhubEvents,
  parseMag7Earnings,
  MAG7_SYMBOLS,
  isThirdFriday,
  buildOpExEvent,
} from '@/lib/calendarUtils'

export async function GET() {
  const finnhubKey = process.env.FINNHUB_KEY
  if (!finnhubKey) {
    return NextResponse.json({ error: 'FINNHUB_KEY not configured' }, { status: 400 })
  }

  const now = new Date()
  const etDate = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/New_York',
    year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(now)

  const tomorrow = new Date(now)
  tomorrow.setDate(tomorrow.getDate() + 1)
  const etTomorrow = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/New_York',
    year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(tomorrow)

  try {
    // Fetch economic calendar + Mag7 earnings calendar in parallel
    const [econRes, earningsRes] = await Promise.all([
      fetch(
        `https://finnhub.io/api/v1/calendar/economic?from=${etDate}&to=${etTomorrow}&token=${finnhubKey}`,
        { next: { revalidate: 300 } }
      ),
      fetch(
        `https://finnhub.io/api/v1/calendar/earnings?from=${etDate}&to=${etTomorrow}&token=${finnhubKey}`,
        { next: { revalidate: 300 } }
      ),
    ])

    if (!econRes.ok) {
      return NextResponse.json(
        { error: `Finnhub economic calendar returned ${econRes.status}` },
        { status: econRes.status }
      )
    }

    const econData = await econRes.json()
    const rawEcon = econData.economicCalendar || econData || []
    const econEvents = parseFinnhubEvents(rawEcon, etDate)

    // Parse Mag7 earnings if available
    let earningsEvents = []
    let mag7RawData = []
    if (earningsRes.ok) {
      const earningsData = await earningsRes.json()
      mag7RawData = earningsData.earningsCalendar || []
      earningsEvents = parseMag7Earnings(mag7RawData, etDate)
    }

    // Auto-inject OpEx event if today is the 3rd Friday of the month
    const opexEvents = []
    if (isThirdFriday(etDate)) {
      opexEvents.push(buildOpExEvent(etDate))
    }

    // Tier priority order for sorting
    const tierOrder = {
      mag7: 0, fomc: 1, tier1: 2,
      fed_minutes: 3, fed_speaker: 4,
      opex: 5, tier2: 6, tier3: 7,
    }

    const allEvents = [...earningsEvents, ...opexEvents, ...econEvents].sort((a, b) => {
      const ta = tierOrder[a.tier] ?? 8
      const tb = tierOrder[b.tier] ?? 8
      if (ta !== tb) return ta - tb
      if (!a.rawTime) return 1
      if (!b.rawTime) return -1
      return new Date(a.rawTime) - new Date(b.rawTime)
    })

    return NextResponse.json({
      events: allEvents,
      fetchedAt: new Date().toISOString(),
      tradingDate: etDate,
      isOpExDay: opexEvents.length > 0,
      mag7Today: earningsEvents.map(e => e.symbol),
    })
  } catch (err) {
    console.error('Calendar fetch error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
