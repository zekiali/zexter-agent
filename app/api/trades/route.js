import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const date = searchParams.get('date')

  let query = supabase
    .from('trade_logs')
    .select('*')
    .order('created_at', { ascending: true })

  if (date) {
    query = query.eq('trade_date', date)
  }

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ trades: data || [] })
}

export async function POST(request) {
  try {
    const body = await request.json()
    const { trade_date, trade_time, pts, result, pnl, contracts, day_type, brief_id, account_name, notes } = body

    if (!trade_date || pts == null || !result || pnl == null) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Get trade number for this day
    const { count } = await supabase
      .from('trade_logs')
      .select('*', { count: 'exact', head: true })
      .eq('trade_date', trade_date)

    const { data, error } = await supabase
      .from('trade_logs')
      .insert({
        trade_date,
        trade_time: trade_time || new Date().toLocaleTimeString('en-US', { timeZone: 'America/Chicago' }),
        trade_num: (count || 0) + 1,
        pts: parseFloat(pts),
        result,
        pnl: parseFloat(pnl),
        contracts: contracts || 3,
        day_type,
        brief_id,
        account_name: account_name || 'PA1',
        notes,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ trade: data })
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
