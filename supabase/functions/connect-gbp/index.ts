import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL     = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE = Deno.env.get('SERVICE_ROLE_KEY')!
const GOOGLE_CLIENT_ID     = Deno.env.get('GOOGLE_CLIENT_ID')!
const GOOGLE_CLIENT_SECRET = Deno.env.get('GOOGLE_CLIENT_SECRET')!
const APP_URL = 'https://georankhq.co'

const cors = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE)

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: cors })
  const url = new URL(req.url)
  const action = url.searchParams.get('action')

  if (action === 'auth-url') {
    const { merchant_id } = await req.json()
    const params = new URLSearchParams({
      client_id:     GOOGLE_CLIENT_ID,
      redirect_uri:  `${APP_URL}/app/gbp-callback`,
      response_type: 'code',
      scope:         'https://www.googleapis.com/auth/business.manage https://www.googleapis.com/auth/userinfo.email',
      access_type:   'offline',
      prompt:        'consent',
      state:         merchant_id,
    })
    return new Response(
      JSON.stringify({ url: `https://accounts.google.com/o/oauth2/v2/auth?${params}` }),
      { status: 200, headers: { ...cors, 'Content-Type': 'application/json' } }
    )
  }

  if (action === 'callback') {
    const { code, merchant_id } = await req.json()
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code, client_id: GOOGLE_CLIENT_ID, client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri: `${APP_URL}/app/gbp-callback`, grant_type: 'authorization_code',
      }),
    })
    const tokens = await tokenRes.json()
    if (tokens.error) throw new Error(tokens.error_description)
    const accountsRes = await fetch('https://mybusinessaccountmanagement.googleapis.com/v1/accounts', {
      headers: { 'Authorization': `Bearer ${tokens.access_token}` }
    })
    const accountsData = await accountsRes.json()
    const gbpAccountId = accountsData.accounts?.[0]?.name
    let locations = []
    if (gbpAccountId) {
      const locRes = await fetch(`https://mybusiness.googleapis.com/v4/${gbpAccountId}/locations`, {
        headers: { 'Authorization': `Bearer ${tokens.access_token}` }
      })
      const locData = await locRes.json()
      locations = locData.locations || []
    }
    await supabase.from('merchants').update({
      gbp_access_token: tokens.access_token,
      gbp_refresh_token: tokens.refresh_token,
      gbp_account_id: gbpAccountId,
      gbp_connected: true,
      gbp_locations: JSON.stringify(locations),
    }).eq('id', merchant_id)
    return new Response(
      JSON.stringify({ success: true, locations }),
      { status: 200, headers: { ...cors, 'Content-Type': 'application/json' } }
    )
  }

  if (action === 'get-data') {
    const { merchant_id } = await req.json()
    const { data: merchant } = await supabase.from('merchants').select('gbp_access_token,gbp_account_id,gbp_locations').eq('id', merchant_id).single()
    if (!merchant?.gbp_access_token) return new Response(JSON.stringify({ error: 'GBP not connected' }), { status: 400, headers: { ...cors, 'Content-Type': 'application/json' } })
    return new Response(JSON.stringify({ locations: JSON.parse(merchant.gbp_locations || '[]') }), { status: 200, headers: { ...cors, 'Content-Type': 'application/json' } })
  }

  return new Response(JSON.stringify({ error: 'Unknown action' }), { status: 400, headers: { ...cors, 'Content-Type': 'application/json' } })
})
