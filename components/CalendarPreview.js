'use client'
import { getTierBadge, assessActualVsEstimate } from '@/lib/calendarUtils'

function EventCard({ event }) {
  const badge = getTierBadge(event.tier)
  const sentiment = event.actual != null && event.estimate != null
    ? assessActualVsEstimate(event.actual, event.estimate)
    : null

  const borderColor = {
    tier1: 'border-terminal-gold',
    tier2: 'border-terminal-cyan',
    fomc: 'border-terminal-purple',
    tier3: 'border-terminal-muted',
  }[event.tier] || 'border-terminal-muted'

  const sentimentColor = {
    HOT: 'text-terminal-red bg-terminal-red/10',
    COOL: 'text-terminal-green bg-terminal-green/10',
    'IN-LINE': 'text-terminal-muted bg-terminal-muted/10',
  }[sentiment] || ''

  return (
    <div className={`card border-l-2 ${borderColor} p-3 space-y-2`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-terminal-text text-xs font-medium leading-tight">{event.name}</p>
          <p className="text-terminal-muted text-[10px] mt-0.5">
            {event.timeCT} CT / {event.timeET} ET
          </p>
        </div>
        <span className={`text-[9px] font-bold px-1.5 py-0.5 shrink-0 ${badge.color}`}>
          {badge.label}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-1 text-[10px]">
        <div>
          <span className="text-terminal-muted block">CONS</span>
          <span className="text-terminal-text">{event.estimate ?? '—'}</span>
        </div>
        <div>
          <span className="text-terminal-muted block">PRIOR</span>
          <span className="text-terminal-text">{event.prev ?? '—'}</span>
        </div>
        <div>
          <span className="text-terminal-muted block">ACTUAL</span>
          <span className={event.actual != null ? 'text-terminal-gold font-bold' : 'text-terminal-text'}>
            {event.actual ?? '—'}
          </span>
        </div>
      </div>

      {sentiment && (
        <div className={`text-[9px] font-bold px-2 py-0.5 inline-block ${sentimentColor}`}>
          {sentiment}
        </div>
      )}
    </div>
  )
}

export default function CalendarPreview({ events, onGenerateBrief, isGenerating }) {
  if (!events || events.length === 0) return null

  const tier1 = events.filter(e => e.tier === 'tier1')
  const fomc = events.filter(e => e.tier === 'fomc')
  const other = events.filter(e => e.tier !== 'tier1' && e.tier !== 'fomc')

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-terminal-gold font-display text-xl tracking-widest">
          ECONOMIC CALENDAR
        </h2>
        <span className="text-terminal-muted text-[10px]">
          {events.length} US EVENTS
        </span>
      </div>

      {fomc.length > 0 && (
        <div>
          <p className="text-terminal-purple text-[10px] font-bold tracking-widest mb-2">◆ FOMC</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {fomc.map((ev, i) => <EventCard key={i} event={ev} />)}
          </div>
        </div>
      )}

      {tier1.length > 0 && (
        <div>
          <p className="text-terminal-gold text-[10px] font-bold tracking-widest mb-2">◆ TIER 1</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {tier1.map((ev, i) => <EventCard key={i} event={ev} />)}
          </div>
        </div>
      )}

      {other.length > 0 && (
        <div>
          <p className="text-terminal-cyan text-[10px] font-bold tracking-widest mb-2">◆ SECONDARY</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {other.map((ev, i) => <EventCard key={i} event={ev} />)}
          </div>
        </div>
      )}

      <div className="pt-2">
        <button
          onClick={onGenerateBrief}
          disabled={isGenerating}
          className="w-full py-3 bg-terminal-gold text-terminal-bg font-bold text-sm tracking-widest hover:bg-terminal-gold/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {isGenerating ? (
            <span className="flex items-center justify-center gap-2">
              <span className="pulse-gold">◆</span> GENERATING INTELLIGENCE BRIEF...
            </span>
          ) : (
            '◆ GENERATE INTELLIGENCE BRIEF'
          )}
        </button>
      </div>
    </div>
  )
}
