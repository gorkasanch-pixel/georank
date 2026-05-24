import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@14'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, { apiVersion: '2024-06-20' })
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE = Deno.env.get('SERVICE_ROLE_KEY')!
const APP_URL = 'https://georankhq.co'

const PRICE_IDS = {
  starter: 'price_1TaennDcI0pWddy3r0Hc24wS',
  growth:  'price_1Taep9DcI0pWddy3GKGzOGAT',
  agency:  'price_1TaepRDcI0pWddy3hTSwb14c',
}

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: cors })
  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) throw new Error('Missing authorization header')
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE)
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error } = await supabase.auth.getUser(token)
    if (error || !user) throw new Error('Invalid token')
    const { plan } = await req.json()
    const priceId = PRICE_IDS[plan]
    if (!priceId) throw new Error('Invalid plan')
    const { data: profile } = await supabase.from('profiles').select('stripe_customer_id, email, name').eq('id', user.id).single()
    let customerId = profile?.stripe_customer_id
    if (!customerId) {
      const customer = await stripe.customers.create({ email: profile?.email || user.email, name: profile?.name, metadata: { supabase_user_id: user.id } })
      customerId = customer.id
      await supabase.from('profiles').update({ stripe_customer_id: customerId }).eq('id', user.id)
    }
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${APP_URL}/app/?checkout=success&plan=${plan}`,
      cancel_url: `${APP_URL}/app/?checkout=cancelled`,
      subscription_data: { metadata: { supabase_user_id: user.id, plan } },
      allow_promotion_codes: true,
    })
    return new Response(JSON.stringify({ url: session.url }), { status: 200, headers: { ...cors, 'Content-Type': 'application/json' } })
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 400, headers: { ...cors, 'Content-Type': 'application/json' } })
  }
})
