'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Header({ onSettingsToggle, onGenerateBrief, isGenerating }) {
  const [time, setTime] = useState('')
  const [date, setDate] = useState('')
  const pathname = usePathname()

  useEffect(() => {
    function tick() {
      const now = new Date()
      setTime(now.toLocaleTimeString('en-US', {
        timeZone: 'America/Chicago',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      }))
      setDate(now.toLocaleDateString('en-US', {
        timeZone: 'America/Chicago',
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }))
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <header className="sticky top-0 z-50 bg-terminal-bg border-b border-terminal-border">
      <div className="max-w-screen-2xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        {/* Left: Logo + Nav */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-px h-8 bg-terminal-gold" />
            <span className="font-display text-terminal-gold text-3xl tracking-widest leading-none">
              ZEXTER
            </span>
            <span className="font-display text-terminal-muted text-xl tracking-widest leading-none">
              AGENT
            </span>
          </div>

          <nav className="hidden sm:flex items-center gap-1">
            <Link
              href="/"
              className={`px-3 py-1.5 text-xs tracking-widest transition-colors ${
                pathname === '/'
                  ? 'text-terminal-gold border border-terminal-gold/40 bg-terminal-gold/5'
                  : 'text-terminal-muted hover:text-terminal-text border border-transparent'
              }`}
            >
              DASHBOARD
            </Link>
            <Link
              href="/analytics"
              className={`px-3 py-1.5 text-xs tracking-widest transition-colors ${
                pathname === '/analytics'
                  ? 'text-terminal-gold border border-terminal-gold/40 bg-terminal-gold/5'
                  : 'text-terminal-muted hover:text-terminal-text border border-transparent'
              }`}
            >
              ANALYTICS
            </Link>
          </nav>
        </div>

        {/* Center: Clock */}
        <div className="flex flex-col items-center min-w-[160px]">
          <div className="font-display text-terminal-gold text-2xl tracking-widest leading-none">
            {time || '--:--:--'}
          </div>
          <div className="text-terminal-muted text-[10px] tracking-wider mt-0.5">
            {date || '---'} CT
          </div>
        </div>

        {/* Right: Buttons */}
        <div className="flex items-center gap-2">
          {onSettingsToggle && (
            <button
              onClick={onSettingsToggle}
              className="p-2 text-terminal-muted hover:text-terminal-text border border-terminal-border hover:border-terminal-muted transition-colors text-sm"
              title="Settings"
            >
              ⚙
            </button>
          )}
          {onGenerateBrief && (
            <button
              onClick={onGenerateBrief}
              disabled={isGenerating}
              className="px-4 py-2 bg-terminal-gold text-terminal-bg font-mono font-bold text-xs tracking-widest hover:bg-terminal-gold/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isGenerating ? (
                <span className="flex items-center gap-2">
                  <span className="pulse-gold">◆</span> GENERATING...
                </span>
              ) : (
                '◆ GENERATE BRIEF'
              )}
            </button>
          )}
        </div>
      </div>
    </header>
  )
}
