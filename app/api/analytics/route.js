import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    const { data: trades, error } = await supabase
      .from('trade_logs')
      .select('*')
      .order('trade_date', { ascending: true })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!trades || trades.length === 0) {
      return NextResponse.json({
        byDayType: [],
        weeklyPnl: [],
        cumulativePnl: [],
        summary: { total: 0, wins: 0, losses: 0, winRate: 0, totalPnl: 0 },
        allTrades: [],
        bestSessions: [],
        worstSessions: [],
      })
    }

    // By day type
    const dayTypeMap = {}
    for (const t of trades) {
      const dt = t.day_type || 'Unknown'
      if (!dayTypeMap[dt]) {
        dayTypeMap[dt] = { trades: 0, wins: 0, totalPts: 0, totalPnl: 0 }
      }
      dayTypeMap[dt].trades++
      if (t.result === 'WIN') dayTypeMap[dt].wins++
      dayTypeMap[dt].totalPts += parseFloat(t.pts) || 0
      dayTypeMap[dt].totalPnl += parseFloat(t.pnl) || 0
    }

    const byDayType = Object.entries(dayTypeMap).map(([dayType, stats]) => ({
      dayType,
      trades: stats.trades,
      winRate: stats.trades > 0 ? Math.round((stats.wins / stats.trades) * 100) : 0,
      avgPts: stats.trades > 0 ? Math.round((stats.totalPts / stats.trades) * 10) / 10 : 0,
      avgPnl: stats.trades > 0 ? Math.round(stats.totalPnl / stats.trades) : 0,
    }))

    // Weekly PnL (last 12 weeks)
    const weeklyMap = {}
    for (const t of trades) {
      const d = new Date(t.trade_date)
      const dayOfWeek = d.getDay()
      const diff = d.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1)
      const weekStart = new Date(d.setDate(diff))
      const weekKey = weekStart.toLocaleDateString('en-CA')
      if (!weeklyMap[weekKey]) weeklyMap[weekKey] = 0
      weeklyMap[weekKey] += parseFloat(t.pnl) || 0
    }

    const sortedWeeks = Object.entries(weeklyMap)
      .sort(([a], [b]) => new Date(a) - new Date(b))
      .slice(-12)
      .map(([week, pnl]) => ({ week, pnl: Math.round(pnl) }))

    // Cumulative PnL
    let running = 0
    const cumulativePnl = trades.map(t => {
      running += parseFloat(t.pnl) || 0
      return {
        date: t.trade_date,
        pnl: Math.round(running),
        trade: t.trade_num,
      }
    })

    // Summary stats
    const wins = trades.filter(t => t.result === 'WIN').length
    const totalPnl = trades.reduce((sum, t) => sum + (parseFloat(t.pnl) || 0), 0)

    // Session aggregates for best/worst
    const sessionMap = {}
    for (const t of trades) {
      const key = `${t.trade_date}-${t.account_name || 'PA1'}`
      if (!sessionMap[key]) {
        sessionMap[key] = { date: t.trade_date, account: t.account_name, dayType: t.day_type, pnl: 0, trades: 0 }
      }
      sessionMap[key].pnl += parseFloat(t.pnl) || 0
      sessionMap[key].trades++
    }

    const sessions = Object.values(sessionMap).sort((a, b) => b.pnl - a.pnl)

    return NextResponse.json({
      byDayType,
      weeklyPnl: sortedWeeks,
      cumulativePnl,
      summary: {
        total: trades.length,
        wins,
        losses: trades.length - wins,
        winRate: trades.length > 0 ? Math.round((wins / trades.length) * 100) : 0,
        totalPnl: Math.round(totalPnl),
      },
      allTrades: trades,
      bestSessions: sessions.slice(0, 5),
      worstSessions: sessions.slice(-5).reverse(),
    })
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
