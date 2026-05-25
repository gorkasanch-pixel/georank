const PERPLEXITY_KEY = Deno.env.get('PERPLEXITY_API_KEY')!
const OPENAI_KEY     = Deno.env.get('OPENAI_API_KEY')!
const GEMINI_KEY     = Deno.env.get('GEMINI_API_KEY')!

const cors = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

async function queryPerplexity(prompt: string): Promise<string> {
  const res = await fetch('https://api.perplexity.ai/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${PERPLEXITY_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: 'llama-3.1-sonar-small-128k-online', messages: [{ role: 'user', content: prompt }], max_tokens: 300 }),
  })
  const data = await res.json()
  return data.choices?.[0]?.message?.content || ''
}

async function queryOpenAI(prompt: string): Promise<string> {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${OPENAI_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: 'gpt-4o-mini', messages: [{ role: 'user', content: prompt }], max_tokens: 300 }),
  })
  const data = await res.json()
  return data.choices?.[0]?.message?.content || ''
}

async function queryGemini(prompt: string): Promise<string> {
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
  })
  const data = await res.json()
  return data.candidates?.[0]?.content?.parts?.[0]?.text || ''
}

function isCited(response: string, businessName: string): boolean {
  if (!response || !businessName) return false
  const name = businessName.toLowerCase()
  const text = response.toLowerCase()
  const parts = name.split(' ').filter((p: string) => p.length > 3)
  return text.includes(name) || parts.every((p: string) => text.includes(p))
}

function extractSnippet(response: string, businessName: string): string {
  if (!response) return ''
  const lower = response.toLowerCase()
  const idx = lower.indexOf(businessName.toLowerCase())
  if (idx === -1) return response.slice(0, 150) + '...'
  const start = Math.max(0, idx - 40)
  const end = Math.min(response.length, idx + businessName.length + 100)
  return '...' + response.slice(start, end) + '...'
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: cors })
  try {
    const { businessName, keywords, city } = await req.json()
    if (!businessName || !keywords?.length) throw new Error('businessName and keywords are required')
    const location = city ? ` in ${city}` : ''
    const results: Record<string, any> = {}
    const engines = [
      { id: 'perplexity', name: 'Perplexity AI', icon: '🔮', fn: queryPerplexity },
      { id: 'openai',     name: 'ChatGPT',        icon: '🤖', fn: queryOpenAI    },
      { id: 'gemini',     name: 'Google Gemini',  icon: '✨', fn: queryGemini    },
    ]
    for (const engine of engines) {
      const engineResults = []
      for (const keyword of keywords.slice(0, 5)) {
        const prompt = `What are the best ${keyword}${location}? Give me specific business recommendations with names.`
        try {
          const response = await engine.fn(prompt)
          const cited = isCited(response, businessName)
          const snippet = cited ? extractSnippet(response, businessName) : response.slice(0, 120) + '...'
          engineResults.push({ keyword, cited, snippet, checkedAt: new Date().toISOString() })
        } catch (e: any) {
          engineResults.push({ keyword, cited: false, snippet: `Error: ${e.message}`, checkedAt: new Date().toISOString() })
        }
      }
      const citedCount = engineResults.filter((r: any) => r.cited).length
      results[engine.id] = { name: engine.name, icon: engine.icon, cited: citedCount > 0, citedCount, totalChecked: engineResults.length, results: engineResults, checkedAt: new Date().toISOString() }
    }
    results['bing']   = { name: 'Bing Copilot', icon: '🪟', cited: false, noApi: true, checkedAt: new Date().toISOString() }
    results['metaai'] = { name: 'Meta AI',      icon: '📘', cited: false, noApi: true, checkedAt: new Date().toISOString() }
    return new Response(JSON.stringify({ success: true, results }), { status: 200, headers: { ...cors, 'Content-Type': 'application/json' } })
  } catch (err: any) {
    console.error('Citation crawler error:', err)
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { ...cors, 'Content-Type': 'application/json' } })
  }
})
