import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { supabase } from '@/lib/supabase'

export async function POST(request) {
  try {
    const body = await request.json()
    const { briefId, date, notes, rulesBroken, actualDayType, actualNQRange, action } = body

    if (action === 'analyze') {
      const anthropicKey = process.env.ANTHROPIC_API_KEY
      if (!anthropicKey) {
        return NextResponse.json({ error: 'ANTHROPIC_API_KEY not configured' }, { status: 400 })
      }

      // Fetch brief record
      let briefRecord = null
      if (briefId) {
        const { data } = await supabase.from('daily_briefs').select('*').eq('id', briefId).single()
        briefRecord = data
      } else if (date) {
        const { data } = await supabase
          .from('daily_briefs').select('*').eq('brief_date', date)
          .order('created_at', { ascending: false }).limit(1).single()
        briefRecord = data
      }

      // Fetch today's trades
      const { data: trades } = await supabase
        .from('trade_logs').select('*').eq('trade_date', date || briefRecord?.brief_date)

      const client = new Anthropic({ apiKey: anthropicKey })

      const analysisPrompt = `You are analyzing a trading day for a MNQ/NQ futures trader using the ZEXTER system.

MORNING BRIEF PREDICTED:
Day Type: ${briefRecord?.day_type || 'Unknown'}
Reason: ${briefRecord?.day_type_reason || 'N/A'}
Primary Catalyst: ${JSON.stringify(briefRecord?.primary_catalyst || {})}
Full Brief: ${briefRecord?.full_brief || 'N/A'}

ACTUAL TRADES TODAY:
${JSON.stringify(trades || [], null, 2)}

POST-SESSION NOTES FROM TRADER:
What happened: ${notes || 'N/A'}
Rules broken: ${rulesBroken || 'None reported'}
Actual day type (in hindsight): ${actualDayType || 'N/A'}
Actual NQ range: ${actualNQRange || 'N/A'} pts

Compare what was predicted vs what happened. Answer specifically:
1. What did the system get right?
2. What did the system get wrong?
3. What specific rule change or threshold adjustment would prevent this misclassification in the future?
4. Was this a missed trade opportunity? If so, what was the estimated missed profit (in pts and $)?
5. Overall system grade for today: A (excellent), B (good), C (missed something), F (major failure)

Keep the response to 4-5 focused paragraphs. Be direct and actionable.`

      const response = await client.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2000,
        messages: [{ role: 'user', content: analysisPrompt }],
      })

      const analysis = response.content.find(b => b.type === 'text')?.text || ''

      // Save analysis back to brief record
      const targetId = briefId || briefRecord?.id
      if (targetId) {
        await supabase.from('daily_briefs').update({ post_session_analysis: analysis }).eq('id', targetId)
      }

      return NextResponse.json({ analysis })
    }

    // Save review fields to daily_briefs
    const updateData = {
      post_session_notes: notes || null,
      rules_broken: rulesBroken || null,
      actual_day_type: actualDayType || null,
      actual_nq_range: actualNQRange ? parseFloat(actualNQRange) : null,
      rules_followed: !rulesBroken || rulesBroken.trim() === '',
    }

    let targetId = briefId
    if (!targetId && date) {
      const { data } = await supabase
        .from('daily_briefs').select('id').eq('brief_date', date)
        .order('created_at', { ascending: false }).limit(1).single()
      targetId = data?.id
    }

    if (!targetId) {
      return NextResponse.json({ error: 'No brief found for this date' }, { status: 404 })
    }

    const { error } = await supabase.from('daily_briefs').update(updateData).eq('id', targetId)
    if (error) throw new Error(error.message)

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Review error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
