import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const RESEND_API_KEY   = Deno.env.get('RESEND_API_KEY')!
const SUPABASE_URL     = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE = Deno.env.get('SERVICE_ROLE_KEY')!
const FROM_EMAIL       = 'GEOrankHQ <hello@georankhq.co>'
const ADMIN_EMAIL      = 'gorkasanch@gmail.com'

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE)

const cors = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

async function sendEmail({ to, subject, html }: { to: string; subject: string; html: string }) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: FROM_EMAIL, to, subject, html }),
  })
  if (!res.ok) { const err = await res.text(); throw new Error(`Email failed: ${err}`) }
  return res.json()
}

function waitlistEmail(firstName: string, email: string) {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"/><style>body{background:#07070f;color:#d8d8ee;font-family:Helvetica Neue,sans-serif;margin:0;padding:0}.wrap{max-width:560px;margin:40px auto;padding:0 24px}.logo{font-size:28px;font-weight:900;letter-spacing:0.05em;color:#fff;margin-bottom:32px}.logo span{color:#f0c040}.card{background:#0d0d1a;border:1px solid #161628;border-radius:16px;padding:32px;margin-bottom:24px}h1{font-size:26px;font-weight:800;color:#fff;margin:0 0 12px}p{font-size:15px;color:#8888aa;line-height:1.7;margin:0 0 16px}.highlight{color:#f0c040;font-weight:600}.btn{display:inline-block;background:#f0c040;color:#07070f;font-weight:700;font-size:15px;padding:13px 28px;border-radius:10px;text-decoration:none;margin-top:8px}.footer{font-size:12px;color:#4a4a6a;text-align:center;padding-top:24px}</style></head><body><div class="wrap"><div class="logo">GEO<span>rankHQ</span></div><div class="card"><h1>You're on the list, ${firstName}! 🎉</h1><p>We've saved your spot on the GEOrankHQ waitlist. You'll be one of the first to know when your spot opens up.</p><p>In the meantime, <span class="highlight">book a live demo</span> to skip the queue and see GEOrankHQ in action.</p><a href="https://georankhq.co/landing.html#contact" class="btn">Book a demo →</a></div><div class="footer">You're receiving this because you joined the GEOrankHQ waitlist.<br/><a href="https://georankhq.co/unsubscribe?email=${encodeURIComponent(email)}" style="color:#4a4a6a">Unsubscribe</a></div></div></body></html>`
}

function demoEmail(name: string, email: string, slotDay: string, slotTime: string) {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"/><style>body{background:#07070f;color:#d8d8ee;font-family:Helvetica Neue,sans-serif;margin:0;padding:0}.wrap{max-width:560px;margin:40px auto;padding:0 24px}.logo{font-size:28px;font-weight:900;letter-spacing:0.05em;color:#fff;margin-bottom:32px}.logo span{color:#60a5fa}.card{background:#0d0d1a;border:1px solid #161628;border-radius:16px;padding:32px;margin-bottom:24px}h1{font-size:26px;font-weight:800;color:#fff;margin:0 0 12px}p{font-size:15px;color:#8888aa;line-height:1.7;margin:0 0 16px}.slot{background:#060610;border:1px solid #161628;border-left:3px solid #60a5fa;border-radius:10px;padding:16px 18px;margin:20px 0}.slot-day{font-size:16px;font-weight:700;color:#fff;margin-bottom:4px}.slot-time{font-size:14px;color:#60a5fa;font-family:monospace}.footer{font-size:12px;color:#4a4a6a;text-align:center;padding-top:24px}</style></head><body><div class="wrap"><div class="logo">GEO<span>rankHQ</span></div><div class="card"><h1>Demo confirmed, ${name}! 📅</h1><p>We're looking forward to showing you GEOrankHQ in action.</p><div class="slot"><div class="slot-day">${slotDay}</div><div class="slot-time">${slotTime.split('—')[0].trim()} PST · 20 minutes · Google Meet</div></div><p>A calendar invite is on its way. Reply to this email if you need to reschedule.</p></div><div class="footer">Need to cancel? Reply to this email.<br/><a href="https://georankhq.co" style="color:#4a4a6a">georankhq.co</a></div></div></body></html>`
}

function adminEmail(type: string, data: Record<string, string>) {
  const rows = Object.entries(data).map(([k,v]) => `<tr><td style="padding:8px 12px;color:#8888aa;font-size:13px;border-bottom:1px solid #161628">${k}</td><td style="padding:8px 12px;color:#d8d8ee;font-size:13px;border-bottom:1px solid #161628">${v}</td></tr>`).join('')
  return `<!DOCTYPE html><html><body style="background:#07070f;font-family:Helvetica Neue,sans-serif;padding:32px"><div style="max-width:480px;margin:0 auto"><div style="font-size:22px;font-weight:900;color:#fff;margin-bottom:24px">GEO<span style="color:${type==='waitlist'?'#f0c040':'#60a5fa'}">${type==='waitlist'?' New Waitlist Lead 🎯':' New Demo Booking 📅'}</span></div><table style="width:100%;background:#0d0d1a;border:1px solid #161628;border-radius:12px;border-collapse:collapse;overflow:hidden">${rows}</table></div></body></html>`
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: cors })
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405, headers: cors })

  try {
    const body = await req.json()
    const { type } = body

    if (type === 'waitlist') {
      const { firstName, lastName, email, businessType, locations, note } = body
      if (!email || !firstName) return new Response(JSON.stringify({ error: 'firstName and email required' }), { status: 400, headers: { ...cors, 'Content-Type': 'application/json' } })

      const { error: dbError } = await supabase.from('waitlist').insert({ first_name: firstName, last_name: lastName, email, business_type: businessType, locations, note })
      if (dbError && dbError.code !== '23505') throw dbError

      await sendEmail({ to: email, subject: `You're on the GEOrankHQ waitlist, ${firstName}! 🎉`, html: waitlistEmail(firstName, email) })
      await sendEmail({ to: ADMIN_EMAIL, subject: `New waitlist lead: ${firstName} ${lastName||''} — ${businessType||'Unknown'}`, html: adminEmail('waitlist', { Name:`${firstName} ${lastName||''}`.trim(), Email:email, 'Business':businessType||'—', Locations:locations||'—', Note:note||'—' }) })

      return new Response(JSON.stringify({ success: true }), { status: 200, headers: { ...cors, 'Content-Type': 'application/json' } })
    }

    if (type === 'demo') {
      const { name, email, slotDay, slotTime } = body
      if (!email || !name || !slotDay) return new Response(JSON.stringify({ error: 'name, email and slotDay required' }), { status: 400, headers: { ...cors, 'Content-Type': 'application/json' } })

      const { error: dbError } = await supabase.from('demo_bookings').insert({ name, email, slot_day: slotDay, slot_time: slotTime })
      if (dbError) throw dbError

      await sendEmail({ to: email, subject: `Demo confirmed: ${slotDay} at ${slotTime.split('—')[0].trim()} PST`, html: demoEmail(name, email, slotDay, slotTime) })
      await sendEmail({ to: ADMIN_EMAIL, subject: `New demo booked: ${name} — ${slotDay}`, html: adminEmail('demo', { Name:name, Email:email, Day:slotDay, Time:slotTime }) })

      return new Response(JSON.stringify({ success: true }), { status: 200, headers: { ...cors, 'Content-Type': 'application/json' } })
    }

    return new Response(JSON.stringify({ error: 'Unknown type' }), { status: 400, headers: { ...cors, 'Content-Type': 'application/json' } })

  } catch (err: any) {
    console.error('submit-lead error:', err)
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { ...cors, 'Content-Type': 'application/json' } })
  }
})
