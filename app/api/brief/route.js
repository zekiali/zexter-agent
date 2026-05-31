import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { supabase } from '@/lib/supabase'

const SYSTEM_PROMPT = `You are ZEXTER, an elite pre-market intelligence agent for MNQ/NQ futures trading.

TRADER RULES:
- MNQ = $2/pt/contract. A+/A days: 3 contracts. B days: 2 contracts. C days: 0.
- Hard stop 15-20 pts. Trail aggressively after 70 pts. Min target 35 pts.
- Max 3 trades/session. Daily max loss $200 (A) / $100 (B).
- Primary window: 8:30 AM - 10:00 AM CT ONLY.
- RVOL: 2.0+ required to trade. 4.0+ = A+ confirmation.
- MCDX 2nd signal: 10+ required. 15+ = A+ confirmation.
- PM re-entry: ONLY if RVOL re-expands from below 1.0 to 2.5+ WITH catalyst.
- No after-hours. No sizing up during losing sessions.

DAY TYPES:
- A+: Tier1 surprise + RVOL4+ + MCDX15+ → 3 MNQ, trail aggressively, no fixed target
- A: Tier1 release day → 3 MNQ, 70pt min target, 20pt stop
- B: Tier2 or low-surprise Tier1 → 2 MNQ, 35-50pt target, 15pt stop
- C: No catalyst → 0 contracts, do not trade
- F: FOMC day → 0 contracts until 1PM CT

HISTORICAL NQ STATS:
CPI cool: +150-350pts 78% upside probability
CPI hot: -200-400pts 73% downside probability
CPI inline: C-day, do not trade
PPI cool: +100-250pts 72% upside
PPI hot: -150-350pts 70% downside
NFP: 150-250pt range, direction complex
FOMC: 280pt avg range, 1PM CT primary window
ISM: 100-200pts potential at 9AM CT
Non-event days: 80-120pt range, DO NOT TRADE

IMPORTANT: Calendar data is provided in user message.
Do NOT search for it. Use web search ONLY for NQ overnight performance.

Return VALID JSON ONLY, no markdown, no backticks:
{
  "dayType": "A+|A|B|C|F",
  "dayTypeReason": "string",
  "primaryCatalyst": {
    "name": "string",
    "timeET": "string",
    "timeCT": "string",
    "consensus": "string or null",
    "prior": "string or null",
    "actual": "string or null",
    "impactLevel": "tier1|tier2|tier3|fomc|none",
    "directionNote": "string",
    "historicalStats": {
      "avgRange": "string",
      "upScenario": "string",
      "downScenario": "string",
      "neutralScenario": "string"
    }
  },
  "additionalEvents": [
    {"name":"string","timeET":"string","timeCT":"string",
     "impact":"high|medium|low","note":"string"}
  ],
  "overnightContext": "string",
  "timeWindows": [
    {"timeCT":"string","label":"string",
     "priority":"critical|high|medium|low|avoid","note":"string"}
  ],
  "tradeParams": {
    "contracts": 3,
    "stopPts": 20,
    "minTargetPts": 70,
    "trailAfterPts": 70,
    "rvolThreshold": 4.0,
    "mcdxThreshold": 15,
    "maxTrades": 3,
    "tradingWindow": "string",
    "pmReentry": false,
    "pmReentryNote": null
  },
  "confirmationChecklist": [
    {"id":"structure","label":"Clear price structure break on entry timeframe","type":"manual"},
    {"id":"catalyst","label":"Catalyst confirmed and direction clear","type":"manual"},
    {"id":"vwap","label":"Price above/below VWAP aligned with direction","type":"manual"}
  ],
  "warningFlags": [],
  "brief": "3-4 paragraph natural language intelligence brief",
  "pmWatch": null
}`

export async function POST(request) {
  try {
    const body = await request.json()
    const { calendarEvents = [], date, time } = body

    const anthropicKey = process.env.ANTHROPIC_API_KEY
    if (!anthropicKey) {
      return NextResponse.json({ error: 'ANTHROPIC_API_KEY not configured' }, { status: 400 })
    }

    const client = new Anthropic({ apiKey: anthropicKey })

    const calendarText = calendarEvents.length > 0
      ? `\n\nTODAY'S ECONOMIC CALENDAR (already fetched, do NOT search for this):\n${JSON.stringify(calendarEvents, null, 2)}`
      : '\n\nNo calendar data provided — use web search to find today\'s economic events.'

    const userMessage = `Generate a pre-market intelligence brief for MNQ/NQ trading.
Date: ${date || new Date().toLocaleDateString('en-US', { timeZone: 'America/Chicago' })}
Time of generation: ${time || new Date().toLocaleTimeString('en-US', { timeZone: 'America/Chicago' })} CT
${calendarText}

Use web search to check NQ/ES overnight futures performance, any major geopolitical or macro events, and current sentiment. Return only valid JSON as specified.`

    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      tools: [
        {
          type: 'web_search_20250305',
          name: 'web_search',
          max_uses: 3,
        },
      ],
      messages: [{ role: 'user', content: userMessage }],
    })

    // Extract the text content from the response
    let rawText = ''
    for (const block of response.content) {
      if (block.type === 'text') {
        rawText += block.text
      }
    }

    // Parse JSON from response
    let parsed
    try {
      // Strip any accidental markdown fences
      const cleaned = rawText
        .replace(/^```json\s*/i, '')
        .replace(/^```\s*/i, '')
        .replace(/```\s*$/i, '')
        .trim()
      parsed = JSON.parse(cleaned)
    } catch {
      return NextResponse.json(
        { error: 'Failed to parse AI response as JSON', raw: rawText },
        { status: 500 }
      )
    }

    // Save to Supabase
    const briefDate = date || new Date().toLocaleDateString('en-CA', { timeZone: 'America/Chicago' })
    const { data: saved, error: dbError } = await supabase
      .from('daily_briefs')
      .insert({
        brief_date: briefDate,
        day_type: parsed.dayType,
        day_type_reason: parsed.dayTypeReason,
        primary_catalyst: parsed.primaryCatalyst,
        trade_params: parsed.tradeParams,
        time_windows: parsed.timeWindows,
        full_brief: parsed.brief,
        data_source: calendarEvents.length > 0 ? 'finnhub+websearch' : 'websearch',
        overnight_context: parsed.overnightContext,
        warning_flags: parsed.warningFlags || [],
      })
      .select()
      .single()

    if (dbError) {
      console.error('Supabase insert error:', dbError)
    }

    return NextResponse.json({
      brief: parsed,
      id: saved?.id || null,
    })
  } catch (err) {
    console.error('Brief generation error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
