'use client'
import { getTierBadge, assessActualVsEstimate } from '@/lib/calendarUtils'

const BORDER_BY_TIER = {
  mag7:       'border-terminal-green',
  fomc:       'border-terminal-purple',
  fed_minutes:'border-terminal-purple',
  fed_speaker:'border-purple-400',
  tier1:      'border-terminal-gold',
  opex:       'border-terminal-orange',
  tier2:      'border-terminal-cyan',
  tier3:      'border-terminal-muted',
}

function EventCard({ event }) {
  const badge = getTierBadge(event.tier)
  const borderColor = BORDER_BY_TIER[event.tier] || 'border-terminal-muted'
  const sentiment = event.actual != null && event.estimate != null
    ? assessActualVsEstimate(event.actual, event.estimate)
    : null
  const sentimentColor = {
    HOT:      'text-terminal-red bg-terminal-red/10',
    COOL:     'text-terminal-green bg-terminal-green/10',
    'IN-LINE':'text-terminal-muted bg-terminal-muted/10',
  }[sentiment] || ''

  return (
    <div className={`card border-l-2 ${borderColor} p-3 space-y-2`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-terminal-text text-xs font-medium leading-tight">{event.name}</p>
          <p className="text-terminal-muted text-[10px] mt-0.5">
            {event.timeCT !== 'TBA' ? `${event.timeCT} CT / ${event.timeET} ET` : event.timeET}
          </p>
        </div>
        <span className={`text-[9px] font-bold px-1.5 py-0.5 shrink-0 ${badge.color}`}>
          {badge.label}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-1 text-[10px]">
        <div>
          <span className="text-terminal-muted block">CONS/EST</span>
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
        <span className={`text-[9px] font-bold px-2 py-0.5 inline-block ${sentimentColor}`}>
          {sentiment}
        </span>
      )}
    </div>
  )
}

const SECTIONS = [
  { key: 'mag7',        label: 'MAG7 EARNINGS',  labelColor: 'text-terminal-green' },
  { key: 'fomc',        label: 'FOMC',            labelColor: 'text-terminal-purple' },
  { key: 'fed_minutes', label: 'FED MINUTES',     labelColor: 'text-terminal-purple' },
  { key: 'fed_speaker', label: 'FED SPEAKER',     labelColor: 'text-purple-400' },
  { key: 'tier1',       label: 'TIER 1',          labelColor: 'text-terminal-gold' },
  { key: 'opex',        label: 'OPTIONS EXPIRATION', labelColor: 'text-terminal-orange' },
  { key: 'tier2',       label: 'TIER 2',          labelColor: 'text-terminal-cyan' },
  { key: 'tier3',       label: 'SECONDARY',       labelColor: 'text-terminal-muted' },
]

export default function CalendarPreview({ events, onGenerateBrief, isGenerating }) {
  if (!events || events.length === 0) return null

  const byTier = {}
  for (const ev of events) {
    if (!byTier[ev.tier]) byTier[ev.tier] = []
    byTier[ev.tier].push(ev)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-terminal-gold font-display text-xl tracking-widest">
          ECONOMIC CALENDAR
        </h2>
        <span className="text-terminal-muted text-[10px]">
          {events.length} EVENTS
        </span>
      </div>

      {SECTIONS.map(({ key, label, labelColor }) => {
        const evs = byTier[key]
        if (!evs || evs.length === 0) return null
        return (
          <div key={key}>
            <p className={`${labelColor} text-[10px] font-bold tracking-widest mb-2`}>◆ {label}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {evs.map((ev, i) => <EventCard key={i} event={ev} />)}
            </div>
          </div>
        )
      })}

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
