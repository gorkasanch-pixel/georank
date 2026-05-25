import Stripe from 'https://esm.sh/stripe@14'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, { apiVersion: '2024-06-20' })
const APP_URL = 'https://georankhq.co'

const PRICE_IDS: Record<string, string> = {
  starter: 'price_1TaennDcI0pWddy3r0Hc24wS',
  growth:  'price_1Taep9DcI0pWddy3GKGzOGAT',
  agency:  'price_1TaepRDcI0pWddy3hTSwb14c',
}

const cors = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: cors })
  try {
    const { plan, email } = await req.json()
    const priceId = PRICE_IDS[plan]
    if (!priceId) throw new Error('Invalid plan')

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${APP_URL}/app/?checkout=success&plan=${plan}`,
      cancel_url:  `${APP_URL}/app/?checkout=cancelled`,
      ...(email ? { customer_email: email } : {}),
      allow_promotion_codes: true,
    })

    return new Response(
      JSON.stringify({ url: session.url }),
      { status: 200, headers: { ...cors, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    console.error('Checkout error:', err)
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 400, headers: { ...cors, 'Content-Type': 'application/json' } }
    )
  }
})
