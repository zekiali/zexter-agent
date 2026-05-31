'use client'
import { useState, useEffect } from 'react'

export default function AccountMonitor() {
  const [accounts, setAccounts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    account_name: '',
    account_type: 'PA',
    balance: '',
    drawdown_floor: '',
    payout_requested: '',
    status: 'active',
  })

  useEffect(() => {
    fetch('/api/accounts')
      .then(r => r.json())
      .then(d => setAccounts(d.accounts || []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch('/api/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setAccounts(prev => {
        const existing = prev.findIndex(a => a.account_name === data.account.account_name)
        if (existing >= 0) {
          const updated = [...prev]
          updated[existing] = data.account
          return updated
        }
        return [...prev, data.account]
      })
      setShowForm(false)
      setForm({ account_name: '', account_type: 'PA', balance: '', drawdown_floor: '', payout_requested: '', status: 'active' })
    } catch (e) {
      alert(e.message)
    } finally {
      setSaving(false)
    }
  }

  function bufferColor(balance, floor) {
    if (!floor) return 'text-terminal-muted'
    const buffer = balance - floor
    const pct = (buffer / floor) * 100
    if (pct > 10) return 'text-terminal-green'
    if (pct > 5) return 'text-terminal-gold'
    return 'text-terminal-red'
  }

  const statusColors = {
    active: 'text-terminal-green',
    suspended: 'text-terminal-red',
    payout_pending: 'text-terminal-gold',
    passed: 'text-terminal-cyan',
  }

  return (
    <div className="card p-6 space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-terminal-muted text-[10px] tracking-widest">ACCOUNT MONITOR</p>
        <button
          onClick={() => setShowForm(!showForm)}
          className="text-terminal-gold text-[10px] tracking-wider hover:text-terminal-gold/80 border border-terminal-gold/30 px-2 py-1"
        >
          {showForm ? '✕ CANCEL' : '+ SNAPSHOT'}
        </button>
      </div>

      {loading ? (
        <p className="text-terminal-muted text-xs">Loading accounts...</p>
      ) : accounts.length === 0 ? (
        <p className="text-terminal-muted text-xs text-center py-4">No account snapshots yet</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-terminal-border">
                {['ACCOUNT', 'TYPE', 'BALANCE', 'FLOOR', 'BUFFER', 'STATUS'].map(h => (
                  <th key={h} className="text-left text-terminal-muted text-[9px] tracking-widest pb-2 pr-4">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {accounts.map(acc => {
                const buffer = acc.drawdown_floor
                  ? (acc.balance - acc.drawdown_floor).toFixed(0)
                  : null
                return (
                  <tr key={acc.id} className="border-b border-terminal-border/30 hover:bg-terminal-border/10">
                    <td className="py-2 pr-4 text-terminal-text font-medium">{acc.account_name}</td>
                    <td className="py-2 pr-4 text-terminal-muted">{acc.account_type}</td>
                    <td className="py-2 pr-4 text-terminal-gold">${parseFloat(acc.balance).toLocaleString()}</td>
                    <td className="py-2 pr-4 text-terminal-muted">
                      {acc.drawdown_floor ? `$${parseFloat(acc.drawdown_floor).toLocaleString()}` : '—'}
                    </td>
                    <td className={`py-2 pr-4 font-bold ${bufferColor(acc.balance, acc.drawdown_floor)}`}>
                      {buffer ? `$${parseInt(buffer).toLocaleString()}` : '—'}
                    </td>
                    <td className={`py-2 pr-4 uppercase text-[9px] font-bold ${statusColors[acc.status] || 'text-terminal-muted'}`}>
                      {acc.status}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSave} className="grid grid-cols-2 gap-3 pt-4 border-t border-terminal-border">
          {[
            { key: 'account_name', label: 'Account Name', type: 'text', placeholder: 'PA1' },
            { key: 'balance', label: 'Balance ($)', type: 'number', placeholder: '50000' },
            { key: 'drawdown_floor', label: 'Drawdown Floor ($)', type: 'number', placeholder: '47500' },
            { key: 'payout_requested', label: 'Payout Requested ($)', type: 'number', placeholder: '0' },
          ].map(({ key, label, type, placeholder }) => (
            <div key={key}>
              <label className="text-terminal-muted text-[9px] tracking-widest block mb-1">{label}</label>
              <input
                type={type}
                value={form[key]}
                onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                placeholder={placeholder}
                className="w-full bg-terminal-bg border border-terminal-border text-terminal-text px-2 py-1.5 text-xs focus:outline-none focus:border-terminal-gold"
              />
            </div>
          ))}

          <div>
            <label className="text-terminal-muted text-[9px] tracking-widest block mb-1">TYPE</label>
            <select
              value={form.account_type}
              onChange={e => setForm(f => ({ ...f, account_type: e.target.value }))}
              className="w-full bg-terminal-bg border border-terminal-border text-terminal-text px-2 py-1.5 text-xs focus:outline-none focus:border-terminal-gold"
            >
              {['PA', 'Eval', 'Demo'].map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          <div>
            <label className="text-terminal-muted text-[9px] tracking-widest block mb-1">STATUS</label>
            <select
              value={form.status}
              onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
              className="w-full bg-terminal-bg border border-terminal-border text-terminal-text px-2 py-1.5 text-xs focus:outline-none focus:border-terminal-gold"
            >
              {['active', 'suspended', 'payout_pending', 'passed'].map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div className="col-span-2">
            <button
              type="submit"
              disabled={saving}
              className="w-full py-2 bg-terminal-gold text-terminal-bg font-bold text-xs tracking-widest hover:bg-terminal-gold/90 disabled:opacity-50"
            >
              {saving ? 'SAVING...' : '◆ SAVE SNAPSHOT'}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
