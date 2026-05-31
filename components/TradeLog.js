'use client'
import { useState, useEffect } from 'react'

export default function TradeLog({ tradingDate, dayType, briefId, maxTrades = 3, contracts = 3 }) {
  const [trades, setTrades] = useState([])
  const [pts, setPts] = useState('')
  const [isWin, setIsWin] = useState(true)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!tradingDate) return
    setLoading(true)
    fetch(`/api/trades?date=${tradingDate}`)
      .then(r => r.json())
      .then(d => setTrades(d.trades || []))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [tradingDate])

  const ptsPerContract = 2
  const totalPnl = trades.reduce((s, t) => s + parseFloat(t.pnl || 0), 0)
  const tradeCount = trades.length
  const maxReached = tradeCount >= maxTrades

  async function handleLog() {
    if (!pts || isNaN(parseFloat(pts))) return
    setSaving(true)
    setError(null)
    const ptsNum = parseFloat(pts)
    const result = isWin ? 'WIN' : 'LOSS'
    const pnl = isWin ? ptsNum * ptsPerContract * contracts : -(ptsNum * ptsPerContract * contracts)

    try {
      const res = await fetch('/api/trades', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trade_date: tradingDate,
          trade_time: new Date().toLocaleTimeString('en-US', { timeZone: 'America/Chicago', hour: '2-digit', minute: '2-digit' }),
          pts: ptsNum,
          result,
          pnl,
          contracts,
          day_type: dayType,
          brief_id: briefId,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setTrades(prev => [...prev, data.trade])
      setPts('')
    } catch (e) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="card p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-terminal-muted text-[10px] tracking-widest">SESSION TRADE LOG</p>
          <p className={`text-2xl font-display mt-1 ${totalPnl >= 0 ? 'text-terminal-green' : 'text-terminal-red'}`}>
            {totalPnl >= 0 ? '+' : ''}${totalPnl.toFixed(0)}
          </p>
        </div>
        <div className="text-right">
          <p className="text-terminal-muted text-[9px] tracking-widest">TRADES</p>
          <p className={`text-2xl font-display mt-1 ${maxReached ? 'text-terminal-red' : 'text-terminal-gold'}`}>
            {tradeCount}/{maxTrades}
          </p>
        </div>
      </div>

      {maxReached && (
        <div className="bg-terminal-red/10 border border-terminal-red text-terminal-red text-xs font-bold tracking-wider text-center py-3 glow-red">
          ✕ MAX TRADES REACHED — CLOSE PLATFORM
        </div>
      )}

      {!maxReached && (
        <div className="space-y-3">
          <div className="flex gap-2">
            <input
              type="number"
              value={pts}
              onChange={e => setPts(e.target.value)}
              placeholder="Points"
              className="flex-1 bg-terminal-bg border border-terminal-border text-terminal-text px-3 py-2 text-sm focus:outline-none focus:border-terminal-gold"
            />
            <button
              onClick={() => setIsWin(true)}
              className={`px-4 py-2 text-xs font-bold tracking-wider border transition-colors ${
                isWin
                  ? 'bg-terminal-green/10 border-terminal-green text-terminal-green'
                  : 'border-terminal-border text-terminal-muted hover:border-terminal-green hover:text-terminal-green'
              }`}
            >
              WIN
            </button>
            <button
              onClick={() => setIsWin(false)}
              className={`px-4 py-2 text-xs font-bold tracking-wider border transition-colors ${
                !isWin
                  ? 'bg-terminal-red/10 border-terminal-red text-terminal-red'
                  : 'border-terminal-border text-terminal-muted hover:border-terminal-red hover:text-terminal-red'
              }`}
            >
              LOSS
            </button>
          </div>

          {pts && !isNaN(parseFloat(pts)) && (
            <div className={`text-xs px-3 py-1.5 border ${isWin ? 'border-terminal-green/30 text-terminal-green bg-terminal-green/5' : 'border-terminal-red/30 text-terminal-red bg-terminal-red/5'}`}>
              {isWin ? '+' : '-'}${Math.abs(parseFloat(pts) * ptsPerContract * contracts).toFixed(0)} ({contracts} contracts × $2/pt × {pts} pts)
            </div>
          )}

          <button
            onClick={handleLog}
            disabled={saving || !pts}
            className="w-full py-2.5 bg-terminal-gold/90 text-terminal-bg font-bold text-xs tracking-widest hover:bg-terminal-gold disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {saving ? 'LOGGING...' : '◆ LOG TRADE'}
          </button>
        </div>
      )}

      {error && <p className="text-terminal-red text-xs">{error}</p>}

      {loading ? (
        <p className="text-terminal-muted text-xs">Loading trades...</p>
      ) : trades.length > 0 ? (
        <div className="space-y-1.5 max-h-48 overflow-y-auto">
          {trades.map((t, i) => (
            <div key={t.id || i} className="flex items-center justify-between text-xs py-1.5 border-b border-terminal-border/40 last:border-0">
              <div className="flex items-center gap-2">
                <span className={`font-bold w-5 ${t.result === 'WIN' ? 'text-terminal-green' : 'text-terminal-red'}`}>
                  {t.result === 'WIN' ? '▲' : '▼'}
                </span>
                <span className="text-terminal-muted">T{t.trade_num || i + 1}</span>
                <span className="text-terminal-text">{t.pts} pts</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-terminal-muted text-[9px]">{t.trade_time}</span>
                <span className={`font-bold ${parseFloat(t.pnl) >= 0 ? 'text-terminal-green' : 'text-terminal-red'}`}>
                  {parseFloat(t.pnl) >= 0 ? '+' : ''}${parseFloat(t.pnl).toFixed(0)}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-terminal-muted text-[10px] text-center py-3">No trades logged today</p>
      )}
    </div>
  )
}
