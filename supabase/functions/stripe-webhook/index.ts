import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@14'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, { apiVersion: '2024-06-20' })
const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SERVICE_ROLE_KEY')!)
const WEBHOOK_SECRET = Deno.env.get('STRIPE_WEBHOOK_SECRET')!

const PLAN_MAP = {
  'price_1TaennDcI0pWddy3r0Hc24wS': 'starter',
  'price_1Taep9DcI0pWddy3GKGzOGAT': 'growth',
  'price_1TaepRDcI0pWddy3hTSwb14c': 'agency',
}

Deno.serve(async (req) => {
  const body = await req.text()
  const signature = req.headers.get('stripe-signature')!
  let event
  try {
    event = await stripe.webhooks.constructEventAsync(body, signature, WEBHOOK_SECRET)
  } catch (err) {
    return new Response(`Webhook Error: ${err.message}`, { status: 400 })
  }
  try {
    if (event.type === 'checkout.session.completed') {
      const s = event.data.object
      const userId = s.subscription_data?.metadata?.supabase_user_id
      const plan = s.subscription_data?.metadata?.plan
      if (userId && plan) await supabase.from('profiles').update({ plan, subscription_status: 'active', stripe_customer_id: s.customer }).eq('id', userId)
    } else if (event.type === 'customer.subscription.updated') {
      const s = event.data.object
      const userId = s.metadata?.supabase_user_id
      const plan = PLAN_MAP[s.items.data[0]?.price.id]
      if (userId && plan) await supabase.from('profiles').update({ plan, subscription_status: s.status }).eq('id', userId)
    } else if (event.type === 'customer.subscription.deleted') {
      const s = event.data.object
      const userId = s.metadata?.supabase_user_id
      if (userId) await supabase.from('profiles').update({ plan: 'starter', subscription_status: 'cancelled' }).eq('id', userId)
    } else if (event.type === 'invoice.payment_failed') {
      const inv = event.data.object
      const { data: profile } = await supabase.from('profiles').select('id').eq('stripe_customer_id', inv.customer).single()
      if (profile) await supabase.from('profiles').update({ subscription_status: 'past_due' }).eq('id', profile.id)
    }
  } catch (err) {
    return new Response(`Processing error: ${err.message}`, { status: 500 })
  }
  return new Response(JSON.stringify({ received: true }), { status: 200, headers: { 'Content-Type': 'application/json' } })
})
