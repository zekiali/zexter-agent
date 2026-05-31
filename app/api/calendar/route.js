import { NextResponse } from 'next/server'
import { parseFinnhubEvents } from '@/lib/calendarUtils'

export async function GET(request) {
  const finnhubKey = process.env.FINNHUB_KEY
  if (!finnhubKey) {
    return NextResponse.json({ error: 'FINNHUB_KEY not configured' }, { status: 400 })
  }

  const now = new Date()
  // Use ET date for trading day context
  const etDate = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/New_York',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now)

  const tomorrow = new Date(now)
  tomorrow.setDate(tomorrow.getDate() + 1)
  const etTomorrow = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/New_York',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(tomorrow)

  try {
    const url = `https://finnhub.io/api/v1/calendar/economic?from=${etDate}&to=${etTomorrow}&token=${finnhubKey}`
    const res = await fetch(url, { next: { revalidate: 300 } })

    if (!res.ok) {
      return NextResponse.json(
        { error: `Finnhub returned ${res.status}` },
        { status: res.status }
      )
    }

    const data = await res.json()
    const rawEvents = data.economicCalendar || data || []
    const parsed = parseFinnhubEvents(rawEvents, etDate)

    return NextResponse.json({
      events: parsed,
      fetchedAt: new Date().toISOString(),
      tradingDate: etDate,
    })
  } catch (err) {
    console.error('Calendar fetch error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
