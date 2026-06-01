import { NextResponse } from 'next/server'
import { parseFinnhubEvents, parseMag7Earnings, MAG7_SYMBOLS } from '@/lib/calendarUtils'

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
    // Fetch economic calendar and Mag7 earnings calendar in parallel
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

    // Earnings: parse only if request succeeded
    let earningsEvents = []
    if (earningsRes.ok) {
      const earningsData = await earningsRes.json()
      const rawEarnings = earningsData.earningsCalendar || []
      earningsEvents = parseMag7Earnings(rawEarnings, etDate)
    }

    // Merge and sort: Mag7 earnings go to top alongside tier1
    const allEvents = [...earningsEvents, ...econEvents].sort((a, b) => {
      const tierOrder = { mag7: 0, fomc: 1, tier1: 2, fed_minutes: 3, fed_speaker: 4, opex: 5, tier2: 6, tier3: 7 }
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
      mag7Today: earningsEvents.map(e => e.symbol),
    })
  } catch (err) {
    console.error('Calendar fetch error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
