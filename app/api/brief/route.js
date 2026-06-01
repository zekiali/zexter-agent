import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { supabase } from '@/lib/supabase'

const SYSTEM_PROMPT = `You are ZEXTER, an elite pre-market intelligence agent for MNQ/NQ futures trading.

TRADER RULES:
- MNQ = $2/pt/contract. A+/A days: 3 contracts. B days: 2. C days: 0.
- Hard stop 15-20 pts. Trail after 70 pts. Min target 35 pts.
- Max 3 trades/session. Daily max loss $200 (A) / $100 (B).
- Primary window: 8:30 AM - 10:00 AM CT ONLY.
- RVOL: 2.0+ required. 4.0+ = A+ confirmation.
- MCDX 2nd signal: 10+ required. 15+ = A+ confirmation.
- PM re-entry: ONLY if RVOL re-expands from below 1.0 to 2.5+ WITH identifiable catalyst.
- No after-hours. No sizing up during losing sessions.

DAY TYPES:
- A+: Tier1 surprise + RVOL4+ + MCDX15+ → 3 MNQ, trail aggressively
- A: Tier1 release day OR post-Mag7-earnings morning → 3 MNQ, 70pt min, 20pt stop
- B: Tier2 catalyst, Fed Speaker, OpEx day, or low-surprise Tier1 → 2 MNQ, 35-50pt target, 15pt stop
- C: No catalyst, quiet → 0 contracts, do not trade
- F: FOMC decision day → 0 until 1PM CT, then FOMC protocol

CATALYST TIERS:

TIER 1 (8:30 AM ET / 7:30 AM CT):
- CPI cool print: +150-350pts, 78% directional upside
- CPI hot print: -200-400pts, 73% directional downside
- CPI inline: C-day, ±80pts, do not trade
- PPI cool: +100-250pts, 72% upside
- PPI hot: -150-350pts, 70% downside
- NFP: 150-250pt range, direction complex, first 5-15min only
- PCE cool: +100-250pts. PCE hot: -150-300pts
- Retail Sales beat: +80-150pts
- Jobless Claims surprise: 50-150pts

TIER 2 — ECONOMIC (various times):
- ISM: 100-200pts at 10AM ET / 9AM CT
- Consumer Confidence: 50-100pts at 10AM ET
- Jobless Claims (regular, no surprise): 50-100pts
- JOLTS: 50-100pts at 10AM ET
- Durable Goods: 50-100pts at 8:30AM ET

TIER 2 — FED EVENTS (high importance, variable times):
- FOMC Decision Day: 280pt avg range. 0 contracts until 1PM CT. Fake move common after statement, real move at 2:30PM press conf.
- Fed Minutes (3 weeks post-FOMC, 2PM ET): 100-200pts if hawkish/dovish surprise vs what market expected from original decision
- Fed Speaker — Powell: 50-150pts depending on tone. Higher impact than regional Fed presidents. Wait for direction confirmation.
- Fed Speaker — Regional presidents: 30-75pts, lower conviction.

TIER 3 — MARKET STRUCTURE:
- OpEx (3rd Friday monthly): Elevated volatility. Morning = directional move as MMs hedge gamma. Afternoon = continuation or violent reversal. Final hour 2-3PM CT often highest volume. Triple witching (quarterly) = even more extreme version.
- Post-Mag7 earnings morning (NVDA/MSFT/AAPL/META/GOOGL/AMZN/TSLA): If major Mag7 reported after close yesterday, RVOL almost always elevated at open. Classify as A or A+ depending on magnitude of earnings surprise. NVDA earnings produce 200-400pt NQ moves.

TIER 4 — GEOPOLITICAL/MACRO SURPRISE (unscheduled):
- Tariff announcements, trade deal headlines, geopolitical escalation or de-escalation. These can fire any time of day.
- Key pattern: de-escalation headline → 1-2 day rally then fade when denied (Iran Peace Rally Fade — documented 4/4 occurrences)
- If Tier 4 event fires during session: check for PM re-entry trigger (RVOL re-expansion from below 1.0 to 2.5+)

TIME WINDOWS BY CATALYST:
- 7:00-7:25 AM CT: Pre-market prep window
- 7:30 AM CT: Tier 1 data releases fire. Enter within 5min if RVOL spikes and MCDX confirms. First 5-15min = highest prob window.
- 8:30-10:00 AM CT: Primary trading window for all catalyst types
- 9:00 AM CT: ISM/Consumer Confidence secondary catalyst fires
- 10:00-11:00 AM CT: Continuation or fade zone, no new entries
- 11:00 AM-1:00 PM CT: Midday chop, avoid
- 1:00 PM CT: FOMC statement drops (F-days only)
- 2:30 PM CT: Powell press conference (F-days) — real move starts here
- All day (OpEx): Monitor final hour 2-3PM CT for options-driven moves

IMPORTANT:
- Economic calendar data is provided from Finnhub API in the user message. DO NOT search for it.
- Use web search for: NQ overnight performance, any Mag7 earnings that reported after close yesterday, any breaking geopolitical news.
- If calendar shows a Fed speaker event, classify the day as B-day and note which Fed official and whether Powell or regional.
- If today is 3rd Friday of month, flag as OpEx day with B+ treatment.
- If Mag7 reported earnings last night with significant surprise, upgrade to A or A+ day.

WHEN WEB SEARCH IS USED INSTEAD OF FINNHUB CALENDAR:
- ForexFactory and Investing.com are most reliable for consensus estimates
- BLS.gov and ISMWorld.org are ground truth for official government releases
- Barchart.com has the most accurate overnight NQ futures context
- Always search for ISM consensus specifically on first Monday of each month
- Always search for CPI/PPI consensus specifically on release days (check ForexFactory for dates)

Return VALID JSON ONLY — no markdown, no backticks:
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
    "impactLevel": "tier1|tier2_econ|tier2_fed|tier3_opex|tier3_earnings|tier4_geo|fomc|none",
    "directionNote": "string",
    "historicalStats": {
      "avgRange": "string",
      "upScenario": "string",
      "downScenario": "string",
      "neutralScenario": "string"
    }
  },
  "additionalEvents": [
    {"name":"string","timeET":"string","timeCT":"string","impact":"high|medium|low","note":"string"}
  ],
  "overnightContext": "string",
  "mag7EarningsAlert": null,
  "opexAlert": null,
  "geopoliticalAlert": null,
  "timeWindows": [
    {"timeCT":"string","label":"string","priority":"critical|high|medium|low|avoid","note":"string"}
  ],
  "tradeParams": {
    "contracts": 3,
    "stopPts": 20,
    "minTargetPts": 70,
    "trailAfterPts": 70,
    "rvolThreshold": 4.0,
    "mcdxThreshold": 15,
    "maxTrades": 3,
    "dailyMaxLoss": 200,
    "tradingWindow": "string",
    "pmReentry": false,
    "pmReentryNote": null
  },
  "confirmationChecklist": [
    {"id":"structure","label":"Clear price structure break on entry timeframe","type":"manual"},
    {"id":"catalyst","label":"Catalyst confirmed and direction clear","type":"manual"},
    {"id":"vwap","label":"Price above/below VWAP aligned with direction","type":"manual"},
    {"id":"rvol_confirm","label":"RVOL confirmed at or above threshold","type":"manual"}
  ],
  "warningFlags": [],
  "brief": "3-4 paragraph intelligence brief",
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
      ? `\n\nTODAY'S ECONOMIC + EARNINGS CALENDAR (already fetched from Finnhub — do NOT search for this):\n${JSON.stringify(calendarEvents, null, 2)}`
      : `\n\nFinnhub returned no calendar data. Search for today's economic data using these specific sources:

1. Search: 'site:forexfactory.com economic calendar ${date || new Date().toLocaleDateString('en-US', { timeZone: 'America/Chicago' })}' — get all US releases today with consensus and prior values

2. Search: 'site:ismworld.org ${new Date().toLocaleString('en-US', { timeZone: 'America/Chicago', month: 'long' })} 2026 manufacturing PMI' if today is first Monday of month

3. Search: 'site:bls.gov ${new Date().toLocaleString('en-US', { timeZone: 'America/Chicago', month: 'long' })} 2026' if CPI, PPI, or NFP expected today

4. Search: 'NQ futures overnight ${date || new Date().toLocaleDateString('en-US', { timeZone: 'America/Chicago' })} barchart' for precise overnight performance

5. Search: 'site:federalreserve.gov FOMC calendar 2026' to confirm upcoming Fed meeting dates

6. Search: 'site:cmegroup.com fedwatch' for current Fed rate cut probability

Extract from these searches:
- Every US economic release today with exact time (ET and CT)
- Consensus estimate for each release
- Prior value for each release
- Actual value if already released
- NQ overnight range and current price
- Any active geopolitical headlines affecting markets

Return all of this as structured data in the JSON response.`

    const userMessage = `Generate a pre-market intelligence brief for MNQ/NQ trading.
Date: ${date || new Date().toLocaleDateString('en-US', { timeZone: 'America/Chicago' })}
Time of generation: ${time || new Date().toLocaleTimeString('en-US', { timeZone: 'America/Chicago' })} CT
${calendarText}

Use web search to check: (1) NQ/ES overnight futures performance and current level, (2) any Mag7 earnings reported after close last night, (3) any breaking geopolitical or macro news that could affect NQ today. Return only valid JSON as specified.`

    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 6000,
      system: SYSTEM_PROMPT,
      tools: [
        {
          type: 'web_search_20250305',
          name: 'web_search',
          max_uses: 4,
        },
      ],
      messages: [{ role: 'user', content: userMessage }],
    })

    // Extract JSON from response regardless of formatting
    const text = response.content
      .filter(b => b.type === 'text')
      .map(b => b.text)
      .join('')

    // Strip markdown code blocks if present
    const cleaned = text
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim()

    // Find the JSON object — look for first { to last }
    const start = cleaned.indexOf('{')
    const end = cleaned.lastIndexOf('}')

    if (start === -1 || end === -1) {
      return NextResponse.json(
        { error: 'No JSON object found in AI response', raw: text },
        { status: 500 }
      )
    }

    const jsonStr = cleaned.substring(start, end + 1)
    let parsed
    try {
      parsed = JSON.parse(jsonStr)
    } catch {
      return NextResponse.json(
        { error: 'Failed to parse AI response as JSON', raw: text },
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

    if (dbError) console.error('Supabase insert error:', dbError)

    return NextResponse.json({ brief: parsed, id: saved?.id || null })
  } catch (err) {
    console.error('Brief generation error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
