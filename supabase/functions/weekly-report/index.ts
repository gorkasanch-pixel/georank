const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')!
const FROM_EMAIL = 'GEOrankHQ <hello@georankhq.co>'

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: cors })
  try {
    const body = await req.json().catch(() => ({}))
    const email = body.test_email || 'gorkasanch@gmail.com'
    const name = body.test_name || 'there'
    const business = body.business_name || 'Your Business'
    const week = Math.ceil((Date.now() - new Date(new Date().getFullYear(),0,1).getTime()) / 604800000)
    const score = 42
    const prevScore = 38
    const diff = score - prevScore

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>GEOrankHQ Weekly Report</title>
</head>
<body style="margin:0;padding:0;background:#0a0a12;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a12;min-height:100vh;">
<tr><td align="center" style="padding:40px 16px;">
<table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">

  <!-- HEADER -->
  <tr><td style="padding-bottom:32px;">
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td><span style="font-size:22px;font-weight:900;color:#ffffff;letter-spacing:0.02em;">GEO<span style="color:#f0c040;">rankHQ</span></span></td>
        <td align="right"><span style="font-size:11px;color:#3d3d5c;font-family:monospace;background:#13131f;border:1px solid #1e1e30;border-radius:6px;padding:4px 10px;">WEEK ${week} · ${new Date().toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})}</span></td>
      </tr>
    </table>
  </td></tr>

  <!-- HERO -->
  <tr><td style="background:linear-gradient(135deg,#0f1a0f 0%,#0a0f1a 100%);border:1px solid #1a2a1a;border-radius:20px;padding:36px 32px;margin-bottom:20px;">
    <p style="margin:0 0 4px;font-size:13px;color:#3d5c3d;text-transform:uppercase;letter-spacing:0.12em;font-weight:700;">WEEKLY AI VISIBILITY REPORT</p>
    <h1 style="margin:0 0 4px;font-size:26px;font-weight:800;color:#ffffff;line-height:1.3;">Good ${new Date().getHours() < 12 ? 'morning' : 'afternoon'}, ${name} 👋</h1>
    <p style="margin:0 0 28px;font-size:14px;color:#4a5a4a;">${business}</p>
    
    <!-- Score display -->
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td style="text-align:center;background:#060f06;border:1px solid #1a3a1a;border-radius:16px;padding:28px 20px;">
          <p style="margin:0 0 6px;font-size:11px;color:#3d5c3d;text-transform:uppercase;letter-spacing:0.15em;font-weight:700;">YOUR GEO SCORE</p>
          <p style="margin:0 0 6px;font-size:80px;font-weight:900;color:#f0c040;line-height:1;">${score}</p>
          <p style="margin:0 0 14px;font-size:14px;color:#f0c040;font-weight:600;">Improving</p>
          <span style="display:inline-block;background:#4ade8018;border:1px solid #4ade8030;border-radius:20px;padding:5px 16px;font-size:13px;color:#4ade80;font-weight:700;">&#9650; +${diff} points this week</span>
        </td>
      </tr>
    </table>
  </td></tr>

  <tr><td style="height:16px;"></td></tr>

  <!-- AI CITATIONS -->
  <tr><td style="background:#0d0d1a;border:1px solid #161628;border-radius:20px;padding:24px 28px;">
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td style="padding-bottom:16px;">
          <p style="margin:0;font-size:15px;font-weight:700;color:#ffffff;">AI Engine Citations</p>
          <p style="margin:4px 0 0;font-size:12px;color:#3d3d5c;">Your business mention status across major AI search engines</p>
        </td>
      </tr>
      <tr>
        <td>
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td width="32%" style="padding-right:6px;">
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr><td style="background:#0a1a0a;border:1px solid #1a4a1a;border-radius:12px;padding:16px 12px;text-align:center;">
                    <p style="margin:0 0 4px;font-size:22px;">🔮</p>
                    <p style="margin:0 0 8px;font-size:11px;color:#3d3d5c;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;">Perplexity</p>
                    <span style="display:inline-block;background:#4ade8020;border:1px solid #4ade8040;border-radius:6px;padding:3px 10px;font-size:12px;color:#4ade80;font-weight:700;">&#10003; Cited</span>
                  </td></tr>
                </table>
              </td>
              <td width="32%" style="padding:0 3px;">
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr><td style="background:#1a0a0a;border:1px solid #4a1a1a;border-radius:12px;padding:16px 12px;text-align:center;">
                    <p style="margin:0 0 4px;font-size:22px;">🤖</p>
                    <p style="margin:0 0 8px;font-size:11px;color:#3d3d5c;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;">ChatGPT</p>
                    <span style="display:inline-block;background:#f8717120;border:1px solid #f8717140;border-radius:6px;padding:3px 10px;font-size:12px;color:#f87171;font-weight:700;">&#10007; Not cited</span>
                  </td></tr>
                </table>
              </td>
              <td width="32%" style="padding-left:6px;">
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr><td style="background:#1a0a0a;border:1px solid #4a1a1a;border-radius:12px;padding:16px 12px;text-align:center;">
                    <p style="margin:0 0 4px;font-size:22px;">✨</p>
                    <p style="margin:0 0 8px;font-size:11px;color:#3d3d5c;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;">Gemini</p>
                    <span style="display:inline-block;background:#f8717120;border:1px solid #f8717140;border-radius:6px;padding:3px 10px;font-size:12px;color:#f87171;font-weight:700;">&#10007; Not cited</span>
                  </td></tr>
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </td></tr>

  <tr><td style="height:16px;"></td></tr>

  <!-- TOP ACTIONS -->
  <tr><td style="background:#0d0d1a;border:1px solid #161628;border-radius:20px;padding:24px 28px;">
    <p style="margin:0 0 4px;font-size:15px;font-weight:700;color:#ffffff;">This Week's Top Actions</p>
    <p style="margin:0 0 20px;font-size:12px;color:#3d3d5c;">Complete these to improve your score next week</p>
    
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr><td style="padding:12px 0;border-bottom:1px solid #161628;">
        <table width="100%" cellpadding="0" cellspacing="0"><tr>
          <td width="32" style="vertical-align:top;padding-top:1px;">
            <span style="display:inline-block;width:24px;height:24px;background:#f0c04015;border:1px solid #f0c04030;border-radius:6px;text-align:center;line-height:24px;font-size:12px;color:#f0c040;font-weight:700;">1</span>
          </td>
          <td style="padding-left:10px;">
            <p style="margin:0 0 2px;font-size:13px;font-weight:600;color:#d8d8ee;">Add FAQ schema markup to your website</p>
            <p style="margin:0;font-size:12px;color:#3d3d5c;">Fastest way to get cited by AI engines — takes 10 minutes</p>
          </td>
          <td width="80" align="right"><span style="font-size:11px;color:#f0c040;background:#f0c04015;border-radius:4px;padding:2px 8px;">High impact</span></td>
        </tr></table>
      </td></tr>
      <tr><td style="padding:12px 0;border-bottom:1px solid #161628;">
        <table width="100%" cellpadding="0" cellspacing="0"><tr>
          <td width="32" style="vertical-align:top;padding-top:1px;">
            <span style="display:inline-block;width:24px;height:24px;background:#60a5fa15;border:1px solid #60a5fa30;border-radius:6px;text-align:center;line-height:24px;font-size:12px;color:#60a5fa;font-weight:700;">2</span>
          </td>
          <td style="padding-left:10px;">
            <p style="margin:0 0 2px;font-size:13px;font-weight:600;color:#d8d8ee;">Generate 3 new AI snippets for common questions</p>
            <p style="margin:0;font-size:12px;color:#3d3d5c;">Use the AI Snippet Generator in your dashboard</p>
          </td>
          <td width="80" align="right"><span style="font-size:11px;color:#60a5fa;background:#60a5fa15;border-radius:4px;padding:2px 8px;">Medium</span></td>
        </tr></table>
      </td></tr>
      <tr><td style="padding:12px 0;">
        <table width="100%" cellpadding="0" cellspacing="0"><tr>
          <td width="32" style="vertical-align:top;padding-top:1px;">
            <span style="display:inline-block;width:24px;height:24px;background:#4ade8015;border:1px solid #4ade8030;border-radius:6px;text-align:center;line-height:24px;font-size:12px;color:#4ade80;font-weight:700;">3</span>
          </td>
          <td style="padding-left:10px;">
            <p style="margin:0 0 2px;font-size:13px;font-weight:600;color:#d8d8ee;">Add recent photos to your Google Business Profile</p>
            <p style="margin:0;font-size:12px;color:#3d3d5c;">Gemini pulls heavily from GBP for local recommendations</p>
          </td>
          <td width="80" align="right"><span style="font-size:11px;color:#4ade80;background:#4ade8015;border-radius:4px;padding:2px 8px;">Quick win</span></td>
        </tr></table>
      </td></tr>
    </table>
  </td></tr>

  <tr><td style="height:24px;"></td></tr>

  <!-- CTA -->
  <tr><td style="background:linear-gradient(135deg,#0f1a0f,#0a0f1a);border:1px solid #1a2a2a;border-radius:20px;padding:28px 32px;text-align:center;">
    <p style="margin:0 0 6px;font-size:18px;font-weight:800;color:#ffffff;">Ready to improve your score?</p>
    <p style="margin:0 0 20px;font-size:13px;color:#3d5c5c;">Complete this week's actions in your dashboard and watch your GEO Score climb.</p>
    <a href="https://georankhq.co/app/" style="display:inline-block;background:#f0c040;color:#07070f;font-weight:800;font-size:15px;padding:14px 36px;border-radius:12px;text-decoration:none;letter-spacing:0.01em;">Open My Dashboard &#8594;</a>
  </td></tr>

  <tr><td style="height:32px;"></td></tr>

  <!-- FOOTER -->
  <tr><td style="border-top:1px solid #161628;padding-top:24px;text-align:center;">
    <p style="margin:0 0 6px;font-size:12px;color:#2a2a3c;">GEOrankHQ &bull; <a href="mailto:hello@georankhq.co" style="color:#2a2a3c;text-decoration:none;">hello@georankhq.co</a></p>
    <p style="margin:0;font-size:11px;"><a href="https://georankhq.co/unsubscribe.html?email=${encodeURIComponent(email)}" style="color:#2a2a3c;text-decoration:none;">Unsubscribe from weekly reports</a> &bull; <a href="https://georankhq.co/legal.html" style="color:#2a2a3c;text-decoration:none;">Privacy Policy</a></p>
  </td></tr>

</table>
</td></tr>
</table>
</body>
</html>`

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: FROM_EMAIL, to: email, subject: `Your GEOrankHQ Weekly Report - Week ${week} (Score: ${score})`, html }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(JSON.stringify(data))
    return new Response(JSON.stringify({ success: true, sent: 1 }), { status: 200, headers: { ...cors, 'Content-Type': 'application/json' } })
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { ...cors, 'Content-Type': 'application/json' } })
  }
})
