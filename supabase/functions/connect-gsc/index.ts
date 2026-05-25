import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE = Deno.env.get('SERVICE_ROLE_KEY')!
const GOOGLE_CLIENT_ID = Deno.env.get('GOOGLE_CLIENT_ID')!
const GOOGLE_CLIENT_SECRET = Deno.env.get('GOOGLE_CLIENT_SECRET')!
const APP_URL = 'https://georankhq.co'

const cors = {
  'Access-Control-Allow-Origin': '*',
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
      client_id: GOOGLE_CLIENT_ID,
      redirect_uri: `${APP_URL}/app/gsc-callback`,
      response_type: 'code',
      scope: 'https://www.googleapis.com/auth/webmasters.readonly https://www.googleapis.com/auth/userinfo.email',
      access_type: 'offline',
      prompt: 'consent',
      state: merchant_id,
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
        redirect_uri: `${APP_URL}/app/gsc-callback`, grant_type: 'authorization_code',
      }),
    })
    const tokens = await tokenRes.json()
    if (tokens.error) throw new Error(tokens.error_description)
    const sitesRes = await fetch('https://www.googleapis.com/webmasters/v3/sites', {
      headers: { 'Authorization': `Bearer ${tokens.access_token}` }
    })
    const sitesData = await sitesRes.json()
    const sites = sitesData.siteEntry || []
    await supabase.from('merchants').update({
      gsc_access_token: tokens.access_token,
      gsc_refresh_token: tokens.refresh_token,
      gsc_connected: true,
      gsc_sites: JSON.stringify(sites),
    }).eq('id', merchant_id)
    return new Response(
      JSON.stringify({ success: true, sites }),
      { status: 200, headers: { ...cors, 'Content-Type': 'application/json' } }
    )
  }

  if (action === 'keywords') {
    const { merchant_id, site_url } = await req.json()
    const { data: merchant } = await supabase.from('merchants').select('gsc_access_token').eq('id', merchant_id).single()
    if (!merchant?.gsc_access_token) return new Response(JSON.stringify({ error: 'GSC not connected' }), { status: 400, headers: { ...cors, 'Content-Type': 'application/json' } })
    const endDate = new Date().toISOString().split('T')[0]
    const startDate = new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    const kwRes = await fetch(`https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(site_url)}/searchAnalytics/query`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${merchant.gsc_access_token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ startDate, endDate, dimensions: ['query'], rowLimit: 25, orderBy: [{ fieldName: 'impressions', sortOrder: 'DESCENDING' }] }),
    })
    const kwData = await kwRes.json()
    const keywords = (kwData.rows || []).map((row) => ({
      keyword: row.keys[0], clicks: row.clicks, impressions: row.impressions,
      ctr: Math.round(row.ctr * 100) + '%', position: Math.round(row.position),
    }))
    return new Response(JSON.stringify({ keywords }), { status: 200, headers: { ...cors, 'Content-Type': 'application/json' } })
  }

  return new Response(JSON.stringify({ error: 'Unknown action' }), { status: 400, headers: { ...cors, 'Content-Type': 'application/json' } })
})
