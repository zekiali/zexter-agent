'use client'
import { useState, useEffect } from 'react'
import Header from '@/components/Header'
import CalendarPreview from '@/components/CalendarPreview'
import TradeLog from '@/components/TradeLog'
import AccountMonitor from '@/components/AccountMonitor'
import {
  DayTypeCard,
  BriefTextCard,
  WarningFlags,
  CatalystCard,
  TimeWindowsCard,
  TradeParamsCard,
  AdditionalEventsCard,
  PMWatchCard,
  OvernightCard,
} from '@/components/BriefDisplay'

function PostSessionReview({
  review, setReview,
  isSavingReview, reviewSaved, reviewError,
  isAnalyzing, sessionAnalysis, analyzeError,
  saveReview, analyzeSession,
  todayCT, noBrief,
}) {
  const formattedDate = new Date(todayCT + 'T12:00:00').toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric',
  })
  return (
    <div className="card border-terminal-purple border p-6 space-y-4">
      <p className="text-terminal-purple text-[10px] tracking-widest font-bold">◆ POST-SESSION REVIEW</p>
      {noBrief && (
        <p className="text-terminal-muted text-xs">No brief was generated today — you can still log a manual review.</p>
      )}

      <div className="space-y-3">
        <div>
          <label className="text-terminal-muted text-[9px] tracking-widest block mb-1">WHAT ACTUALLY HAPPENED TODAY</label>
          <textarea
            value={review.notes}
            onChange={e => setReview(r => ({ ...r, notes: e.target.value }))}
            rows={4}
            placeholder="Describe what the market did, any catalysts that played out, how NQ moved..."
            className="w-full bg-terminal-bg border border-terminal-border text-terminal-text px-3 py-2 text-xs focus:outline-none focus:border-terminal-purple resize-none"
          />
        </div>

        <div>
          <label className="text-terminal-muted text-[9px] tracking-widest block mb-1">RULES FOLLOWED?</label>
          <div className="flex gap-2">
            {[{ val: true, label: 'YES', cls: 'border-terminal-green text-terminal-green bg-terminal-green/10' },
              { val: false, label: 'NO', cls: 'border-terminal-red text-terminal-red bg-terminal-red/10' }].map(({ val, label, cls }) => (
              <button
                key={label}
                onClick={() => setReview(r => ({ ...r, rulesFollowed: r.rulesFollowed === val ? null : val }))}
                className={`px-4 py-1.5 border text-xs font-bold tracking-widest transition-colors ${
                  review.rulesFollowed === val ? cls : 'border-terminal-border text-terminal-muted hover:border-terminal-muted'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-terminal-muted text-[9px] tracking-widest block mb-1">RULES BROKEN (if any)</label>
          <textarea
            value={review.rulesBroken}
            onChange={e => setReview(r => ({ ...r, rulesBroken: e.target.value }))}
            rows={2}
            placeholder="List any rules broken today..."
            className="w-full bg-terminal-bg border border-terminal-border text-terminal-text px-3 py-2 text-xs focus:outline-none focus:border-terminal-purple resize-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-terminal-muted text-[9px] tracking-widest block mb-1">ACTUAL DAY TYPE (HINDSIGHT)</label>
            <select
              value={review.actualDayType}
              onChange={e => setReview(r => ({ ...r, actualDayType: e.target.value }))}
              className="w-full bg-terminal-bg border border-terminal-border text-terminal-text px-2 py-1.5 text-xs focus:outline-none focus:border-terminal-purple"
            >
              <option value="">Select...</option>
              {['A+', 'A', 'B', 'C', 'Missed Opportunity'].map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-terminal-muted text-[9px] tracking-widest block mb-1">ACTUAL NQ RANGE (PTS)</label>
            <input
              type="number"
              value={review.actualNQRange}
              onChange={e => setReview(r => ({ ...r, actualNQRange: e.target.value }))}
              placeholder="300"
              className="w-full bg-terminal-bg border border-terminal-border text-terminal-text px-3 py-2 text-xs focus:outline-none focus:border-terminal-purple"
            />
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={saveReview}
            disabled={isSavingReview}
            className="flex-1 py-2 bg-terminal-surface border border-terminal-purple text-terminal-purple text-xs font-bold tracking-widest hover:bg-terminal-purple/10 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSavingReview && <span className="w-3 h-3 border border-terminal-purple/40 border-t-terminal-purple rounded-full animate-spin" />}
            {isSavingReview ? 'SAVING...' : '◆ SAVE REVIEW'}
          </button>
          <button
            onClick={analyzeSession}
            disabled={isAnalyzing}
            className="flex-1 py-2 bg-terminal-purple text-white text-xs font-bold tracking-widest hover:bg-terminal-purple/90 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isAnalyzing && <span className="w-3 h-3 border border-white/40 border-t-white rounded-full animate-spin" />}
            {isAnalyzing ? 'ANALYZING...' : '◆ ANALYZE SESSION'}
          </button>
        </div>

        {reviewSaved && (
          <p className="text-terminal-green text-xs font-bold tracking-wider">
            ◆ REVIEW SAVED — {formattedDate}
          </p>
        )}
        {reviewError && (
          <p className="text-terminal-red text-xs">✗ SAVE FAILED: {reviewError}</p>
        )}
      </div>

      {(sessionAnalysis || analyzeError) && (
        <div className="border-t border-terminal-border pt-4 space-y-3">
          <p className="text-terminal-purple text-[10px] tracking-widest font-bold">SESSION ANALYSIS</p>
          {analyzeError && <p className="text-terminal-red text-xs">✗ {analyzeError}</p>}
          {sessionAnalysis && sessionAnalysis.split('\n').filter(p => p.trim()).map((p, i) => (
            <p key={i} className="text-terminal-text text-sm leading-relaxed">{p}</p>
          ))}
        </div>
      )}
    </div>
  )
}

function Spinner() {
  return (
    <div className="flex items-center justify-center py-16">
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 border-2 border-terminal-gold/20 rounded-full" />
        <div className="absolute inset-0 border-2 border-transparent border-t-terminal-gold rounded-full animate-spin" />
      </div>
      <span className="ml-4 text-terminal-gold text-sm tracking-wider pulse-gold">GENERATING BRIEF...</span>
    </div>
  )
}

export default function Dashboard() {
  const [showSettings, setShowSettings] = useState(false)
  const [finnhubKey, setFinnhubKey] = useState('')
  const [calendarStatus, setCalendarStatus] = useState('idle') // idle | loading | loaded | error
  const [calendarEvents, setCalendarEvents] = useState([])
  const [calendarError, setCalendarError] = useState(null)
  const [brief, setBrief] = useState(null)
  const [briefId, setBriefId] = useState(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generateError, setGenerateError] = useState(null)
  const [rvol, setRvol] = useState('')
  const [mcdx, setMcdx] = useState('')
  const [checklist, setChecklist] = useState({})
  const [isAfterPM, setIsAfterPM] = useState(false)
  const [review, setReview] = useState({ notes: '', rulesBroken: '', rulesFollowed: null, actualDayType: '', actualNQRange: '' })
  const [isSavingReview, setIsSavingReview] = useState(false)
  const [reviewSaved, setReviewSaved] = useState(false)
  const [reviewError, setReviewError] = useState(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [sessionAnalysis, setSessionAnalysis] = useState(null)
  const [analyzeError, setAnalyzeError] = useState(null)

  // Today's date in CT
  const todayCT = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Chicago',
    year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(new Date())

  // Load calendar on mount
  useEffect(() => {
    setFinnhubKey('')
  }, [])

  // Track whether it's after 2 PM CT for post-session review
  useEffect(() => {
    function checkPM() {
      const hour = parseInt(new Intl.DateTimeFormat('en-US', {
        timeZone: 'America/Chicago',
        hour: 'numeric',
        hour12: false,
      }).format(new Date()))
      setIsAfterPM(hour >= 14)
    }
    checkPM()
    const id = setInterval(checkPM, 60000)
    return () => clearInterval(id)
  }, [])

  async function fetchCalendar() {
    setCalendarStatus('loading')
    setCalendarError(null)
    try {
      const res = await fetch('/api/calendar')
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Calendar fetch failed')
      setCalendarEvents(data.events || [])
      setCalendarStatus('loaded')
    } catch (e) {
      setCalendarError(e.message)
      setCalendarStatus('error')
    }
  }

  async function generateBrief() {
    setIsGenerating(true)
    setGenerateError(null)
    try {
      const now = new Date()
      const res = await fetch('/api/brief', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          calendarEvents,
          date: todayCT,
          time: now.toLocaleTimeString('en-US', { timeZone: 'America/Chicago' }),
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Brief generation failed')
      setBrief(data.brief)
      setBriefId(data.id)
      // Init checklist from brief
      if (data.brief?.confirmationChecklist) {
        const init = {}
        data.brief.confirmationChecklist.forEach(item => { init[item.id] = false })
        setChecklist(init)
      }
    } catch (e) {
      setGenerateError(e.message)
    } finally {
      setIsGenerating(false)
    }
  }

  async function saveReview() {
    setIsSavingReview(true)
    setReviewError(null)
    setReviewSaved(false)
    try {
      const res = await fetch('/api/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ briefId, date: todayCT, ...review }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Save failed')
      setReviewSaved(true)
    } catch (e) {
      setReviewError(e.message)
    } finally {
      setIsSavingReview(false)
    }
  }

  async function analyzeSession() {
    setIsAnalyzing(true)
    setSessionAnalysis(null)
    setAnalyzeError(null)
    try {
      const res = await fetch('/api/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ briefId, date: todayCT, ...review, action: 'analyze' }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Analysis failed')
      setSessionAnalysis(data.analysis)
    } catch (e) {
      setAnalyzeError(e.message)
    } finally {
      setIsAnalyzing(false)
    }
  }

  // GO/NO-GO signal
  function goSignal() {
    if (!brief?.tradeParams) return null
    const rvolNum = parseFloat(rvol)
    const mcdxNum = parseFloat(mcdx)
    const rvolMet = !isNaN(rvolNum) && rvolNum >= (brief.tradeParams.rvolThreshold || 2.0)
    const mcdxMet = !isNaN(mcdxNum) && mcdxNum >= (brief.tradeParams.mcdxThreshold || 10)
    if (rvol === '' && mcdx === '') return null
    if (rvolMet && mcdxMet) return 'GO'
    if (!rvolMet && !mcdxMet) return 'NOGO'
    return 'PARTIAL'
  }

  const signal = goSignal()

  const signalConfig = {
    GO: { label: '◆ GO — EXECUTE SETUP', color: 'bg-terminal-green/10 border-terminal-green text-terminal-green glow-green' },
    NOGO: { label: '✕ NO-GO — STAND ASIDE', color: 'bg-terminal-red/10 border-terminal-red text-terminal-red glow-red' },
    PARTIAL: { label: '◐ PARTIAL — WAIT FOR BOTH', color: 'bg-terminal-orange/10 border-terminal-orange text-terminal-orange' },
  }

  return (
    <div className="min-h-screen bg-terminal-bg">
      <Header
        onSettingsToggle={() => setShowSettings(s => !s)}
        onGenerateBrief={generateBrief}
        isGenerating={isGenerating}
      />

      <main className="max-w-screen-2xl mx-auto px-4 py-6 space-y-6">

        {/* Settings Panel */}
        {showSettings && (
          <div className="card p-6 space-y-4">
            <p className="text-terminal-muted text-[10px] tracking-widest">SETTINGS</p>
            <div className="flex flex-col sm:flex-row gap-3 max-w-xl">
              <div className="flex-1">
                <label className="text-terminal-muted text-[9px] tracking-widest block mb-1">FINNHUB API KEY</label>
                <input
                  type="password"
                  value={finnhubKey}
                  onChange={e => setFinnhubKey(e.target.value)}
                  placeholder="d8dpevpr01..."
                  className="w-full bg-terminal-bg border border-terminal-border text-terminal-text px-3 py-2 text-xs focus:outline-none focus:border-terminal-gold"
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={fetchCalendar}
                  disabled={calendarStatus === 'loading'}
                  className="px-4 py-2 bg-terminal-surface border border-terminal-gold text-terminal-gold text-xs font-bold tracking-widest hover:bg-terminal-gold/10 disabled:opacity-50 whitespace-nowrap"
                >
                  {calendarStatus === 'loading' ? 'FETCHING...' : 'FETCH CALENDAR'}
                </button>
              </div>
            </div>
            {calendarError && (
              <p className="text-terminal-red text-xs">Error: {calendarError}</p>
            )}
          </div>
        )}

        {/* Calendar Status Bar */}
        <div className="flex items-center gap-3 px-4 py-2.5 bg-terminal-surface border border-terminal-border">
          {calendarStatus === 'idle' && (
            <>
              <span className="h-2 w-2 rounded-full bg-terminal-muted" />
              <span className="text-terminal-muted text-xs tracking-wider">
                CALENDAR NOT LOADED — Click Settings to fetch Finnhub calendar or Generate Brief for web search fallback
              </span>
            </>
          )}
          {calendarStatus === 'loading' && (
            <>
              <span className="h-2 w-2 rounded-full bg-terminal-gold pulse-gold" />
              <span className="text-terminal-gold text-xs tracking-wider">FETCHING CALENDAR FROM FINNHUB...</span>
            </>
          )}
          {calendarStatus === 'loaded' && calendarEvents.length > 0 && (
            <>
              <span className="h-2 w-2 rounded-full bg-terminal-green" />
              <span className="text-terminal-green text-xs tracking-wider">
                CALENDAR LOADED — {calendarEvents.length} US EVENTS (FINNHUB)
              </span>
            </>
          )}
          {calendarStatus === 'loaded' && calendarEvents.length === 0 && (
            <>
              <span className="h-2 w-2 rounded-full bg-terminal-gold" />
              <span className="text-terminal-gold text-xs tracking-wider">
                FINNHUB: 0 EVENTS — BRIEF WILL USE WEB SEARCH
              </span>
            </>
          )}
          {calendarStatus === 'error' && (
            <>
              <span className="h-2 w-2 rounded-full bg-terminal-red" />
              <span className="text-terminal-red text-xs tracking-wider">CALENDAR ERROR — Brief will use web search fallback</span>
              <span className="text-terminal-cyan text-[10px] ml-2">◯ WEB SEARCH FALLBACK</span>
            </>
          )}

          {/* Auto-fetch button */}
          {calendarStatus === 'idle' && (
            <button
              onClick={fetchCalendar}
              className="ml-auto text-terminal-gold text-[10px] tracking-wider hover:text-terminal-gold/80 border border-terminal-gold/30 px-2 py-0.5"
            >
              FETCH NOW
            </button>
          )}
        </div>

        {/* Calendar Preview */}
        {calendarStatus === 'loaded' && calendarEvents.length > 0 && !brief && (
          <CalendarPreview
            events={calendarEvents}
            onGenerateBrief={generateBrief}
            isGenerating={isGenerating}
          />
        )}

        {/* Generate Error */}
        {generateError && (
          <div className="card border-terminal-red border p-4">
            <p className="text-terminal-red text-xs">⚠ Brief generation error: {generateError}</p>
            <button
              onClick={generateBrief}
              className="mt-2 text-terminal-gold text-xs hover:underline"
            >
              Retry
            </button>
          </div>
        )}

        {/* Loading */}
        {isGenerating && <Spinner />}

        {/* ── BRIEF SECTIONS ── */}
        {brief && !isGenerating && (
          <div className="space-y-6">

            {/* Warning Flags */}
            {brief.warningFlags?.length > 0 && (
              <WarningFlags flags={brief.warningFlags} />
            )}

            {/* MAG7 Earnings Alert */}
            {brief.mag7EarningsAlert && (
              <div className="card border-terminal-gold border-l-4 border p-5 glow-gold">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-terminal-gold text-xs font-bold tracking-widest">◆ MAG7 EARNINGS ALERT</span>
                  <span className="text-terminal-gold/50 text-[9px] bg-terminal-gold/10 px-2 py-0.5">A+ SETUP POTENTIAL</span>
                </div>
                <p className="text-terminal-text text-sm leading-relaxed">{brief.mag7EarningsAlert}</p>
              </div>
            )}

            {/* OpEx Alert */}
            {brief.opexAlert && (
              <div className="card border-terminal-cyan border-l-4 border p-5 glow-cyan">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-terminal-cyan text-xs font-bold tracking-widest">◈ OPTIONS EXPIRATION DAY</span>
                  <span className="text-terminal-cyan/50 text-[9px] bg-terminal-cyan/10 px-2 py-0.5">B-DAY TREATMENT</span>
                </div>
                <p className="text-terminal-text text-sm leading-relaxed">{brief.opexAlert}</p>
              </div>
            )}

            {/* Geopolitical Alert */}
            {brief.geopoliticalAlert && (
              <div className="card border-terminal-red border-l-4 border p-5 glow-red">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-terminal-red text-xs font-bold tracking-widest">⚠ GEOPOLITICAL/MACRO ALERT</span>
                  <span className="text-terminal-red/50 text-[9px] bg-terminal-red/10 px-2 py-0.5">UNSCHEDULED</span>
                </div>
                <p className="text-terminal-text text-sm leading-relaxed">{brief.geopoliticalAlert}</p>
              </div>
            )}

            {/* Confluence Alert */}
            {brief.confluenceAlert && (
              <div className="card border-terminal-gold border-l-4 border p-5 glow-gold">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-terminal-gold text-xs font-bold tracking-widest">◆ CONFLUENCE DETECTED — MULTIPLE SIGNALS ALIGNED</span>
                  {brief.confluenceAlert.upgradeApplied && (
                    <span className="text-terminal-gold/60 text-[9px] bg-terminal-gold/10 px-2 py-0.5 font-bold">
                      UPGRADE: {brief.confluenceAlert.upgradeApplied}
                    </span>
                  )}
                </div>
                {brief.confluenceAlert.summary && (
                  <p className="text-terminal-text text-sm leading-relaxed mb-3">{brief.confluenceAlert.summary}</p>
                )}
                {brief.confluenceAlert.factors?.length > 0 && (
                  <ul className="space-y-1 mb-3">
                    {brief.confluenceAlert.factors.map((f, i) => (
                      <li key={i} className="text-terminal-gold text-xs flex items-start gap-2">
                        <span className="shrink-0">▸</span><span>{f}</span>
                      </li>
                    ))}
                  </ul>
                )}
                <p className="text-terminal-muted text-[10px] tracking-wider border-t border-terminal-border/50 pt-2">
                  When 3+ signals align, upgrade day type by one level
                </p>
              </div>
            )}

            {/* Day Type + Brief Text */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <DayTypeCard
                dayType={brief.dayType}
                reason={brief.dayTypeReason}
                dataSource={calendarEvents.length > 0 ? 'finnhub + web search' : 'web search'}
              />
              <BriefTextCard text={brief.brief} />
            </div>

            {/* Primary Catalyst */}
            {brief.primaryCatalyst && brief.primaryCatalyst.impactLevel !== 'none' && (
              <CatalystCard catalyst={brief.primaryCatalyst} />
            )}

            {/* Time Windows */}
            {brief.timeWindows?.length > 0 && (
              <TimeWindowsCard windows={brief.timeWindows} />
            )}

            {/* Trade Params + Open Confirmation */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {brief.tradeParams && (
                <TradeParamsCard params={brief.tradeParams} dayType={brief.dayType} />
              )}

              {/* Open Confirmation Card */}
              <div className="card p-6 space-y-4">
                <p className="text-terminal-muted text-[10px] tracking-widest">OPEN CONFIRMATION</p>

                <div className="grid grid-cols-2 gap-3">
                  {[
                    {
                      label: `RVOL (need ${brief.tradeParams?.rvolThreshold || 2.0}x)`,
                      key: 'rvol', value: rvol, setter: setRvol,
                      threshold: brief.tradeParams?.rvolThreshold || 2.0,
                    },
                    {
                      label: `MCDX (need ${brief.tradeParams?.mcdxThreshold || 10})`,
                      key: 'mcdx', value: mcdx, setter: setMcdx,
                      threshold: brief.tradeParams?.mcdxThreshold || 10,
                    },
                  ].map(({ label, key, value, setter, threshold }) => {
                    const num = parseFloat(value)
                    const met = !isNaN(num) && num >= threshold
                    return (
                      <div key={key}>
                        <label className="text-terminal-muted text-[9px] tracking-widest block mb-1">{label}</label>
                        <input
                          type="number"
                          step="0.1"
                          value={value}
                          onChange={e => setter(e.target.value)}
                          placeholder="0.0"
                          className={`w-full bg-terminal-bg border text-terminal-text px-3 py-2 text-sm focus:outline-none transition-colors ${
                            value === '' ? 'border-terminal-border' : met ? 'border-terminal-green' : 'border-terminal-red'
                          }`}
                        />
                        {value !== '' && (
                          <p className={`text-[9px] mt-0.5 ${met ? 'text-terminal-green' : 'text-terminal-red'}`}>
                            {met ? '✓ THRESHOLD MET' : `✗ NEED ${threshold - parseFloat(value || 0) > 0 ? (threshold - parseFloat(value)).toFixed(1) : 0} MORE`}
                          </p>
                        )}
                      </div>
                    )
                  })}
                </div>

                {signal && (
                  <div className={`border text-center py-3 px-4 font-bold text-sm tracking-wider ${signalConfig[signal].color}`}>
                    {signalConfig[signal].label}
                  </div>
                )}

                {/* Manual Checklist */}
                {brief.confirmationChecklist?.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-terminal-border">
                    <p className="text-terminal-muted text-[9px] tracking-widest">MANUAL CHECKLIST</p>
                    {brief.confirmationChecklist.map(item => (
                      <label key={item.id} className="flex items-start gap-2 cursor-pointer group">
                        <div
                          className={`mt-0.5 w-4 h-4 border shrink-0 flex items-center justify-center transition-colors ${
                            checklist[item.id]
                              ? 'bg-terminal-gold border-terminal-gold'
                              : 'border-terminal-border group-hover:border-terminal-gold/50'
                          }`}
                          onClick={() => setChecklist(c => ({ ...c, [item.id]: !c[item.id] }))}
                        >
                          {checklist[item.id] && <span className="text-terminal-bg text-[10px] font-bold">✓</span>}
                        </div>
                        <span className={`text-xs leading-snug ${checklist[item.id] ? 'text-terminal-muted line-through' : 'text-terminal-text'}`}>
                          {item.label}
                        </span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* PM Watch */}
            {brief.pmWatch && <PMWatchCard pmWatch={brief.pmWatch} />}

            {/* Additional Events + Trade Log */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {brief.additionalEvents?.length > 0 && (
                <AdditionalEventsCard events={brief.additionalEvents} />
              )}
              <TradeLog
                tradingDate={todayCT}
                dayType={brief.dayType}
                briefId={briefId}
                maxTrades={brief.tradeParams?.maxTrades || 3}
                contracts={brief.tradeParams?.contracts || 3}
              />
            </div>

            {/* Account Monitor */}
            <AccountMonitor />

            {/* Overnight Context */}
            {brief.overnightContext && (
              <OvernightCard context={brief.overnightContext} />
            )}

            {/* Post-Session Review — only after 2 PM CT */}
            {isAfterPM && <PostSessionReview
              review={review} setReview={setReview}
              isSavingReview={isSavingReview} reviewSaved={reviewSaved} reviewError={reviewError}
              isAnalyzing={isAnalyzing} sessionAnalysis={sessionAnalysis} analyzeError={analyzeError}
              saveReview={saveReview} analyzeSession={analyzeSession}
              todayCT={todayCT}
            />}

          </div>
        )}

        {/* Show trade log and account monitor even without a brief */}
        {!brief && !isGenerating && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <TradeLog
                tradingDate={todayCT}
                dayType={null}
                briefId={null}
                maxTrades={3}
                contracts={3}
              />
            </div>
            <AccountMonitor />
            {isAfterPM && <PostSessionReview
              review={review} setReview={setReview}
              isSavingReview={isSavingReview} reviewSaved={reviewSaved} reviewError={reviewError}
              isAnalyzing={isAnalyzing} sessionAnalysis={sessionAnalysis} analyzeError={analyzeError}
              saveReview={saveReview} analyzeSession={analyzeSession}
              todayCT={todayCT} noBrief
            />}
          </div>
        )}

        {/* Spacer */}
        <div className="h-8" />
      </main>
    </div>
  )
}
