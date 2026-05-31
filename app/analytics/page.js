'use client'
import { useState, useEffect } from 'react'
import {
  BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, ReferenceLine,
} from 'recharts'
import Header from '@/components/Header'

const DAY_TYPE_COLORS = {
  'A+': '#f0a22a',
  'A': '#00ff88',
  'B': '#00d4ff',
  'C': '#6b7fa3',
  'F': '#ff3d5a',
  'Unknown': '#6b7fa3',
}

const CustomTooltip = ({ active, payload, label, prefix = '$' }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-terminal-surface border border-terminal-border px-3 py-2 text-xs">
      <p className="text-terminal-muted mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color || '#f0a22a' }}>
          {p.name}: {prefix}{p.value?.toLocaleString()}
        </p>
      ))}
    </div>
  )
}

function StatCard({ label, value, sub, color = 'text-terminal-gold' }) {
  return (
    <div className="bg-terminal-surface border border-terminal-border p-4">
      <p className="text-terminal-muted text-[9px] tracking-widest mb-1">{label}</p>
      <p className={`text-3xl font-display ${color}`}>{value}</p>
      {sub && <p className="text-terminal-muted text-[10px] mt-0.5">{sub}</p>}
    </div>
  )
}

export default function Analytics() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetch('/api/analytics')
      .then(r => r.json())
      .then(d => {
        if (d.error) throw new Error(d.error)
        setData(d)
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen bg-terminal-bg">
      <Header />

      <main className="max-w-screen-2xl mx-auto px-4 py-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-terminal-gold text-3xl tracking-widest">ANALYTICS</h1>
          <span className="text-terminal-muted text-[10px] tracking-wider">MNQ/NQ PERFORMANCE DASHBOARD</span>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="relative w-10 h-10">
              <div className="absolute inset-0 border-2 border-terminal-gold/20 rounded-full" />
              <div className="absolute inset-0 border-2 border-transparent border-t-terminal-gold rounded-full animate-spin" />
            </div>
            <span className="ml-4 text-terminal-gold text-sm tracking-wider">LOADING...</span>
          </div>
        )}

        {error && (
          <div className="card border-terminal-red border p-6 text-terminal-red text-sm">
            Error loading analytics: {error}
          </div>
        )}

        {data && !loading && (
          <div className="space-y-6">
            {/* Summary Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3">
              <StatCard label="TOTAL TRADES" value={data.summary.total} />
              <StatCard label="WIN RATE" value={`${data.summary.winRate}%`} color={data.summary.winRate >= 60 ? 'text-terminal-green' : 'text-terminal-red'} />
              <StatCard label="TOTAL P&L" value={`$${data.summary.totalPnl.toLocaleString()}`} color={data.summary.totalPnl >= 0 ? 'text-terminal-green' : 'text-terminal-red'} />
              <StatCard label="WINS" value={data.summary.wins} color="text-terminal-green" />
              <StatCard label="LOSSES" value={data.summary.losses} color="text-terminal-red" />
            </div>

            {/* Performance by Day Type */}
            <div className="card p-6 space-y-4">
              <p className="text-terminal-muted text-[10px] tracking-widest">PERFORMANCE BY DAY TYPE</p>
              {data.byDayType.length === 0 ? (
                <p className="text-terminal-muted text-xs">No data yet</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-terminal-border">
                        {['DAY TYPE', 'TRADES', 'WIN RATE', 'AVG PTS', 'AVG P&L'].map(h => (
                          <th key={h} className="text-left text-terminal-muted text-[9px] tracking-widest pb-3 pr-6">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {data.byDayType.map(row => (
                        <tr key={row.dayType} className="border-b border-terminal-border/30">
                          <td className="py-3 pr-6">
                            <span
                              className="font-display text-xl"
                              style={{ color: DAY_TYPE_COLORS[row.dayType] || '#6b7fa3' }}
                            >
                              {row.dayType}
                            </span>
                          </td>
                          <td className="py-3 pr-6 text-terminal-text">{row.trades}</td>
                          <td className="py-3 pr-6">
                            <span className={row.winRate >= 60 ? 'text-terminal-green' : 'text-terminal-red'}>
                              {row.winRate}%
                            </span>
                          </td>
                          <td className="py-3 pr-6 text-terminal-text">{row.avgPts}</td>
                          <td className={`py-3 pr-6 font-bold ${row.avgPnl >= 0 ? 'text-terminal-green' : 'text-terminal-red'}`}>
                            {row.avgPnl >= 0 ? '+' : ''}${row.avgPnl}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Weekly P&L Bar Chart */}
              <div className="card p-6 space-y-3">
                <p className="text-terminal-muted text-[10px] tracking-widest">WEEKLY P&L — LAST 12 WEEKS</p>
                {data.weeklyPnl.length === 0 ? (
                  <p className="text-terminal-muted text-xs">No weekly data yet</p>
                ) : (
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={data.weeklyPnl} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1a2a45" vertical={false} />
                      <XAxis
                        dataKey="week"
                        tick={{ fill: '#6b7fa3', fontSize: 9, fontFamily: 'JetBrains Mono' }}
                        tickFormatter={v => v.slice(5)}
                        axisLine={{ stroke: '#1a2a45' }}
                        tickLine={false}
                      />
                      <YAxis
                        tick={{ fill: '#6b7fa3', fontSize: 9, fontFamily: 'JetBrains Mono' }}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={v => `$${v}`}
                      />
                      <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(240,162,42,0.05)' }} />
                      <ReferenceLine y={0} stroke="#1a2a45" />
                      <Bar dataKey="pnl" name="P&L" radius={[2, 2, 0, 0]}>
                        {data.weeklyPnl.map((entry, i) => (
                          <Cell key={i} fill={entry.pnl >= 0 ? '#00ff88' : '#ff3d5a'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>

              {/* Cumulative P&L Line Chart */}
              <div className="card p-6 space-y-3">
                <p className="text-terminal-muted text-[10px] tracking-widest">CUMULATIVE P&L</p>
                {data.cumulativePnl.length === 0 ? (
                  <p className="text-terminal-muted text-xs">No cumulative data yet</p>
                ) : (
                  <ResponsiveContainer width="100%" height={220}>
                    <LineChart data={data.cumulativePnl} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1a2a45" vertical={false} />
                      <XAxis
                        dataKey="date"
                        tick={{ fill: '#6b7fa3', fontSize: 9, fontFamily: 'JetBrains Mono' }}
                        tickFormatter={v => v?.slice(5) || ''}
                        axisLine={{ stroke: '#1a2a45' }}
                        tickLine={false}
                      />
                      <YAxis
                        tick={{ fill: '#6b7fa3', fontSize: 9, fontFamily: 'JetBrains Mono' }}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={v => `$${v}`}
                      />
                      <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#f0a22a', strokeWidth: 1 }} />
                      <ReferenceLine y={0} stroke="#1a2a45" />
                      <Line
                        type="monotone"
                        dataKey="pnl"
                        name="Cumulative P&L"
                        stroke="#f0a22a"
                        strokeWidth={2}
                        dot={false}
                        activeDot={{ r: 4, fill: '#f0a22a' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Best / Worst Sessions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {[
                { label: 'BEST 5 SESSIONS', sessions: data.bestSessions, positive: true },
                { label: 'WORST 5 SESSIONS', sessions: data.worstSessions, positive: false },
              ].map(({ label, sessions, positive }) => (
                <div key={label} className="card p-6 space-y-3">
                  <p className="text-terminal-muted text-[10px] tracking-widest">{label}</p>
                  {sessions.length === 0 ? (
                    <p className="text-terminal-muted text-xs">No data yet</p>
                  ) : (
                    <div className="space-y-2">
                      {sessions.map((s, i) => (
                        <div key={i} className="flex items-center justify-between py-1.5 border-b border-terminal-border/30 last:border-0 text-xs">
                          <div className="flex items-center gap-3">
                            <span className="text-terminal-muted w-5 text-center">{i + 1}</span>
                            <span className="text-terminal-text">{s.date}</span>
                            {s.dayType && (
                              <span className="font-display text-base" style={{ color: DAY_TYPE_COLORS[s.dayType] || '#6b7fa3' }}>
                                {s.dayType}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-terminal-muted text-[9px]">{s.trades}T</span>
                            <span className={`font-bold ${s.pnl >= 0 ? 'text-terminal-green' : 'text-terminal-red'}`}>
                              {s.pnl >= 0 ? '+' : ''}${Math.round(s.pnl).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Full Session Log */}
            <div className="card p-6 space-y-4">
              <p className="text-terminal-muted text-[10px] tracking-widest">FULL TRADE LOG ({data.allTrades.length} TRADES)</p>
              {data.allTrades.length === 0 ? (
                <p className="text-terminal-muted text-xs">No trades logged yet</p>
              ) : (
                <div className="overflow-x-auto max-h-96">
                  <table className="w-full text-xs">
                    <thead className="sticky top-0 bg-terminal-surface">
                      <tr className="border-b border-terminal-border">
                        {['DATE', 'TIME', '#', 'PTS', 'RESULT', 'P&L', 'TYPE', 'ACCOUNT'].map(h => (
                          <th key={h} className="text-left text-terminal-muted text-[9px] tracking-widest pb-2 pr-4">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {data.allTrades.map(t => (
                        <tr key={t.id} className="border-b border-terminal-border/20 hover:bg-terminal-border/10">
                          <td className="py-1.5 pr-4 text-terminal-text">{t.trade_date}</td>
                          <td className="py-1.5 pr-4 text-terminal-muted">{t.trade_time || '—'}</td>
                          <td className="py-1.5 pr-4 text-terminal-muted">T{t.trade_num}</td>
                          <td className="py-1.5 pr-4 text-terminal-text">{t.pts}</td>
                          <td className={`py-1.5 pr-4 font-bold text-[10px] ${t.result === 'WIN' ? 'text-terminal-green' : 'text-terminal-red'}`}>
                            {t.result}
                          </td>
                          <td className={`py-1.5 pr-4 font-bold ${parseFloat(t.pnl) >= 0 ? 'text-terminal-green' : 'text-terminal-red'}`}>
                            {parseFloat(t.pnl) >= 0 ? '+' : ''}${parseFloat(t.pnl).toFixed(0)}
                          </td>
                          <td className="py-1.5 pr-4">
                            {t.day_type && (
                              <span className="font-display text-base" style={{ color: DAY_TYPE_COLORS[t.day_type] || '#6b7fa3' }}>
                                {t.day_type}
                              </span>
                            )}
                          </td>
                          <td className="py-1.5 pr-4 text-terminal-muted">{t.account_name || 'PA1'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

          </div>
        )}

        <div className="h-8" />
      </main>
    </div>
  )
}
