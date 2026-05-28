const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')!
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE = Deno.env.get('SERVICE_ROLE_KEY')!
const FROM_EMAIL = 'GEOrankHQ <hello@georankhq.co>'

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

async function sendEmail(to: string, subject: string, html: string) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: FROM_EMAIL, to, subject, html }),
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

function followUpEmail(firstName: string, email: string) {
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"/></head>
<body style="background:#07070f;font-family:Helvetica Neue,sans-serif;margin:0;padding:0">
<div style="max-width:560px;margin:0 auto;padding:32px 24px">

  <div style="font-size:22px;font-weight:900;color:#fff;letter-spacing:0.05em;margin-bottom:32px">GEO<span style="color:#f0c040">rankHQ</span></div>

  <div style="background:#0d0d1a;border:1px solid #161628;border-radius:16px;padding:28px;margin-bottom:20px">
    <h1 style="margin:0 0 12px;font-size:22px;font-weight:800;color:#fff;">Still thinking about it, ${firstName}?</h1>
    <p style="margin:0 0 16px;font-size:15px;color:#8888aa;line-height:1.7;">You joined the GEOrankHQ waitlist yesterday. I wanted to personally follow up and make sure you got a chance to try the free AI visibility check.</p>
    <p style="margin:0 0 16px;font-size:15px;color:#8888aa;line-height:1.7;">In under 30 seconds, you can see exactly which AI engines are mentioning your business — and which aren't. No signup required.</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:16px">
      <tr>
        <td style="padding-right:8px">
          <a href="https://georankhq.co/check.html" style="display:block;text-align:center;background:#f0c040;color:#07070f;font-weight:700;font-size:14px;padding:13px 16px;border-radius:10px;text-decoration:none;">Run Free AI Check →</a>
        </td>
        <td style="padding-left:8px">
          <a href="https://georankhq.co/app/" style="display:block;text-align:center;background:#0d0d1a;border:1px solid #f0c040;color:#f0c040;font-weight:700;font-size:14px;padding:13px 16px;border-radius:10px;text-decoration:none;">Start Free Trial →</a>
        </td>
      </tr>
    </table>
    <p style="margin:0;font-size:12px;color:#525270;text-align:center;">No credit card · Cancel anytime</p>
  </div>

  <div style="background:#0d0d1a;border:1px solid #161628;border-radius:16px;padding:24px;margin-bottom:20px">
    <p style="margin:0 0 14px;font-size:14px;font-weight:700;color:#fff;">What you get with GEOrankHQ:</p>
    <div style="display:flex;gap:10px;margin-bottom:10px"><span style="color:#f0c040">→</span><span style="font-size:13px;color:#8888aa;">GEO Score — your AI + Google visibility in one number</span></div>
    <div style="display:flex;gap:10px;margin-bottom:10px"><span style="color:#f0c040">→</span><span style="font-size:13px;color:#8888aa;">Schema Builder — structured data code AI engines need</span></div>
    <div style="display:flex;gap:10px;margin-bottom:10px"><span style="color:#f0c040">→</span><span style="font-size:13px;color:#8888aa;">AI Snippet Generator — content designed to get cited</span></div>
    <div style="display:flex;gap:10px;margin-bottom:10px"><span style="color:#f0c040">→</span><span style="font-size:13px;color:#8888aa;">Citation Monitor — checks ChatGPT, Perplexity & Gemini</span></div>
    <div style="display:flex;gap:10px"><span style="color:#f0c040">→</span><span style="font-size:13px;color:#8888aa;">Weekly AI visibility reports — every Monday</span></div>
  </div>

  <div style="height:8px"></div>

  <div style="border-top:1px solid #161628;padding-top:20px;text-align:center">
    <p style="margin:0 0 6px;font-size:12px;color:#2a2a3c;">GEOrankHQ · hello@georankhq.co</p>
    <a href="https://georankhq.co/unsubscribe.html?email=${encodeURIComponent(email)}" style="font-size:12px;color:#2a2a3c;text-decoration:none;">Unsubscribe</a>
  </div>

</div>
</body></html>`
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: cors })

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE)

    // Find waitlist signups from 24 hours ago that haven't received a follow-up
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    const { data: leads, error } = await supabase
      .from('waitlist')
      .select('*')
      .eq('follow_up_sent', false)
      .neq('status', 'unsubscribed')
      .lt('created_at', cutoff)

    if (error) throw error
    if (!leads?.length) return new Response(JSON.stringify({ sent: 0 }), { status: 200, headers: { ...cors, 'Content-Type': 'application/json' } })

    let sent = 0
    for (const lead of leads) {
      try {
        const firstName = lead.first_name || 'there'
        await sendEmail(
          lead.email,
          `Still thinking about it, ${firstName}? Your free AI check is waiting`,
          followUpEmail(firstName, lead.email)
        )
        // Mark as sent
        await supabase.from('waitlist').update({ follow_up_sent: true }).eq('id', lead.id)
        sent++
      } catch (e) {
        console.error(`Failed for ${lead.email}:`, e)
      }
    }

    return new Response(JSON.stringify({ success: true, sent }), { status: 200, headers: { ...cors, 'Content-Type': 'application/json' } })
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { ...cors, 'Content-Type': 'application/json' } })
  }
})
