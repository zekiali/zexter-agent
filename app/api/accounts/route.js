import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  // Get the latest snapshot per account
  const { data, error } = await supabase
    .from('account_snapshots')
    .select('*')
    .order('snapshot_date', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Deduplicate: latest per account_name
  const seen = new Set()
  const latest = (data || []).filter(row => {
    if (seen.has(row.account_name)) return false
    seen.add(row.account_name)
    return true
  })

  return NextResponse.json({ accounts: latest })
}

export async function POST(request) {
  try {
    const body = await request.json()
    const { snapshot_date, account_name, account_type, balance, drawdown_floor, payout_requested, status } = body

    if (!account_name || !account_type || balance == null) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('account_snapshots')
      .insert({
        snapshot_date: snapshot_date || new Date().toLocaleDateString('en-CA', { timeZone: 'America/Chicago' }),
        account_name,
        account_type,
        balance: parseFloat(balance),
        drawdown_floor: drawdown_floor ? parseFloat(drawdown_floor) : null,
        payout_requested: payout_requested ? parseFloat(payout_requested) : 0,
        status: status || 'active',
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ account: data })
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
