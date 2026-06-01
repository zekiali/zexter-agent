'use client'
import { assessActualVsEstimate } from '@/lib/calendarUtils'

const DAY_TYPE_CONFIG = {
  'A+':  { color: 'text-terminal-gold',   bg: 'bg-terminal-gold/10',   border: 'border-terminal-gold',   glow: 'glow-gold',  label: 'A+ DAY' },
  'A':   { color: 'text-terminal-green',  bg: 'bg-terminal-green/10',  border: 'border-terminal-green',  glow: 'glow-green', label: 'A DAY' },
  'B':   { color: 'text-terminal-cyan',   bg: 'bg-terminal-cyan/10',   border: 'border-terminal-cyan',   glow: 'glow-cyan',  label: 'B DAY' },
  'C':   { color: 'text-terminal-muted',  bg: 'bg-terminal-muted/10',  border: 'border-terminal-muted',  glow: '',           label: 'C DAY' },
  'F':   { color: 'text-terminal-red',    bg: 'bg-terminal-red/10',    border: 'border-terminal-red',    glow: 'glow-red',   label: 'F — FOMC' },
  'MAG7':{ color: 'text-terminal-green',  bg: 'bg-terminal-green/10',  border: 'border-terminal-green',  glow: 'glow-green', label: 'MAG7 EARNINGS' },
}

const PRIORITY_CONFIG = {
  critical: { color: 'bg-terminal-gold', text: 'text-terminal-bg', label: 'text-terminal-gold' },
  high:     { color: 'bg-terminal-green', text: 'text-terminal-bg', label: 'text-terminal-green' },
  medium:   { color: 'bg-terminal-cyan', text: 'text-terminal-bg', label: 'text-terminal-cyan' },
  low:      { color: 'bg-terminal-muted', text: 'text-terminal-bg', label: 'text-terminal-muted' },
  avoid:    { color: 'bg-terminal-red', text: 'text-white', label: 'text-terminal-red' },
}

function DayTypeCard({ dayType, reason, dataSource }) {
  const cfg = DAY_TYPE_CONFIG[dayType] || DAY_TYPE_CONFIG['C']
  return (
    <div className={`card ${cfg.border} border ${cfg.glow} p-6 h-full flex flex-col justify-between`}>
      <div>
        <p className="text-terminal-muted text-[10px] tracking-widest mb-3">DAY CLASSIFICATION</p>
        <div className={`font-display text-8xl ${cfg.color} leading-none mb-4`}>{dayType}</div>
        <p className={`text-sm leading-relaxed ${cfg.color}`}>{reason}</p>
      </div>
      {dataSource && (
        <div className="mt-4 pt-4 border-t border-terminal-border">
          <span className="text-[9px] text-terminal-muted tracking-widest">
            SOURCE: <span className="text-terminal-gold">{dataSource.toUpperCase()}</span>
          </span>
        </div>
      )}
    </div>
  )
}

function BriefTextCard({ text }) {
  if (!text) return null
  const paragraphs = text.split('\n').filter(p => p.trim())
  return (
    <div className="card p-6 h-full">
      <p className="text-terminal-muted text-[10px] tracking-widest mb-4">INTELLIGENCE BRIEF</p>
      <div className="space-y-3">
        {paragraphs.map((p, i) => (
          <p key={i} className="text-terminal-text text-sm leading-relaxed">{p}</p>
        ))}
      </div>
    </div>
  )
}

function WarningFlags({ flags }) {
  if (!flags || flags.length === 0) return null
  return (
    <div className="card border-terminal-red border p-4 glow-red">
      <p className="text-terminal-red text-[10px] tracking-widest font-bold mb-3">⚠ WARNING FLAGS</p>
      <ul className="space-y-1">
        {flags.map((f, i) => (
          <li key={i} className="text-terminal-red text-xs flex items-start gap-2">
            <span>▸</span><span>{f}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function CatalystCard({ catalyst }) {
  if (!catalyst) return null
  const sentiment = catalyst.actual && catalyst.consensus
    ? assessActualVsEstimate(catalyst.actual, catalyst.consensus)
    : null

  const sentimentConfig = {
    HOT: { color: 'text-terminal-red', bg: 'bg-terminal-red/10 border-terminal-red', icon: '▲' },
    COOL: { color: 'text-terminal-green', bg: 'bg-terminal-green/10 border-terminal-green', icon: '▼' },
    'IN-LINE': { color: 'text-terminal-muted', bg: 'bg-terminal-muted/10 border-terminal-muted', icon: '─' },
  }
  const sc = sentimentConfig[sentiment] || null

  const tierLabel = {
    tier1:            { text: 'TIER 1',       color: 'text-terminal-gold' },
    tier2:            { text: 'TIER 2',       color: 'text-terminal-cyan' },
    tier2_econ:       { text: 'TIER 2 ECON',  color: 'text-terminal-cyan' },
    tier2_fed:        { text: 'TIER 2 FED',   color: 'text-terminal-purple' },
    fomc:             { text: 'FOMC',         color: 'text-terminal-purple' },
    fed_minutes:      { text: 'FED MINUTES',  color: 'text-terminal-purple' },
    fed_speaker:      { text: 'FED SPEAKER',  color: 'text-purple-400' },
    tier3_opex:       { text: 'OPEX',         color: 'text-terminal-orange' },
    opex:             { text: 'OPEX',         color: 'text-terminal-orange' },
    tier3_earnings:   { text: 'MAG7',         color: 'text-terminal-green' },
    mag7:             { text: 'MAG7',         color: 'text-terminal-green' },
    tier4_geo:        { text: 'GEOPOLITICAL', color: 'text-terminal-red' },
    tier3:            { text: 'TIER 3',       color: 'text-terminal-muted' },
    none:             { text: 'NO CATALYST',  color: 'text-terminal-muted' },
  }[catalyst.impactLevel] || { text: '—', color: 'text-terminal-muted' }

  return (
    <div className="card p-6 space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-terminal-muted text-[10px] tracking-widest mb-1">PRIMARY CATALYST</p>
          <h3 className="text-terminal-gold text-lg font-medium">{catalyst.name}</h3>
          <p className="text-terminal-muted text-xs mt-0.5">
            {catalyst.timeCT} CT / {catalyst.timeET} ET
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <span className={`text-[10px] font-bold tracking-widest ${tierLabel.color}`}>{tierLabel.text}</span>
          {sc && (
            <span className={`text-sm font-bold px-2 py-1 border ${sc.bg} ${sc.color}`}>
              {sc.icon} {sentiment}
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'CONSENSUS', value: catalyst.consensus },
          { label: 'PRIOR', value: catalyst.prior },
          { label: 'ACTUAL', value: catalyst.actual, highlight: true },
        ].map(({ label, value, highlight }) => (
          <div key={label} className="bg-terminal-bg border border-terminal-border p-3">
            <p className="text-terminal-muted text-[9px] tracking-widest">{label}</p>
            <p className={`text-sm font-bold mt-1 ${highlight && value ? 'text-terminal-gold' : 'text-terminal-text'}`}>
              {value ?? '—'}
            </p>
          </div>
        ))}
      </div>

      {catalyst.directionNote && (
        <div className="bg-terminal-bg border border-terminal-border p-3">
          <p className="text-terminal-muted text-[9px] tracking-widest mb-1">DIRECTION NOTE</p>
          <p className="text-terminal-text text-sm">{catalyst.directionNote}</p>
        </div>
      )}

      {catalyst.historicalStats && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {[
            { label: 'BULL SCENARIO', text: catalyst.historicalStats.upScenario, color: 'border-terminal-green text-terminal-green' },
            { label: 'BEAR SCENARIO', text: catalyst.historicalStats.downScenario, color: 'border-terminal-red text-terminal-red' },
            { label: 'NEUTRAL', text: catalyst.historicalStats.neutralScenario, color: 'border-terminal-muted text-terminal-muted' },
          ].map(({ label, text, color }) => (
            <div key={label} className={`bg-terminal-bg border ${color.split(' ')[0]} border-l-2 p-3`}>
              <p className={`text-[9px] font-bold tracking-widest mb-1 ${color.split(' ')[1]}`}>{label}</p>
              <p className="text-terminal-text text-xs leading-relaxed">{text || '—'}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function TimeWindowsCard({ windows }) {
  if (!windows || windows.length === 0) return null

  return (
    <div className="card p-6 space-y-3">
      <p className="text-terminal-muted text-[10px] tracking-widest">TIME WINDOWS</p>
      <div className="space-y-2">
        {windows.map((w, i) => {
          const cfg = PRIORITY_CONFIG[w.priority] || PRIORITY_CONFIG.low
          return (
            <div key={i} className="flex items-start gap-3">
              <span className="text-terminal-muted text-xs w-20 shrink-0 font-mono">{w.timeCT}</span>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className={`h-1.5 w-1.5 rounded-full ${cfg.color}`} />
                  <span className={`text-xs font-bold ${cfg.label}`}>{w.label}</span>
                </div>
                <p className="text-terminal-muted text-[10px] leading-snug">{w.note}</p>
              </div>
            </div>
          )
        })}
      </div>
      <div className="flex flex-wrap gap-3 pt-2 border-t border-terminal-border">
        {Object.entries(PRIORITY_CONFIG).map(([key, cfg]) => (
          <div key={key} className="flex items-center gap-1.5">
            <span className={`h-2 w-2 rounded-full ${cfg.color}`} />
            <span className="text-terminal-muted text-[9px] uppercase tracking-wider">{key}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function TradeParamsCard({ params, dayType }) {
  if (!params) return null
  const cfg = DAY_TYPE_CONFIG[dayType] || DAY_TYPE_CONFIG['C']
  const dollarPerPt = (params.contracts || 0) * 2
  const dailyMaxLoss = params.dailyMaxLoss
    ?? ({ 'A+': 200, 'A': 200, 'B': 100 }[dayType] ?? null)

  return (
    <div className="card p-6 space-y-4">
      <p className="text-terminal-muted text-[10px] tracking-widest">TRADE PARAMETERS</p>

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'CONTRACTS', value: params.contracts, accent: cfg.color },
          { label: 'STOP PTS', value: params.stopPts, accent: 'text-terminal-red' },
          { label: 'MIN TARGET', value: params.minTargetPts, accent: 'text-terminal-green' },
        ].map(({ label, value, accent }) => (
          <div key={label} className="bg-terminal-bg border border-terminal-border p-3 text-center">
            <p className="text-terminal-muted text-[9px] tracking-widest">{label}</p>
            <p className={`text-3xl font-display mt-1 ${accent}`}>{value ?? '—'}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs">
        {[
          { label: 'RVOL THRESHOLD', value: `${params.rvolThreshold || 2.0}x` },
          { label: 'MCDX THRESHOLD', value: params.mcdxThreshold || 10 },
          { label: 'MAX TRADES', value: params.maxTrades || 3 },
          { label: 'TRAIL AFTER', value: `${params.trailAfterPts || 70} pts` },
          { label: '$/PT VALUE', value: `$${dollarPerPt}` },
          { label: 'DAILY MAX LOSS', value: dailyMaxLoss != null ? `$${dailyMaxLoss}` : 'N/A' },
          { label: 'TRADING WINDOW', value: params.tradingWindow || '8:30–10:00 CT' },
        ].map(({ label, value }) => (
          <div key={label} className={`flex items-center justify-between bg-terminal-bg border px-3 py-2 ${label === 'DAILY MAX LOSS' ? 'border-terminal-red/40' : 'border-terminal-border'}`}>
            <span className={`text-[9px] tracking-wider ${label === 'DAILY MAX LOSS' ? 'text-terminal-red' : 'text-terminal-muted'}`}>{label}</span>
            <span className={`font-medium text-[10px] ${label === 'DAILY MAX LOSS' ? 'text-terminal-red font-bold' : 'text-terminal-text'}`}>{value}</span>
          </div>
        ))}
      </div>

      {params.pmReentry !== undefined && (
        <div className={`flex items-center gap-2 px-3 py-2 border ${
          params.pmReentry
            ? 'border-terminal-cyan bg-terminal-cyan/5 text-terminal-cyan'
            : 'border-terminal-muted bg-terminal-muted/5 text-terminal-muted'
        }`}>
          <span className="text-[10px] font-bold tracking-wider">
            PM RE-ENTRY: {params.pmReentry ? 'ELIGIBLE' : 'BLOCKED'}
          </span>
          {params.pmReentryNote && (
            <span className="text-[9px] ml-1">— {params.pmReentryNote}</span>
          )}
        </div>
      )}
    </div>
  )
}

function ConfirmationCard({ checklist, params }) {
  return null // Rendered in main page for state management
}

function AdditionalEventsCard({ events }) {
  if (!events || events.length === 0) return null
  return (
    <div className="card p-6 space-y-3">
      <p className="text-terminal-muted text-[10px] tracking-widest">ADDITIONAL EVENTS</p>
      <div className="space-y-2">
        {events.map((ev, i) => {
          const impactColor = {
            high: 'text-terminal-gold',
            medium: 'text-terminal-cyan',
            low: 'text-terminal-muted',
          }[ev.impact] || 'text-terminal-muted'
          return (
            <div key={i} className="flex items-start gap-3 py-2 border-b border-terminal-border/50 last:border-0">
              <span className={`text-[9px] font-bold w-16 shrink-0 ${impactColor}`}>
                {ev.timeCT}
              </span>
              <div className="flex-1">
                <p className="text-terminal-text text-xs">{ev.name}</p>
                {ev.note && <p className="text-terminal-muted text-[9px] mt-0.5">{ev.note}</p>}
              </div>
              <span className={`text-[9px] font-bold ${impactColor}`}>
                {(ev.impact || '').toUpperCase()}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function PMWatchCard({ pmWatch }) {
  if (!pmWatch) return null
  return (
    <div className="card border-terminal-purple border p-6">
      <p className="text-terminal-purple text-[10px] tracking-widest font-bold mb-3">◆ PM WATCH</p>
      <p className="text-terminal-text text-sm leading-relaxed">{pmWatch}</p>
    </div>
  )
}

function OvernightCard({ context }) {
  if (!context) return null
  return (
    <div className="card p-6">
      <p className="text-terminal-muted text-[10px] tracking-widest mb-3">OVERNIGHT CONTEXT</p>
      <p className="text-terminal-text text-sm leading-relaxed">{context}</p>
    </div>
  )
}

export {
  DayTypeCard,
  BriefTextCard,
  WarningFlags,
  CatalystCard,
  TimeWindowsCard,
  TradeParamsCard,
  AdditionalEventsCard,
  PMWatchCard,
  OvernightCard,
}
