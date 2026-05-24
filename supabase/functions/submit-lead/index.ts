// supabase/functions/submit-lead/index.ts
// ─────────────────────────────────────────────────────────────────────────────
// Handles POST requests from the landing page for:
//   type: "waitlist"  → saves to waitlist table + sends confirmation email
//   type: "demo"      → saves to demo_bookings table + sends confirmation email
//
// Deploy with:  supabase functions deploy submit-lead
// ─────────────────────────────────────────────────────────────────────────────

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const RESEND_API_KEY   = Deno.env.get('RESEND_API_KEY')!
const SUPABASE_URL     = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE = Deno.env.get('SERVICE_ROLE_KEY')!  // service role bypasses RLS
const FROM_EMAIL = 'GEOrank <onboarding@resend.dev>'
const ADMIN_EMAIL      = 'admin@georank.io'  // where YOU get notified of new leads

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE)

// ─── CORS HEADERS ─────────────────────────────────────────────────────────────
const cors = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

// ─── RESEND EMAIL HELPER ──────────────────────────────────────────────────────
async function sendEmail({ to, subject, html }: { to: string; subject: string; html: string }) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ from: FROM_EMAIL, to, subject, html }),
  })
  if (!res.ok) {
    const err = await res.text()
    console.error('Resend error:', err)
    throw new Error(`Email send failed: ${err}`)
  }
  return res.json()
}

// ─── EMAIL TEMPLATES ──────────────────────────────────────────────────────────

function waitlistConfirmationEmail(firstName: string, email: string) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <style>
    body { background:#07070f; color:#d8d8ee; font-family:'Helvetica Neue',sans-serif; margin:0; padding:0; }
    .wrap { max-width:560px; margin:40px auto; padding:0 24px; }
    .logo { font-size:28px; font-weight:900; letter-spacing:0.05em; color:#fff; margin-bottom:32px; }
    .logo span { color:#f0c040; }
    .card { background:#0d0d1a; border:1px solid #161628; border-radius:16px; padding:32px; margin-bottom:24px; }
    h1 { font-size:26px; font-weight:800; color:#fff; margin:0 0 12px; }
    p { font-size:15px; color:#8888aa; line-height:1.7; margin:0 0 16px; }
    .highlight { color:#f0c040; font-weight:600; }
    .btn { display:inline-block; background:#f0c040; color:#07070f; font-weight:700; font-size:15px; padding:13px 28px; border-radius:10px; text-decoration:none; margin-top:8px; }
    .perks { margin:24px 0 0; }
    .perk { display:flex; align-items:flex-start; gap:12px; margin-bottom:14px; font-size:14px; color:#8888aa; }
    .perk-icon { font-size:18px; flex-shrink:0; margin-top:1px; }
    .footer { font-size:12px; color:#4a4a6a; text-align:center; padding-top:24px; }
  </style>
</head>
<body>
  <div class="wrap">
    <div class="logo">GEO<span>rank</span></div>
    <div class="card">
      <h1>You're on the list, ${firstName}! 🎉</h1>
      <p>We've saved your spot on the GEOrank waitlist. We're opening access in batches — you'll be one of the first to know when it's your turn.</p>
      <p>In the meantime, <span class="highlight">book a live demo</span> to skip the queue and see GEOrank in action with a real business.</p>
      <a href="https://georank.io/#contact" class="btn">Book a demo to skip the queue →</a>
      <div class="perks">
        <div class="perk"><span class="perk-icon">🤖</span><span>AI Citation Monitor — see exactly where ChatGPT, Perplexity & Gemini mention your business</span></div>
        <div class="perk"><span class="perk-icon">⚡</span><span>AI Snippet Generator — publish content that gets cited by AI search engines</span></div>
        <div class="perk"><span class="perk-icon">📈</span><span>Dual Rank Tracker — Google positions AND AI engine visibility, side by side</span></div>
      </div>
    </div>
    <div class="footer">
      You're receiving this because you joined the GEOrank waitlist at georank.io.<br/>
      <a href="https://georank.io/unsubscribe?email=${encodeURIComponent(email)}" style="color:#4a4a6a">Unsubscribe</a>
    </div>
  </div>
</body>
</html>`
}

function demoConfirmationEmail(name: string, email: string, slotDay: string, slotTime: string) {
  const shortTime = slotTime.split('—')[0].trim()
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <style>
    body { background:#07070f; color:#d8d8ee; font-family:'Helvetica Neue',sans-serif; margin:0; padding:0; }
    .wrap { max-width:560px; margin:40px auto; padding:0 24px; }
    .logo { font-size:28px; font-weight:900; letter-spacing:0.05em; color:#fff; margin-bottom:32px; }
    .logo span { color:#60a5fa; }
    .card { background:#0d0d1a; border:1px solid #161628; border-radius:16px; padding:32px; margin-bottom:24px; }
    h1 { font-size:26px; font-weight:800; color:#fff; margin:0 0 12px; }
    p { font-size:15px; color:#8888aa; line-height:1.7; margin:0 0 16px; }
    .slot-box { background:#060610; border:1px solid #161628; border-left:3px solid #60a5fa; border-radius:10px; padding:16px 18px; margin:20px 0; }
    .slot-day { font-size:16px; font-weight:700; color:#fff; margin-bottom:4px; }
    .slot-time { font-size:14px; color:#60a5fa; font-family:monospace; }
    .btn { display:inline-block; background:#60a5fa; color:#07070f; font-weight:700; font-size:15px; padding:13px 28px; border-radius:10px; text-decoration:none; margin-top:8px; }
    .what-to-expect { margin:24px 0 0; }
    .step { display:flex; align-items:flex-start; gap:12px; margin-bottom:14px; font-size:14px; color:#8888aa; }
    .step-num { background:#0a1428; border:1px solid #1a2a3a; border-radius:6px; padding:2px 8px; font-size:12px; font-weight:700; color:#60a5fa; flex-shrink:0; }
    .footer { font-size:12px; color:#4a4a6a; text-align:center; padding-top:24px; }
  </style>
</head>
<body>
  <div class="wrap">
    <div class="logo">GEO<span>rank</span></div>
    <div class="card">
      <h1>Demo confirmed, ${name}! 📅</h1>
      <p>We're looking forward to showing you how GEOrank works. Here's your booking:</p>
      <div class="slot-box">
        <div class="slot-day">${slotDay}</div>
        <div class="slot-time">${shortTime} PST · 20 minutes · Google Meet</div>
      </div>
      <p>A calendar invite with the meeting link is on its way separately. Add it to your calendar so you don't miss it.</p>
      <div class="what-to-expect">
        <div class="step"><span class="step-num">01</span><span>We'll run a live GEO audit on your actual business — free, no strings</span></div>
        <div class="step"><span class="step-num">02</span><span>See the AI Citation Monitor, Schema Builder, and Rank Tracker in action</span></div>
        <div class="step"><span class="step-num">03</span><span>Q&A — ask us anything. We won't pitch you unless you ask us to</span></div>
      </div>
    </div>
    <div class="footer">
      Need to reschedule? Reply to this email.<br/>
      <a href="https://georank.io/cancel-demo?email=${encodeURIComponent(email)}" style="color:#4a4a6a">Cancel booking</a>
    </div>
  </div>
</body>
</html>`
}

function adminNotificationEmail(type: string, data: Record<string, string>) {
  const rows = Object.entries(data).map(([k, v]) =>
    `<tr><td style="padding:8px 12px;color:#8888aa;font-size:13px;border-bottom:1px solid #161628">${k}</td><td style="padding:8px 12px;color:#d8d8ee;font-size:13px;border-bottom:1px solid #161628">${v}</td></tr>`
  ).join('')

  return `
<!DOCTYPE html>
<html>
<body style="background:#07070f;font-family:Helvetica Neue,sans-serif;padding:32px">
  <div style="max-width:480px;margin:0 auto">
    <div style="font-size:22px;font-weight:900;color:#fff;margin-bottom:24px">GEO<span style="color:${type==='waitlist'?'#f0c040':'#60a5fa'}">${type==='waitlist'?' New Waitlist Lead 🎯':' New Demo Booking 📅'}</span></div>
    <table style="width:100%;background:#0d0d1a;border:1px solid #161628;border-radius:12px;border-collapse:collapse;overflow:hidden">
      ${rows}
    </table>
    <p style="margin-top:20px;font-size:13px;color:#4a4a6a">
      <a href="https://supabase.com" style="color:#60a5fa">View in Supabase →</a>
    </p>
  </div>
</body>
</html>`
}

// ─── MAIN HANDLER ─────────────────────────────────────────────────────────────
Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: cors })
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: cors })
  }

  try {
    const body = await req.json()
    const { type } = body

    // ── WAITLIST ──────────────────────────────────────────────────────────────
    if (type === 'waitlist') {
      const { firstName, lastName, email, businessType, locations, note } = body

      if (!email || !firstName) {
        return new Response(
          JSON.stringify({ error: 'firstName and email are required' }),
          { status: 400, headers: { ...cors, 'Content-Type': 'application/json' } }
        )
      }

      // Save to Supabase
      const { error: dbError } = await supabase
        .from('waitlist')
        .insert({ first_name: firstName, last_name: lastName, email, business_type: businessType, locations, note })

      if (dbError) {
        // Handle duplicate email gracefully
        if (dbError.code === '23505') {
          return new Response(
            JSON.stringify({ success: true, message: 'already_on_list' }),
            { status: 200, headers: { ...cors, 'Content-Type': 'application/json' } }
          )
        }
        throw dbError
      }

      // Send confirmation to user
      await sendEmail({
        to: email,
        subject: `You're on the GEOrank waitlist, ${firstName}! 🎉`,
        html: waitlistConfirmationEmail(firstName, email),
      })

      // Notify admin
      await sendEmail({
        to: ADMIN_EMAIL,
        subject: `New waitlist lead: ${firstName} ${lastName || ''} — ${businessType || 'Unknown business'}`,
        html: adminNotificationEmail('waitlist', {
          Name: `${firstName} ${lastName || ''}`.trim(),
          Email: email,
          'Business type': businessType || '—',
          Locations: locations || '—',
          Note: note || '—',
          Time: new Date().toLocaleString('en-US', { timeZone: 'America/Los_Angeles' }) + ' PST',
        }),
      })

      return new Response(
        JSON.stringify({ success: true }),
        { status: 200, headers: { ...cors, 'Content-Type': 'application/json' } }
      )
    }

    // ── DEMO BOOKING ──────────────────────────────────────────────────────────
    if (type === 'demo') {
      const { name, email, slotDay, slotTime } = body

      if (!email || !name || !slotDay) {
        return new Response(
          JSON.stringify({ error: 'name, email and slotDay are required' }),
          { status: 400, headers: { ...cors, 'Content-Type': 'application/json' } }
        )
      }

      // Save to Supabase
      const { error: dbError } = await supabase
        .from('demo_bookings')
        .insert({ name, email, slot_day: slotDay, slot_time: slotTime })

      if (dbError) throw dbError

      // Send confirmation to user
      await sendEmail({
        to: email,
        subject: `Demo confirmed: ${slotDay} at ${slotTime.split('—')[0].trim()} PST`,
        html: demoConfirmationEmail(name, email, slotDay, slotTime),
      })

      // Notify admin
      await sendEmail({
        to: ADMIN_EMAIL,
        subject: `New demo booked: ${name} — ${slotDay}`,
        html: adminNotificationEmail('demo', {
          Name: name,
          Email: email,
          Day: slotDay,
          Time: slotTime,
          Booked: new Date().toLocaleString('en-US', { timeZone: 'America/Los_Angeles' }) + ' PST',
        }),
      })

      return new Response(
        JSON.stringify({ success: true }),
        { status: 200, headers: { ...cors, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Unknown type. Use "waitlist" or "demo".' }),
      { status: 400, headers: { ...cors, 'Content-Type': 'application/json' } }
    )

  } catch (err) {
    console.error('Edge function error:', err)
    return new Response(
      JSON.stringify({ error: err.message || 'Internal server error' }),
      { status: 500, headers: { ...cors, 'Content-Type': 'application/json' } }
    )
  }
})
