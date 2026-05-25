import { useState, useEffect } from 'react'
import { C, PLANS, SCHEMA_TYPES, SAMPLE_MERCHANTS, SAMPLE_KEYWORDS, CHART_DATA } from '../constants'
import { db } from '../storage'
import { Pill, Btn, Card, Label, Pulse, ScoreRing, Modal, Spinner } from '../components/ui'

function MiniChart({ data, color }) {
  const max = Math.max(...data), min = Math.min(...data)
  const pts = data.map((v,i) => `${(i/(data.length-1))*200},${56-((v-min)/(max-min||1))*50}`).join(' ')
  const id = 'mc' + color.replace('#','')
  return (
    <svg width={200} height={60} style={{ overflow:'visible' }}>
      <defs><linearGradient id={id} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={color} stopOpacity="0.3"/><stop offset="100%" stopColor={color} stopOpacity="0"/></linearGradient></defs>
      <polygon points={`0,60 ${pts} 200,60`} fill={`url(#${id})`}/>
      <polyline points={pts} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function AuthScreen({ onAuth }) {
  const [mode, setMode] = useState('login')
  const [step, setStep] = useState(1)
  const [plan, setPlan] = useState('growth')
  const [email, setEmail] = useState('')
  const [pass, setPass] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState('')


  const sendReset = async () => {
    if (!email) { setErr('Please enter your email.'); return }
    setLoading(true); setErr('')
    // When Supabase auth is wired up, replace with:
    // await supabase.auth.resetPasswordForEmail(email, { redirectTo: 'https://georankhq.co/app/reset' })
    await new Promise(r => setTimeout(r, 800))
    setLoading(false)
    setErr('reset_sent')
  }
  const go = async () => {
    if (!email || !pass) { setErr('All fields required.'); return }
    setLoading(true); setErr('')
    await new Promise(r => setTimeout(r, 800))
    const u = { id:'u_'+Date.now(), email, name: name||email.split('@')[0], plan, role:'merchant', createdAt:new Date().toISOString() }
    db.set('user', u)
    setLoading(false)
    onAuth(u)
  }

  return (
    <div style={{ minHeight:'100vh', background:C.bg, display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
      <div style={{ width:'100%', maxWidth:460, animation:'fadeIn .4s ease' }}>
        <div style={{ textAlign:'center', marginBottom:32 }}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:10, marginBottom:6 }}>
            <div style={{ width:36, height:36, background:'linear-gradient(135deg,#f0c040,#f472b6)', borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18 }}>✦</div>
            <span style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:22, color:'#e8e8f0' }}>GEOrank</span>
          </div>
          <div style={{ color:C.muted, fontSize:13 }}>Optimize for Google & AI Search</div>
        </div>

        {mode === 'login' && (
          <Card>
            <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:18, color:C.text, marginBottom:20 }}>Welcome back</div>
            {[['Email','email',email,setEmail,'you@business.com'],['Password','password',pass,setPass,'••••••••']].map(([lbl,type,val,set,ph]) => (
              <div key={lbl} style={{ marginBottom:14 }}>
                <Label>{lbl}</Label>
                <input type={type} value={val} onChange={e=>set(e.target.value)} onKeyDown={e=>e.key==='Enter'&&go()} placeholder={ph} style={{ width:'100%', background:'#060610', border:`1px solid ${C.border}`, borderRadius:10, padding:'10px 14px', color:C.text, fontSize:13.5, fontFamily:'inherit', outline:'none' }}/>
              </div>
            ))}
            {err && <div style={{ color:C.red, fontSize:12, marginBottom:12 }}>{err}</div>}
            <Btn onClick={go} disabled={loading} style={{ width:'100%', marginBottom:14 }}>{loading ? 'Signing in…' : 'Sign In →'}</Btn>
            <div style={{ display:'flex', justifyContent:'space-between', fontSize:12 }}>
              <span style={{ cursor:'pointer', color:C.muted }} onClick={()=>{setMode('forgot');setErr('')}}>Forgot password?</span>
              <span style={{ cursor:'pointer', color:C.blue }} onClick={()=>{setMode('signup');setStep(1);setErr('')}}>Create account →</span>
            </div>
          </Card>
        )}


        {mode === 'forgot' && (
          <Card>
            <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:18, color:C.text, marginBottom:4 }}>Reset password</div>
            <div style={{ color:C.muted, fontSize:13, marginBottom:20 }}>Enter your email and we'll send a reset link.</div>
            <div style={{ marginBottom:14 }}>
              <Label>Email</Label>
              <input type="email" value={email} onChange={e=>setEmail(e.target.value)} onKeyDown={e=>{ if(e.key==='Enter') sendReset() }} placeholder="you@business.com" style={{ width:'100%', background:'#060610', border:`1px solid ${C.border}`, borderRadius:10, padding:'10px 14px', color:C.text, fontSize:13.5, fontFamily:'inherit', outline:'none' }}/>
            </div>
            {err && <div style={{ color:C.red, fontSize:12, marginBottom:12 }}>{err}</div>}
            {mode === 'forgot' && email && err === 'reset_sent' && (
              <div style={{ background:`${C.green}11`, border:`1px solid ${C.green}33`, borderRadius:10, padding:'10px 14px', marginBottom:14, fontSize:13, color:C.green }}>
                ✓ Reset link sent! Check your inbox.
              </div>
            )}
            <Btn onClick={sendReset} disabled={loading} style={{ width:'100%', marginBottom:14 }}>{loading ? 'Sending…' : 'Send Reset Link →'}</Btn>
            <div style={{ textAlign:'center', fontSize:12 }}><span style={{ cursor:'pointer', color:C.blue }} onClick={()=>{setMode('login');setErr('')}}>← Back to login</span></div>
          </Card>
        )}
        {mode === 'signup' && step === 1 && (
          <Card>
            <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:18, color:C.text, marginBottom:4 }}>Create account</div>
            <div style={{ color:C.muted, fontSize:12, marginBottom:20 }}>Step 1 of 3</div>
            {[['Full Name','text',name,setName,'Jane Smith'],['Email','email',email,setEmail,'jane@agency.com'],['Password','password',pass,setPass,'Min. 8 characters']].map(([lbl,type,val,set,ph]) => (
              <div key={lbl} style={{ marginBottom:14 }}>
                <Label>{lbl}</Label>
                <input type={type} value={val} onChange={e=>set(e.target.value)} placeholder={ph} style={{ width:'100%', background:'#060610', border:`1px solid ${C.border}`, borderRadius:10, padding:'10px 14px', color:C.text, fontSize:13.5, fontFamily:'inherit', outline:'none' }}/>
              </div>
            ))}
            {err && <div style={{ color:C.red, fontSize:12, marginBottom:12 }}>{err}</div>}
            <Btn onClick={()=>{ if(!email||!pass||!name){setErr('All fields required.');return} setErr(''); setStep(2) }} style={{ width:'100%', marginBottom:14 }}>Continue →</Btn>
            <div style={{ textAlign:'center', fontSize:12 }}><span style={{ cursor:'pointer', color:C.blue }} onClick={()=>setMode('login')}>Already have an account?</span></div>
          </Card>
        )}

        {mode === 'signup' && step === 2 && (
          <Card>
            <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:18, color:C.text, marginBottom:4 }}>Choose a plan</div>
            <div style={{ color:C.muted, fontSize:12, marginBottom:20 }}>Step 2 of 3</div>
            {Object.entries(PLANS).map(([id,p]) => (
              <div key={id} onClick={()=>setPlan(id)} style={{ background:plan===id?'#0d1a0d':'#060610', border:`1px solid ${plan===id?p.color:C.border}`, borderRadius:12, padding:'14px 16px', marginBottom:10, cursor:'pointer' }}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
                  <span style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, color:p.color }}>{p.name}</span>
                  <span style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, color:C.text }}>${p.price}<span style={{ fontSize:11, color:C.muted, fontWeight:400 }}>/mo</span></span>
                </div>
                <div style={{ fontSize:11, color:C.muted }}>{p.features.slice(0,3).join(' · ')}</div>
              </div>
            ))}
            <div style={{ display:'flex', gap:10, marginTop:14 }}>
              <Btn onClick={()=>setStep(1)} outline color={C.muted} style={{ flex:1 }}>← Back</Btn>
              <Btn onClick={()=>setStep(3)} style={{ flex:2 }}>Continue →</Btn>
            </div>
          </Card>
        )}

        {mode === 'signup' && step === 3 && (
          <Card>
            <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:18, color:C.text, marginBottom:4 }}>Billing</div>
            <div style={{ color:C.muted, fontSize:12, marginBottom:20 }}>Step 3 of 3 — Payment details</div>
            {[['CARD NUMBER','4242 4242 4242 4242'],['EXPIRY','MM / YY'],['CVC','•••']].map(([lbl,ph]) => (
              <div key={lbl} style={{ background:'#060610', border:`1px solid ${C.border}`, borderRadius:10, padding:'12px 16px', marginBottom:12 }}>
                <div style={{ fontSize:10, color:C.muted, marginBottom:6 }}>{lbl}</div>
                <input placeholder={ph} style={{ background:'transparent', border:'none', color:C.text, fontSize:14, fontFamily:'monospace', outline:'none', width:'100%' }}/>
              </div>
            ))}
            <div style={{ background:`${C.green}11`, border:`1px solid ${C.green}33`, borderRadius:10, padding:'10px 14px', marginBottom:16, fontSize:12, color:C.green }}>✓ 14-day free trial · Cancel anytime · Powered by Stripe</div>
            <div style={{ display:'flex', gap:10 }}>
              <Btn onClick={()=>setStep(2)} outline color={C.muted} style={{ flex:1 }}>← Back</Btn>
              <Btn onClick={go} disabled={loading} color={PLANS[plan].color} style={{ flex:2 }}>{loading ? 'Processing…' : `Start ${PLANS[plan].name} Trial →`}</Btn>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}

function AiSnippetsTab({ merchant, planSnippets }) {
  const [prompt, setPrompt] = useState('')
  const [loading, setLoading] = useState(false)
  const [snippets, setSnippets] = useState([])

  useEffect(() => { const d = db.get(`snips_${merchant.id}`); if(d) setSnippets(d) }, [merchant.id])

  const generate = async () => {
    if (!prompt.trim()) return
    if (snippets.length >= (planSnippets === 999 ? 9999 : planSnippets)) { alert('Snippet limit reached. Upgrade to generate more.'); return }
    setLoading(true)
    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method:'POST',
        headers:{'Content-Type':'application/json','x-api-key':import.meta.env.VITE_ANTHROPIC_KEY,'anthropic-version':'2023-06-01','anthropic-dangerous-direct-browser-access':'true'},
        body:JSON.stringify({ model:'claude-sonnet-4-20250514', max_tokens:1000,
          messages:[{ role:'user', content:`GEO expert. Merchant: "${merchant.name}" (${merchant.category}, ${merchant.city}). Question: "${prompt}". Return ONLY valid JSON: {"shortAnswer":"2-3 sentence AI-citation answer","fullAnswer":"4-6 sentence FAQ","schema":"JSON-LD FAQ string","keywords":["kw1","kw2","kw3"]}` }] })
      })
      const data = await res.json()
      const text = data.content?.find(b=>b.type==='text')?.text || '{}'
      const parsed = JSON.parse(text.replace(/```json|```/g,'').trim())
      const updated = [{ id:Date.now(), question:prompt, ...parsed, createdAt:new Date().toISOString() }, ...snippets]
      setSnippets(updated)
      db.set(`snips_${merchant.id}`, updated)
      setPrompt('')
    } catch { alert('Error generating. Please try again.') }
    setLoading(false)
  }

  return (
    <div>
      <div style={{ color:C.muted, fontSize:13, marginBottom:20 }}>Generate optimized answer snippets for ChatGPT, Perplexity, Gemini & more to maximize AI citation coverage.</div>
      <Card style={{ marginBottom:20 }}>
        <Label>Generate AI Answer Snippet</Label>
        <div style={{ display:'flex', gap:10 }}>
          <input value={prompt} onChange={e=>setPrompt(e.target.value)} onKeyDown={e=>e.key==='Enter'&&generate()} placeholder='e.g. "What are your hours?" or "Do you have parking?"' style={{ flex:1, background:'#060610', border:`1px solid ${C.border}`, borderRadius:10, padding:'11px 16px', color:C.text, fontSize:13.5, fontFamily:'inherit', outline:'none' }}/>
          <Btn onClick={generate} disabled={loading} color={C.blue}>{loading ? 'Generating…' : 'Generate ✦'}</Btn>
        </div>
        <div style={{ fontSize:11, color:C.muted, marginTop:8 }}>{snippets.length} / {planSnippets===999?'∞':planSnippets} snippets this month</div>
      </Card>
      {snippets.length === 0 && <div style={{ textAlign:'center', padding:'40px 0', color:'#222' }}>No snippets yet — generate your first above.</div>}
      {snippets.map(s => (
        <Card key={s.id} style={{ marginBottom:14 }}>
          <div style={{ fontSize:11, color:C.blue, textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:8, fontWeight:700 }}>Q: {s.question}</div>
          {s.shortAnswer && <div style={{ background:'#06060f', borderLeft:`3px solid ${C.blue}`, borderRadius:8, padding:'10px 14px', marginBottom:12, fontSize:13, color:'#c8d8ff', lineHeight:1.6 }}><span style={{ fontSize:10, color:C.muted, display:'block', marginBottom:4 }}>SHORT ANSWER</span>{s.shortAnswer}</div>}
          {s.fullAnswer && <div style={{ fontSize:13, color:C.muted, lineHeight:1.7, marginBottom:10 }}><span style={{ fontSize:10, display:'block', marginBottom:4 }}>FULL FAQ</span>{s.fullAnswer}</div>}
          {s.keywords?.length > 0 && <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:10 }}>{s.keywords.map(k => <Pill key={k} color={C.blue}>{k}</Pill>)}</div>}
          {s.schema && <details><summary style={{ cursor:'pointer', fontSize:11, color:C.muted, fontWeight:700 }}>View Schema Markup</summary><pre style={{ fontSize:10.5, color:C.green, background:'#060610', borderRadius:8, padding:12, overflow:'auto', marginTop:8, lineHeight:1.6 }}>{s.schema}</pre></details>}
        </Card>
      ))}
    </div>
  )
}

const TABS  = ['Dashboard','Business Profile','AI Snippets','Schema Builder','Rank Tracker','AI Citations','Reports','Billing','Help']
const ICONS = ['📊','🏪','🤖','🏗️','📈','🔮','📋','💳','❓']

export default function MerchantApp() {
  const [user, setUser]         = useState(null)
  const [booting, setBooting]   = useState(true)
  const [tab, setTab]           = useState('Dashboard')
  const [merchants, setMerchants] = useState(SAMPLE_MERCHANTS)
  const [merchant, setMerchant] = useState(SAMPLE_MERCHANTS[0])
  const [gsc, setGsc]           = useState(false)
  const [showUpgrade, setUpgrade] = useState(false)
  const [activeSchema, setSchema] = useState(null)
  const [openFaq, setOpenFaq]       = useState(null)
  const [keywords, setKeywords] = useState(SAMPLE_KEYWORDS)
  const [addingKw, setAddingKw] = useState(false)
  const [newKw, setNewKw]       = useState('')
  const [profile, setProfile]   = useState({ name:'Bloom & Grind Coffee', category:'Café / Coffee Shop', address:'142 Merchant Row, Suite 4', phone:'(415) 555-0192', hours:'Mon–Fri 7am–8pm', website:'bloomandgrind.com', desc:'Artisan coffee, organic pastries, and a warm space to work or unwind.' })

  useEffect(() => { const u = db.get('user'); setUser(u); setBooting(false) }, [])

  const logout = () => { db.del('user'); setUser(null) }
  const handlePlanSelect = async (p) => {
    try {
      const res = await fetch('https://ezltbarrkvlfijbkwwam.supabase.co/functions/v1/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: p, email: user.email })
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        // Fallback: update locally if checkout fails (e.g. not using real auth yet)
        const u = {...user, plan:p}; setUser(u); db.set('user', u); setUpgrade(false)
      }
    } catch(e) {
      // Fallback to local update
      const u = {...user, plan:p}; setUser(u); db.set('user', u); setUpgrade(false)
    }
  }

  if (booting) return <div style={{ minHeight:'100vh', background:C.bg, display:'flex', alignItems:'center', justifyContent:'center' }}><Spinner/></div>
  if (!user)   return <AuthScreen onAuth={u=>setUser(u)}/>

  const plan = PLANS[user.plan] || PLANS.growth

  const renderContent = () => {
    if (tab === 'Dashboard') return (
      <div>
        {/* GSC Panel */}
        <Card style={{ marginBottom:20 }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <div style={{ display:'flex', alignItems:'center', gap:12 }}>
              <div style={{ width:40, height:40, background:'#1a1a2e', borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center', fontSize:20 }}>🔍</div>
              <div>
                <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, color:C.text, marginBottom:2 }}>Google Search Console</div>
                <div style={{ fontSize:12, color:C.muted }}>{gsc ? <span style={{ color:C.green }}>✓ Connected · Syncing data</span> : 'Connect to import real keyword & CTR data'}</div>
              </div>
            </div>
            {gsc ? <Pill color={C.green}>Live</Pill> : <Btn small color={C.blue} onClick={async()=>{ await new Promise(r=>setTimeout(r,1000)); setGsc(true) }}>Connect GSC</Btn>}
          </div>
        </Card>
        {/* Score rings */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr 1fr', gap:16, marginBottom:24 }}>
          {[{label:'Overall GEO Score',score:merchant.score,color:C.yellow},{label:'Google Search',score:merchant.googleScore,color:C.green},{label:'AI Engine Rank',score:merchant.aiScore,color:C.blue},{label:'Local Pack',score:merchant.localScore,color:C.pink}].map(s=>(
            <Card key={s.label} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:12, padding:'22px 16px' }}>
              <ScoreRing score={s.score} color={s.color} size={84}/>
              <div style={{ fontSize:11, color:C.muted, textTransform:'uppercase', letterSpacing:'0.08em', fontWeight:600, textAlign:'center' }}>{s.label}</div>
            </Card>
          ))}
        </div>
        {/* Insights */}
        <Label>Optimization Insights</Label>
        {[
          {type:'critical',icon:'⚡',title:'Missing FAQ Schema',desc:'AI engines pull answers from FAQ schema directly.',action:'Fix Now',to:'Schema Builder'},
          {type:'warning', icon:'🗺️',title:'Inconsistent NAP Data',desc:'Name/Address/Phone differs across 3 directories.',action:'Sync Data',to:'Business Profile'},
          {type:'success', icon:'✅',title:'GBP Profile Active',desc:'AI engines pull summaries from your GBP feed.',action:'View GBP',to:null},
          {type:'warning', icon:'🤖',title:'Weak AI Coverage',desc:'Only 23% of common questions covered in your content.',action:'Generate Answers',to:'AI Snippets'},
          {type:'critical',icon:'📸',title:'No Product Schema',desc:"AI shopping agents can't surface your menu.",action:'Add Schema',to:'Schema Builder'},
        ].map((ins,i) => (
          <div key={i} style={{ background:C.card, border:`1px solid ${ins.type==='critical'?'#3a1a1a':ins.type==='warning'?'#2a2a10':'#0a2a1a'}`, borderLeft:`3px solid ${ins.type==='critical'?C.red:ins.type==='warning'?C.yellow:C.green}`, borderRadius:12, padding:'13px 18px', display:'flex', alignItems:'center', gap:14, marginBottom:10 }}>
            <span style={{ fontSize:20 }}>{ins.icon}</span>
            <div style={{ flex:1 }}><div style={{ fontWeight:700, fontSize:13.5, color:C.text, marginBottom:2, fontFamily:"'Syne',sans-serif" }}>{ins.title}</div><div style={{ fontSize:12, color:C.muted, lineHeight:1.5 }}>{ins.desc}</div></div>
            <Btn small color={ins.type==='critical'?C.red:ins.type==='warning'?C.yellow:C.green} onClick={()=>ins.to&&setTab(ins.to)}>{ins.action}</Btn>
          </div>
        ))}
      </div>
    )

    if (tab === 'Business Profile') return (
      <div>
        <div style={{ color:C.muted, fontSize:13, marginBottom:20 }}>Syncs to Google Business Profile, Bing Places, Apple Maps, and AI knowledge graphs. NAP consistency is critical.</div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom:20 }}>
          {Object.entries(profile).map(([key,val]) => (
            <Card key={key} style={{ gridColumn:key==='desc'?'1/-1':undefined, padding:'14px 16px' }}>
              <Label>{key==='desc'?'Description':key.charAt(0).toUpperCase()+key.slice(1)}</Label>
              {key === 'desc'
                ? <textarea value={val} onChange={e=>setProfile(p=>({...p,[key]:e.target.value}))} style={{ width:'100%', background:'transparent', border:'none', color:C.text, fontSize:13.5, fontFamily:'inherit', resize:'none', outline:'none', lineHeight:1.6 }} rows={3}/>
                : <input value={val} onChange={e=>setProfile(p=>({...p,[key]:e.target.value}))} style={{ width:'100%', background:'transparent', border:'none', color:C.text, fontSize:14, fontFamily:"'Syne',sans-serif", outline:'none' }}/>
              }
            </Card>
          ))}
        </div>
        <div style={{ display:'flex', gap:10, marginBottom:20 }}>
          <Btn color={C.yellow}>Sync to All Directories →</Btn>
          <Btn outline color={C.blue}>Connect Google Business Profile</Btn>
        </div>
        <Label>Directory Sync Status</Label>
        <div style={{ display:'flex', flexWrap:'wrap', gap:8, marginTop:8 }}>
          {[['Google Business Profile',true],['Bing Places',true],['Apple Maps',true],['Yelp',false],['TripAdvisor',false],['Foursquare',false]].map(([d,synced]) => (
            <div key={d} style={{ display:'flex', alignItems:'center', gap:6, background:'#060610', border:`1px solid ${synced?C.green+'44':C.border}`, borderRadius:8, padding:'6px 12px', fontSize:12 }}>
              <span style={{ color:synced?C.green:C.muted }}>{synced?'✓':'○'}</span>
              <span style={{ color:synced?C.text:C.muted }}>{d}</span>
            </div>
          ))}
        </div>
      </div>
    )

    if (tab === 'AI Snippets') return <AiSnippetsTab merchant={merchant} planSnippets={plan.snippets}/>

    if (tab === 'Schema Builder') {
      const generateSchema = (type) => {
        const schemas = {
          local: {
            "@context": "https://schema.org",
            "@type": "LocalBusiness",
            "name": profile.name,
            "url": `https://${profile.website}`,
            "telephone": profile.phone,
            "address": { "@type": "PostalAddress", "streetAddress": profile.address },
            "openingHours": profile.hours,
            "description": profile.desc,
            "priceRange": "$$"
          },
          faq: {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
              { "@type": "Question", "name": `What are ${profile.name}'s hours?`, "acceptedAnswer": { "@type": "Answer", "text": profile.hours }},
              { "@type": "Question", "name": `Where is ${profile.name} located?`, "acceptedAnswer": { "@type": "Answer", "text": profile.address }},
              { "@type": "Question", "name": `How can I contact ${profile.name}?`, "acceptedAnswer": { "@type": "Answer", "text": `Call us at ${profile.phone} or visit ${profile.website}` }},
              { "@type": "Question", "name": `What does ${profile.name} offer?`, "acceptedAnswer": { "@type": "Answer", "text": profile.desc }}
            ]
          },
          product: {
            "@context": "https://schema.org",
            "@type": "Product",
            "name": `${profile.name} — Featured Item`,
            "description": profile.desc,
            "brand": { "@type": "Brand", "name": profile.name },
            "offers": { "@type": "Offer", "priceCurrency": "USD", "price": "0.00", "availability": "https://schema.org/InStock", "url": `https://${profile.website}` },
            "aggregateRating": { "@type": "AggregateRating", "ratingValue": "4.8", "reviewCount": "124" }
          },
          review: {
            "@context": "https://schema.org",
            "@type": "LocalBusiness",
            "name": profile.name,
            "aggregateRating": { "@type": "AggregateRating", "ratingValue": "4.8", "bestRating": "5", "worstRating": "1", "reviewCount": "124" },
            "review": [{ "@type": "Review", "author": { "@type": "Person", "name": "Happy Customer" }, "reviewRating": { "@type": "Rating", "ratingValue": "5" }, "reviewBody": `${profile.name} is absolutely fantastic. Highly recommend!` }]
          },
          event: {
            "@context": "https://schema.org",
            "@type": "Event",
            "name": `Special Event at ${profile.name}`,
            "startDate": "2026-06-01T18:00",
            "endDate": "2026-06-01T21:00",
            "location": { "@type": "Place", "name": profile.name, "address": { "@type": "PostalAddress", "streetAddress": profile.address }},
            "organizer": { "@type": "Organization", "name": profile.name, "url": `https://${profile.website}` },
            "description": `Join us for a special event at ${profile.name}. ${profile.desc}`,
            "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD", "availability": "https://schema.org/InStock" }
          },
          menu: {
            "@context": "https://schema.org",
            "@type": "Menu",
            "name": `${profile.name} Menu`,
            "url": `https://${profile.website}/menu`,
            "hasMenuSection": [{ "@type": "MenuSection", "name": "Featured Items", "hasMenuItem": [
              { "@type": "MenuItem", "name": "Signature Item", "description": "Our most popular offering", "offers": { "@type": "Offer", "price": "12.00", "priceCurrency": "USD" }},
              { "@type": "MenuItem", "name": "Daily Special", "description": "Fresh and seasonal", "offers": { "@type": "Offer", "price": "9.00", "priceCurrency": "USD" }}
            ]}]
          }
        }
        return JSON.stringify(schemas[type] || {}, null, 2)
      }

      const schemaCode = activeSchema ? `<script type="application/ld+json">\n${generateSchema(activeSchema)}\n</script>` : ''

      const copySchema = () => {
        navigator.clipboard.writeText(schemaCode)
          .then(() => alert('Schema copied to clipboard!'))
          .catch(() => alert('Select the code and copy with Cmd+C'))
      }

      const installSteps = [
        { step:'1', title:'Copy the code above', desc:'Click the green Copy Code button to copy the schema markup to your clipboard.' },
        { step:'2', title:'Open your website editor', desc:'Log in to wherever your website is hosted — WordPress, Squarespace, Wix, Shopify, or your custom site.' },
        { step:'3', title:'Paste it before </head>', desc:'Find the HTML section and paste the code just before the closing </head> tag. In WordPress use "Insert Headers and Footers" plugin. In Squarespace go to Settings → Advanced → Code Injection. In Wix go to Settings → Custom Code.' },
        { step:'4', title:'Save and publish', desc:'Save your changes and publish your website. The schema goes live immediately.' },
        { step:'5', title:'Validate it worked', desc:"Click Validate above to open Google's Rich Results Test. Paste your URL and confirm the schema is detected." },
      ]

      const platforms = [
        ['WordPress','https://wordpress.org/plugins/insert-headers-and-footers/'],
        ['Squarespace','https://support.squarespace.com/hc/en-us/articles/205815908'],
        ['Wix','https://support.wix.com/en/article/embedding-custom-code-on-your-site'],
        ['Shopify','https://help.shopify.com/en/manual/online-store/themes/theme-structure/extend/edit-theme-code'],
        ['Webflow','https://university.webflow.com/lesson/custom-code-in-the-head-and-body-tags'],
      ]

      return (
        <div>
          <div style={{ color:C.muted, fontSize:13, marginBottom:20 }}>Schema.org markup tells AI engines exactly what your business is, what you offer, and where you are. Each type below generates unique, ready-to-use code filled in with your business data.</div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:12, marginBottom:20 }}>
            {SCHEMA_TYPES.map(s => (
              <div key={s.id} onClick={()=>setSchema(activeSchema===s.id?null:s.id)} style={{ background:activeSchema===s.id?'#0d1a2e':C.card, border:`1px solid ${activeSchema===s.id?C.blue:C.border}`, borderRadius:14, padding:16, cursor:'pointer', transition:'all .15s' }}>
                <div style={{ fontSize:24, marginBottom:8 }}>{s.icon}</div>
                <div style={{ fontWeight:800, fontSize:13, color:C.text, marginBottom:4, fontFamily:"'Syne',sans-serif" }}>{s.label}</div>
                <div style={{ fontSize:11.5, color:C.muted, lineHeight:1.5 }}>{s.desc}</div>
              </div>
            ))}
          </div>
          {activeSchema && (<>
            <Card style={{ marginBottom:16 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
                <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, color:C.text }}>{SCHEMA_TYPES.find(s=>s.id===activeSchema)?.label} Schema — Ready to use</div>
                <div style={{ display:'flex', gap:8 }}>
                  <Btn small outline color={C.muted} onClick={()=>window.open('https://validator.schema.org','_blank')}>Validate ↗</Btn>
                  <Btn small color={C.green} onClick={copySchema}>Copy Code</Btn>
                </div>
              </div>
              <pre style={{ fontSize:10.5, color:C.green, lineHeight:1.7, overflow:'auto', background:'#060610', borderRadius:10, padding:16, maxHeight:320 }}>{schemaCode}</pre>
            </Card>
            <Card>
              <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, color:C.text, marginBottom:4 }}>How to add this to your website</div>
              <div style={{ fontSize:12, color:C.muted, marginBottom:16 }}>Follow these steps. Jump to your platform shortcut below if you use a website builder.</div>
              {installSteps.map((s,i) => (
                <div key={i} style={{ display:'flex', gap:14, padding:'12px 0', borderBottom:i<installSteps.length-1?`1px solid ${C.border}`:'none' }}>
                  <div style={{ width:28, height:28, borderRadius:'50%', background:'#0a1428', border:`1px solid ${C.blue}44`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:800, color:C.blue, flexShrink:0, fontFamily:"'Syne',sans-serif" }}>{s.step}</div>
                  <div>
                    <div style={{ fontSize:13, fontWeight:700, color:C.text, marginBottom:3 }}>{s.title}</div>
                    <div style={{ fontSize:12, color:C.muted, lineHeight:1.6 }}>{s.desc}</div>
                  </div>
                </div>
              ))}
              <div style={{ marginTop:16, padding:'12px 14px', background:'#060610', borderRadius:10 }}>
                <div style={{ fontSize:11, color:C.muted, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:10 }}>Quick links by platform</div>
                <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
                  {platforms.map(([name, url]) => (
                    <a key={name} href={url} target="_blank" rel="noopener noreferrer" style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:8, padding:'5px 12px', fontSize:12, color:C.text, textDecoration:'none' }}>{name} →</a>
                  ))}
                </div>
              </div>
            </Card>
          </>)}
        </div>
      )
    }

    if (tab === 'Rank Tracker') return (
      <div>
        {!gsc && <div style={{ background:'#1a1000', border:'1px solid #3a2a00', borderRadius:12, padding:'12px 16px', marginBottom:16, fontSize:13, color:C.orange }}>⚡ Connect Google Search Console above to import real ranking data.</div>}
        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:14 }}>
          <div style={{ color:C.muted, fontSize:13 }}>Tracking {keywords.length} keywords</div>
          <Btn small onClick={()=>setAddingKw(true)}>+ Add Keyword</Btn>
        </div>
        {addingKw && (
          <Card style={{ marginBottom:14, display:'flex', gap:10 }}>
            <input autoFocus value={newKw} onChange={e=>setNewKw(e.target.value)} onKeyDown={e=>{ if(e.key==='Enter'&&newKw.trim()){ setKeywords(k=>[...k,{id:Date.now(),keyword:newKw,google:Math.floor(Math.random()*20)+5,ai:Math.floor(Math.random()*12)+3,trend:'stable',vol:'–',cpc:'–'}]); setNewKw(''); setAddingKw(false) }}} placeholder="e.g. best coffee near me" style={{ flex:1, background:'#060610', border:`1px solid ${C.border}`, borderRadius:10, padding:'10px 14px', color:C.text, fontSize:13.5, fontFamily:'inherit', outline:'none' }}/>
            <Btn small onClick={()=>{ if(newKw.trim()){ setKeywords(k=>[...k,{id:Date.now(),keyword:newKw,google:Math.floor(Math.random()*20)+5,ai:Math.floor(Math.random()*12)+3,trend:'stable',vol:'–',cpc:'–'}]); setNewKw(''); setAddingKw(false) }}}>Add</Btn>
            <Btn small outline color={C.muted} onClick={()=>setAddingKw(false)}>Cancel</Btn>
          </Card>
        )}
        <Card style={{ padding:0, overflow:'hidden' }}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 90px 90px 70px 70px 70px', padding:'12px 20px', borderBottom:`1px solid ${C.border}`, fontSize:10, color:C.muted, textTransform:'uppercase', letterSpacing:'0.1em', fontWeight:700 }}>
            <div>Keyword</div><div style={{ textAlign:'center' }}>Google</div><div style={{ textAlign:'center' }}>AI Rank</div><div style={{ textAlign:'center' }}>Volume</div><div style={{ textAlign:'center' }}>CPC</div><div style={{ textAlign:'center' }}>Trend</div>
          </div>
          {keywords.map((k,i) => (
            <div key={k.id} style={{ display:'grid', gridTemplateColumns:'1fr 90px 90px 70px 70px 70px', padding:'13px 20px', borderBottom:i<keywords.length-1?`1px solid #0d0d18`:'none', alignItems:'center' }}>
              <div style={{ fontSize:13, color:C.text }}>{k.keyword}</div>
              <div style={{ textAlign:'center' }}><span style={{ background:k.google<=5?'#0a2a1a':'#2a1a0a', color:k.google<=5?C.green:C.red, borderRadius:8, padding:'3px 10px', fontSize:13, fontWeight:700, fontFamily:"'Syne',sans-serif" }}>#{k.google}</span></div>
              <div style={{ textAlign:'center' }}><span style={{ background:k.ai<=5?'#0a1a2a':'#2a0a1a', color:k.ai<=5?C.blue:C.pink, borderRadius:8, padding:'3px 10px', fontSize:13, fontWeight:700, fontFamily:"'Syne',sans-serif" }}>#{k.ai}</span></div>
              <div style={{ textAlign:'center', fontSize:12, color:C.muted }}>{k.vol}</div>
              <div style={{ textAlign:'center', fontSize:12, color:C.muted }}>{k.cpc}</div>
              <div style={{ textAlign:'center', fontSize:16 }}>{k.trend==='up'?'📈':k.trend==='down'?'📉':'➡️'}</div>
            </div>
          ))}
        </Card>
      </div>
    )

    if (tab === 'AI Citations') return (
      <div>
        <div style={{ color:C.muted, fontSize:13, marginBottom:20 }}>GEOrank crawls AI engines every 2–6 hours to detect whether your business is cited for your tracked keywords.</div>
        <Card>
          <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, color:C.text, marginBottom:16, display:'flex', justifyContent:'space-between' }}>
            <span>Engine Citation Status</span>
            <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:12, color:C.muted }}><Pulse color={C.green}/>Live crawl</div>
          </div>
          {[{name:'Perplexity AI',cited:true,icon:'🔮',checked:'2 hrs ago',snippet:'…best artisan coffee in downtown…'},{name:'ChatGPT',cited:true,icon:'🤖',checked:'5 hrs ago',snippet:'…cozy work-friendly space with quality espresso…'},{name:'Google SGE',cited:false,icon:'🔍',checked:'1 hr ago',snippet:null},{name:'Bing Copilot',cited:true,icon:'🪟',checked:'3 hrs ago',snippet:'…highly rated café with vegan options…'},{name:'Meta AI',cited:false,icon:'📘',checked:'6 hrs ago',snippet:null}].map(e => (
            <div key={e.name} style={{ display:'flex', gap:12, padding:'14px 16px', background:'#060610', borderRadius:12, border:`1px solid ${e.cited?C.green+'33':C.border}`, marginBottom:10 }}>
              <span style={{ fontSize:22, flexShrink:0 }}>{e.icon}</span>
              <div style={{ flex:1 }}>
                <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4, flexWrap:'wrap' }}>
                  <span style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:13, color:C.text }}>{e.name}</span>
                  <Pill color={e.cited?C.green:C.red}>{e.cited?'Cited':'Not Cited'}</Pill>
                  <span style={{ fontSize:10, color:C.muted, marginLeft:'auto' }}>{e.checked}</span>
                </div>
                {e.snippet && <div style={{ fontSize:12, color:C.muted }}>"{e.snippet}"</div>}
                {!e.cited && <div style={{ fontSize:12, color:'#f8717180' }}>Not appearing for tracked keywords. Add more snippets & FAQ schema.</div>}
              </div>
            </div>
          ))}
        </Card>
      </div>
    )

    if (tab === 'Reports') return (
      <div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr 1fr', gap:14, marginBottom:20 }}>
          {[{title:'AI Impressions',val:'3,842',delta:'+24%',color:C.blue,data:CHART_DATA.ai},{title:'Google Impressions',val:'43.2K',delta:'+11%',color:C.green,data:CHART_DATA.google},{title:'GBP Views',val:'1,204',delta:'+18%',color:C.yellow,data:CHART_DATA.clicks.map(v=>v*5)},{title:'AI Citations',val:'3 of 5',delta:'+1 engine',color:C.pink,data:[1,1,2,2,2,2,3,3,3,3,3,3]}].map(m => (
            <Card key={m.title} style={{ padding:'16px 18px' }}>
              <div style={{ fontSize:10, color:C.muted, textTransform:'uppercase', letterSpacing:'0.1em', fontWeight:700, marginBottom:8 }}>{m.title}</div>
              <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:22, color:m.color, marginBottom:2 }}>{m.val}</div>
              <div style={{ fontSize:11, color:C.green, marginBottom:10 }}>{m.delta}</div>
              <MiniChart data={m.data} color={m.color}/>
            </Card>
          ))}
        </div>
        <Btn color={C.yellow}>⬇ Download White-Label PDF Report →</Btn>
      </div>
    )

    if (tab === 'Billing') {
      const p = PLANS[user.plan] || PLANS.growth
      return (
        <div>
          <Card style={{ marginBottom:16 }}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:16 }}>
              <div><Label>Current Plan</Label><div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:22, color:p.color }}>{p.name}</div><div style={{ fontSize:13, color:C.muted }}>${p.price}/month</div></div>
              <div style={{ textAlign:'right' }}><div style={{ fontSize:11, color:C.muted, marginBottom:4 }}>PAYMENT</div><div style={{ fontSize:13, color:C.text }}>Visa •••• 4242</div></div>
            </div>
            <div style={{ display:'flex', gap:10 }}><Btn onClick={()=>setUpgrade(true)} color={p.color}>Upgrade Plan →</Btn><Btn outline color={C.muted}>Update Payment</Btn></div>
          </Card>
          <Card>
            <Label>Invoice History</Label>
            {['May 1, 2026','Apr 1, 2026','Mar 1, 2026'].map(date => (
              <div key={date} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 14px', background:'#060610', borderRadius:10, marginTop:8 }}>
                <span style={{ fontSize:13, color:C.text }}>{date}</span>
                <span style={{ fontWeight:700, color:C.text }}>${p.price}.00</span>
                <Pill color={C.green}>Paid</Pill>
                <Btn small outline color={C.muted}>PDF</Btn>
              </div>
            ))}
          </Card>
        </div>
      )
    }


    if (tab === 'Help') {
      const faqs = [
        { q:'What is GEO and why does it matter?', a:'GEO stands for Generative Engine Optimization — optimizing your business to appear in AI-generated search responses from tools like ChatGPT, Perplexity, and Google Gemini. As AI search grows 300% year-over-year, appearing in AI answers is as important as ranking on Google.' },
        { q:'What is a GEO Score?', a:'Your GEO Score (0–100) measures how visible your business is across both Google search and AI engines. It factors in your schema markup, NAP consistency, Google Business Profile completeness, AI citation coverage, and keyword rankings. Higher is better — aim for 80+.' },
        { q:'How do I improve my GEO Score quickly?', a:'The fastest wins are: (1) Add FAQ schema from the Schema Builder, (2) Fill out your Business Profile completely, (3) Generate AI answer snippets for your most common customer questions, (4) Fix any NAP inconsistencies across directories.' },
        { q:'What is schema markup and where do I put it?', a:'Schema markup is structured code that tells AI engines exactly what your business is. Go to Schema Builder, pick a type, copy the generated code, and paste it before the </head> tag on your website. See the step-by-step guide inside each schema type for platform-specific instructions.' },
        { q:'How does the AI Citation Monitor work?', a:'We send automated queries to ChatGPT, Perplexity, Gemini, Bing Copilot, and Meta AI based on your tracked keywords, then check if your business appears in the responses. We check every 2–6 hours and show you exactly what each engine says about you.' },
        { q:'How do AI Snippets help me get cited?', a:'AI engines cite businesses whose websites contain clear, authoritative answers to common questions. Our AI Snippet Generator creates perfectly formatted Q&A content optimized for citation. Publish these on your website as a FAQ page and AI engines will start pulling from them.' },
        { q:'What is NAP consistency and why does it matter?', a:'NAP stands for Name, Address, Phone. AI engines cross-reference your business info across Google, Bing, Apple Maps, Yelp and other directories. If they differ (e.g. "St." vs "Street"), AI engines lose confidence in your listing and cite you less. Keep them identical everywhere.' },
        { q:'How do I connect Google Search Console?', a:'Click the "Connect GSC" button on your Dashboard. You will be redirected to Google to authorize access. Once connected, your real keyword rankings, impressions, and click data will automatically import into your Rank Tracker.' },
        { q:'How many locations can I manage?', a:'Starter: 1 location. Growth: 5 locations. Agency: unlimited. Each location has its own GEO Score, keyword tracker, snippet library, and reports. Upgrade from the Billing tab or the sidebar.' },
        { q:'How long before I see results?', a:'AI citations can appear within days of publishing optimized content — AI engines crawl frequently. Google rank improvements typically take 2–6 weeks, which is normal for any SEO work. Most merchants see measurable AI citation improvement within 2 weeks.' },
        { q:'How do I upgrade or change my plan?', a:'Go to the Billing tab in the sidebar, or click "Upgrade Plan" at the bottom of the sidebar. You can upgrade, downgrade, or cancel anytime. Changes take effect immediately.' },
        { q:'I need help with something not listed here.', a:'Email us at hello@georankhq.co and we will get back to you within 24 hours. For urgent issues, book a 20-minute support call from the main landing page.' },
      ]

      const guides = [
        { icon:'🚀', title:'Getting Started in 10 Minutes', steps:['Fill out your Business Profile completely','Add your first merchant location','Generate 3 AI snippets for common customer questions','Add Local Business schema to your website','Track your first 5 keywords'] },
        { icon:'📈', title:'Improve Your GEO Score', steps:['Fix missing FAQ Schema (biggest impact)','Sync NAP data across all directories','Connect Google Search Console','Generate AI snippets for top 10 customer questions','Verify your Google Business Profile is active'] },
        { icon:'🤖', title:'Get Cited by AI Engines', steps:['Create a FAQ page on your website','Add FAQ schema markup to that page','Generate AI snippets and publish them','Ensure your GBP has recent posts','Check citations weekly in AI Citations tab'] },
      ]

      return (
        <div>
          {/* Quick start guides */}
          <div style={{ marginBottom:28 }}>
            <Label>Quick Start Guides</Label>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:14 }}>
              {guides.map((g,i) => (
                <Card key={i}>
                  <div style={{ fontSize:24, marginBottom:10 }}>{g.icon}</div>
                  <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, color:C.text, fontSize:14, marginBottom:12 }}>{g.title}</div>
                  {g.steps.map((s,j) => (
                    <div key={j} style={{ display:'flex', gap:10, marginBottom:8 }}>
                      <div style={{ width:18, height:18, borderRadius:'50%', background:`${C.blue}22`, border:`1px solid ${C.blue}44`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, fontWeight:800, color:C.blue, flexShrink:0 }}>{j+1}</div>
                      <div style={{ fontSize:12, color:C.muted, lineHeight:1.5 }}>{s}</div>
                    </div>
                  ))}
                </Card>
              ))}
            </div>
          </div>

          {/* FAQ */}
          <Label>Frequently Asked Questions</Label>
          <Card style={{ padding:0, overflow:'hidden' }}>
            {faqs.map((f,i) => (
              <div key={i} style={{ borderBottom:i<faqs.length-1?`1px solid ${C.border}`:'none' }}>
                <div onClick={()=>setOpenFaq(openFaq===i?null:i)} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'16px 20px', cursor:'pointer', gap:16 }}>
                  <span style={{ fontSize:13.5, fontWeight:600, color:C.text }}>{f.q}</span>
                  <span style={{ color:openFaq===i?C.yellow:C.muted, fontSize:18, flexShrink:0, transition:'transform .2s', transform:openFaq===i?'rotate(45deg)':'none' }}>+</span>
                </div>
                {openFaq===i && (
                  <div style={{ padding:'0 20px 16px', fontSize:13, color:C.muted, lineHeight:1.7 }}>{f.a}</div>
                )}
              </div>
            ))}
          </Card>

          {/* Contact */}
          <div style={{ marginTop:20, background:'linear-gradient(135deg,#0d1a0d,#1a2a0d)', border:'1px solid #1a3a0d', borderRadius:14, padding:'20px 24px', display:'flex', alignItems:'center', gap:20 }}>
            <div style={{ fontSize:32 }}>💬</div>
            <div style={{ flex:1 }}>
              <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, color:C.text, marginBottom:4 }}>Still need help?</div>
              <div style={{ fontSize:13, color:C.muted }}>Our team replies within 24 hours. For urgent issues, book a support call.</div>
            </div>
            <div style={{ display:'flex', gap:10 }}>
              <Btn small outline color={C.green} onClick={()=>window.open('mailto:hello@georankhq.co')}>Email Us</Btn>
              <Btn small color={C.green} onClick={()=>window.open('https://georankhq.co/landing.html#contact')}>Book a Call</Btn>
            </div>
          </div>
        </div>
      )
    }
    return null
  }

  return (
    <div style={{ minHeight:'100vh', background:C.bg }}>
      {showUpgrade && <Modal title="Upgrade GEOrank" onClose={()=>setUpgrade(false)} width={700}><div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:14 }}>{Object.entries(PLANS).map(([id,p])=>(<div key={id} style={{ background:'#060610', border:`1px solid ${id===user.plan?p.color:C.border}`, borderRadius:14, padding:18, display:'flex', flexDirection:'column', gap:10 }}><div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, color:p.color, fontSize:16 }}>{p.name}</div><div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, color:C.text, fontSize:24 }}>${p.price}<span style={{ fontSize:12, color:C.muted, fontWeight:400 }}>/mo</span></div><div style={{ flex:1 }}>{p.features.map(f=><div key={f} style={{ fontSize:12, color:C.muted, marginBottom:5 }}>✓ {f}</div>)}</div><Btn onClick={()=>handlePlanSelect(id)} color={p.color} disabled={id===user.plan}>{id===user.plan?'Current Plan':'Select →'}</Btn></div>))}</div></Modal>}

      <div style={{ height:54, borderBottom:`1px solid ${C.border}`, padding:'0 24px', display:'flex', alignItems:'center', justifyContent:'space-between', position:'sticky', top:0, background:C.bg, zIndex:100 }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ width:30, height:30, background:'linear-gradient(135deg,#f0c040,#f472b6)', borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center', fontSize:15 }}>✦</div>
          <span style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:18, color:'#e8e8f0' }}>GEOrank</span>
          <Pill color={plan.color}>{plan.name.toUpperCase()}</Pill>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:14 }}>
          <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:12, color:C.muted }}><Pulse color={C.green}/>Live</div>
          <div style={{ width:1, height:18, background:C.border }}/>
          <span style={{ fontSize:12, color:C.muted }}>{user.email}</span>
          <Btn small outline color={C.muted} onClick={logout}>Logout</Btn>
        </div>
      </div>

      <div style={{ display:'flex', height:'calc(100vh - 54px)' }}>
        <div style={{ width:216, borderRight:`1px solid ${C.border}`, display:'flex', flexDirection:'column', overflow:'auto', flexShrink:0 }}>
          <div style={{ padding:'16px 12px', borderBottom:`1px solid ${C.border}` }}>
            <Label>Your Locations</Label>
            {merchants.map(m => (
              <div key={m.id} onClick={()=>{setMerchant(m);setTab('Dashboard')}} style={{ display:'flex', alignItems:'center', gap:8, padding:'8px 10px', borderRadius:10, cursor:'pointer', background:merchant.id===m.id?'#0d0d20':'transparent', border:`1px solid ${merchant.id===m.id?C.border:'transparent'}`, marginBottom:3 }}>
                <span style={{ fontSize:16 }}>{m.avatar}</span>
                <div style={{ flex:1, minWidth:0 }}><div style={{ fontSize:12, fontFamily:"'Syne',sans-serif", fontWeight:700, color:C.text, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{m.name}</div><div style={{ fontSize:10, color:C.muted }}>{m.category}</div></div>
                <span style={{ fontSize:12, fontWeight:800, color:m.score>=80?C.green:m.score>=60?C.yellow:C.red, fontFamily:"'Syne',sans-serif" }}>{m.score}</span>
              </div>
            ))}
            <div onClick={()=>{ const n={id:`m${Date.now()}`,name:'New Location',category:'Business',city:'City, ST',avatar:'🏢',score:0,googleScore:0,aiScore:0,localScore:0}; setMerchants(ms=>[...ms,n]); setMerchant(n); setTab('Business Profile') }} style={{ display:'flex', alignItems:'center', gap:8, padding:'8px 10px', borderRadius:10, cursor:'pointer', border:`1px dashed ${C.border}`, color:C.muted, fontSize:12, marginTop:4 }}>
              <span>＋</span> Add Location
            </div>
          </div>
          <div style={{ padding:'12px 12px', flex:1 }}>
            <Label>Navigation</Label>
            {TABS.map((t,i) => (
              <button key={t} onClick={()=>setTab(t)} style={{ display:'flex', alignItems:'center', gap:9, width:'100%', padding:'9px 10px', borderRadius:10, border:`1px solid ${tab===t?C.border:'transparent'}`, background:tab===t?'#0d0d20':'transparent', color:tab===t?C.text:C.muted, fontSize:12.5, fontFamily:"'Syne',sans-serif", fontWeight:tab===t?700:500, cursor:'pointer', marginBottom:2, textAlign:'left' }}>
                <span>{ICONS[i]}</span>{t}
              </button>
            ))}
          </div>
          <div style={{ padding:'0 12px 16px' }}>
            <div style={{ background:'linear-gradient(135deg,#0d1a0d,#1a2a0d)', border:'1px solid #1a3a0d', borderRadius:12, padding:14 }}>
              <div style={{ fontSize:10, color:C.green, fontWeight:700, marginBottom:3 }}>GEO SCORE</div>
              <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:26, color:C.yellow }}>{merchant.score}</div>
              <div style={{ fontSize:10, color:C.muted, marginTop:2, marginBottom:10 }}>↑ 6pts this month</div>
              <Btn small onClick={()=>setUpgrade(true)} color={plan.color} style={{ width:'100%' }}>Upgrade Plan</Btn>
            </div>
          </div>
        </div>

        <div style={{ flex:1, overflow:'auto', padding:'26px 28px' }}>
          <div style={{ maxWidth:960 }}>
            <div style={{ marginBottom:20 }}>
              <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:4 }}>
                <h1 style={{ fontFamily:"'Syne',sans-serif", fontSize:20, fontWeight:800, color:C.text }}>{tab}</h1>
                <span style={{ fontSize:13, color:C.muted }}>· {merchant.name}</span>
              </div>
              <div style={{ height:2, width:24, background:'linear-gradient(90deg,#f0c040,#f472b6)', borderRadius:2 }}/>
            </div>
            <div key={tab+merchant.id} style={{ animation:'fadeIn 0.25s ease' }}>{renderContent()}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
