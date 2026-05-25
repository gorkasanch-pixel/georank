import { useState, useEffect } from 'react'
import { C, PLANS, SEED_ACCOUNTS, SEED_TICKETS, MRR_HISTORY, CHURN_HISTORY, SIGNUP_HISTORY, MONTHS } from '../constants'
import { db } from '../storage'
import { Pill, Btn, Card, Label, Pulse, Divider, Avatar, Modal, SparkLine, StatusPill, Spinner } from '../components/ui'

// ─── ADMIN LOGIN ──────────────────────────────────────────────────────────────
function AdminLogin({ onAuth }) {
  const [email, setEmail]   = useState('admin@georank.io')
  const [pass, setPass]     = useState('')
  const [mfa, setMfa]       = useState(false)
  const [forgot, setForgot] = useState(false)
  const [resetSent, setResetSent] = useState(false)
  const [code, setCode]     = useState('')
  const [loading, setLoading] = useState(false)
  const [err, setErr]       = useState('')

  const attempt = async () => {
    if (!email || !pass) { setErr('Credentials required.'); return }
    setLoading(true); setErr('')
    await new Promise(r => setTimeout(r, 700))
    setLoading(false); setMfa(true)
  }

  const verifyMfa = async () => {
    setLoading(true)
    await new Promise(r => setTimeout(r, 500))
    const u = { id:'admin', email, name:'Admin', role:'admin', plan:'agency', createdAt:new Date().toISOString() }
    db.set('adminUser', u)
    onAuth(u)
  }

  return (
    <div style={{ minHeight:'100vh', background:C.bg, display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
      <div style={{ width:'100%', maxWidth:400, animation:'fadeIn .35s ease' }}>
        <div style={{ textAlign:'center', marginBottom:32 }}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:10, marginBottom:6 }}>
            <div style={{ width:36, height:36, background:'linear-gradient(135deg,#f0c040,#a78bfa)', borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18 }}>⚙️</div>
            <span style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:20, color:'#e8e8f0' }}>GEOrank</span>
            <Pill color={C.purple}>ADMIN</Pill>
          </div>
          <div style={{ fontSize:12, color:C.muted }}>Internal operations portal</div>
        </div>

        <Card>
          {!mfa ? (
            <>
              <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:17, color:C.text, marginBottom:4 }}>Admin Sign In</div>
              <div style={{ fontSize:12, color:C.muted, marginBottom:20 }}>Restricted — authorized personnel only</div>
              {[['Email','email',email,setEmail,'admin@georank.io'],['Password','password',pass,setPass,'••••••••']].map(([lbl,type,val,set,ph]) => (
                <div key={lbl} style={{ marginBottom:14 }}>
                  <Label>{lbl}</Label>
                  <input type={type} value={val} onChange={e=>set(e.target.value)} onKeyDown={e=>e.key==='Enter'&&attempt()} placeholder={ph} style={{ width:'100%', background:'#060610', border:`1px solid ${C.border}`, borderRadius:10, padding:'10px 14px', color:C.text, fontSize:13.5, fontFamily:'inherit', outline:'none' }}/>
                </div>
              ))}
              {err && <div style={{ color:C.red, fontSize:12, marginBottom:12 }}>{err}</div>}
              <Btn onClick={attempt} disabled={loading} color={C.purple} style={{ width:'100%' }}>{loading?'Verifying…':'Continue →'}</Btn>
              <div style={{ textAlign:'center', marginTop:12, fontSize:12 }}>
                <span style={{ cursor:'pointer', color:C.muted }} onClick={()=>{ setForgot(true); setErr(''); setLoading(false); setResetSent(false); }}>Forgot password?</span>
              </div>
            </>
          ) : forgot ? (
            <>
              <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:17, color:C.text, marginBottom:4 }}>Reset admin password</div>
              <div style={{ fontSize:12, color:C.muted, marginBottom:20 }}>Enter your admin email and we'll send a reset link.</div>
              <div style={{ marginBottom:14 }}>
                <Label>Email</Label>
                <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="admin@georankhq.co" style={{ width:'100%', background:'#060610', border:`1px solid ${C.border}`, borderRadius:10, padding:'10px 14px', color:C.text, fontSize:13.5, fontFamily:'inherit', outline:'none' }}/>
              </div>
              {resetSent && <div style={{ background:`${C.green}11`, border:`1px solid ${C.green}33`, borderRadius:10, padding:'10px 14px', marginBottom:14, fontSize:13, color:C.green }}>✓ Reset link sent to {email}</div>}
              <Btn onClick={async()=>{ setLoading(true); await new Promise(r=>setTimeout(r,800)); setLoading(false); setResetSent(true); }} disabled={loading} color={C.purple} style={{ width:'100%', marginBottom:12 }}>{loading?'Sending…':'Send Reset Link →'}</Btn>
              <div style={{ textAlign:'center', fontSize:12 }}><span style={{ cursor:'pointer', color:C.blue }} onClick={()=>{ setForgot(false); setResetSent(false); setErr('') }}>← Back to login</span></div>
            </>
          ) : (
            <>
              <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:17, color:C.text, marginBottom:4 }}>Two-Factor Auth</div>
              <div style={{ fontSize:12, color:C.muted, marginBottom:20 }}>Enter the 6-digit code from your authenticator app.</div>
              <input value={code} onChange={e=>setCode(e.target.value)} onKeyDown={e=>e.key==='Enter'&&verifyMfa()} placeholder="000 000" maxLength={7} style={{ width:'100%', background:'#060610', border:`1px solid ${C.purple}`, borderRadius:10, padding:'14px', color:C.text, fontSize:22, fontFamily:"'Syne',sans-serif", outline:'none', textAlign:'center', letterSpacing:'0.3em', marginBottom:16 }}/>
              <Btn onClick={verifyMfa} disabled={loading} color={C.purple} style={{ width:'100%' }}>{loading?'Verifying…':'Access Dashboard →'}</Btn>
              <div style={{ textAlign:'center', marginTop:12, fontSize:11, color:C.muted }}>Demo: any code works · <span style={{ color:C.blue, cursor:'pointer' }} onClick={()=>setMfa(false)}>← Back</span></div>
            </>
          )}
        </Card>
        <div style={{ textAlign:'center', marginTop:18, fontSize:11, color:'#1e1e30' }}>All access is logged and audited</div>
      </div>
    </div>
  )
}

// ─── REVENUE ─────────────────────────────────────────────────────────────────
function RevenueOverview() {
  const totalMrr = SEED_ACCOUNTS.reduce((s,a)=>s+a.mrr, 0)
  const active   = SEED_ACCOUNTS.filter(a=>a.status==='active').length
  const trialing = SEED_ACCOUNTS.filter(a=>a.status==='trialing').length

  return (
    <div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14, marginBottom:20 }}>
        {[
          { label:'Monthly Recurring Revenue', val:`$${totalMrr.toLocaleString()}`, delta:'+12%', color:C.yellow, spark:MRR_HISTORY },
          { label:'Active Accounts',           val:active,   delta:'+3',    color:C.green,  spark:SIGNUP_HISTORY },
          { label:'Trials Active',             val:trialing, delta:'+2',    color:C.blue,   spark:[2,3,2,4,3,5,4,6,5,7,6,8] },
          { label:'Churn Rate',                val:'2.1%',   delta:'−0.3%', color:C.pink,   spark:CHURN_HISTORY },
        ].map(m => (
          <Card key={m.label}>
            <Label>{m.label}</Label>
            <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:24, color:m.color, marginBottom:2 }}>{m.val}</div>
            <div style={{ fontSize:11, color:C.green, marginBottom:10 }}>{m.delta} vs last mo</div>
            <SparkLine data={m.spark} color={m.color}/>
          </Card>
        ))}
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr', gap:14, marginBottom:14 }}>
        <Card>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
            <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, color:C.text }}>MRR Growth</div>
            <Pill color={C.green}>+12% MoM</Pill>
          </div>
          <div style={{ display:'flex', alignItems:'flex-end', gap:5, height:100 }}>
            {MRR_HISTORY.map((v,i) => (
              <div key={i} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:4 }}>
                <div style={{ width:'100%', background:i===MRR_HISTORY.length-1?C.yellow:`${C.yellow}44`, borderRadius:'3px 3px 0 0', height:`${(v/Math.max(...MRR_HISTORY))*96}px` }}/>
                <div style={{ fontSize:9, color:C.muted }}>{MONTHS[i]}</div>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, color:C.text, marginBottom:14 }}>Revenue by Plan</div>
          {[{plan:'Agency',count:3,rev:1197,color:C.yellow},{plan:'Growth',count:2,rev:298,color:C.blue},{plan:'Starter',count:2,rev:98,color:C.green}].map(p => (
            <div key={p.plan} style={{ marginBottom:12 }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                <span style={{ fontSize:12, color:C.text }}>{p.plan} ({p.count})</span>
                <span style={{ fontSize:12, fontWeight:700, color:p.color, fontFamily:"'Syne',sans-serif" }}>${p.rev}/mo</span>
              </div>
              <div style={{ height:4, background:'#111128', borderRadius:2 }}><div style={{ height:4, width:`${(p.rev/1593)*100}%`, background:p.color, borderRadius:2 }}/></div>
            </div>
          ))}
          <Divider/>
          <div style={{ display:'flex', justifyContent:'space-between' }}>
            <span style={{ fontSize:12, color:C.muted }}>Total MRR</span>
            <span style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, color:C.yellow }}>$1,593/mo</span>
          </div>
        </Card>
      </div>

      <Card>
        <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, color:C.text, marginBottom:14 }}>Upcoming Renewals</div>
        {[{name:'Chloe Beaumont',plan:'Agency',date:'Jun 1',amount:'$399',risk:'low'},{name:'Sarah Kim',plan:'Agency',date:'Jun 3',amount:'$399',risk:'low'},{name:'Marcus Webb',plan:'Growth',date:'Jun 7',amount:'$149',risk:'medium'},{name:'Raj Patel',plan:'Starter',date:'Jun 1',amount:'$49',risk:'high'}].map(r => (
          <div key={r.name} style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 14px', background:'#060610', borderRadius:10, marginBottom:8 }}>
            <div style={{ flex:1 }}><div style={{ fontSize:13, color:C.text, fontWeight:600 }}>{r.name}</div><div style={{ fontSize:11, color:C.muted }}>{r.plan} · Renews {r.date}</div></div>
            <span style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, color:C.text }}>{r.amount}</span>
            <Pill color={r.risk==='low'?C.green:r.risk==='medium'?C.orange:C.red}>{r.risk} risk</Pill>
          </div>
        ))}
      </Card>
    </div>
  )
}

// ─── ACCOUNTS TABLE ───────────────────────────────────────────────────────────
function AccountDetailModal({ account, onClose, onImpersonate }) {
  const [tab, setTab] = useState('overview')
  const plan = PLANS[account.plan] || PLANS.starter

  return (
    <Modal title={account.name} onClose={onClose} width={620}>
      <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:20, padding:'14px 16px', background:'#060610', borderRadius:12 }}>
        <Avatar initials={account.avatar} color={plan.color} size={48}/>
        <div style={{ flex:1 }}>
          <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:16, color:C.text }}>{account.name}</div>
          <div style={{ fontSize:12, color:C.muted }}>{account.email}</div>
          <div style={{ display:'flex', gap:8, marginTop:6 }}><Pill color={plan.color}>{plan.name}</Pill><StatusPill status={account.status}/></div>
        </div>
        <div style={{ textAlign:'right' }}>
          <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:22, color:C.yellow }}>${account.mrr}<span style={{ fontSize:11, color:C.muted, fontWeight:400 }}>/mo</span></div>
          <div style={{ fontSize:11, color:C.muted }}>Since {account.joined}</div>
        </div>
      </div>

      <div style={{ display:'flex', gap:4, marginBottom:16, borderBottom:`1px solid ${C.border}` }}>
        {['overview','billing','activity','notes'].map(t => (
          <button key={t} onClick={()=>setTab(t)} style={{ background:'transparent', border:'none', borderBottom:`2px solid ${tab===t?C.purple:'transparent'}`, color:tab===t?C.text:C.muted, padding:'6px 14px', fontSize:12, fontFamily:"'Syne',sans-serif", fontWeight:tab===t?700:500, cursor:'pointer', textTransform:'capitalize', marginBottom:-1 }}>{t}</button>
        ))}
      </div>

      {tab === 'overview' && (
        <div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:10, marginBottom:14 }}>
            {[['GEO Score',account.geoScore,C.yellow],['Locations',account.locations,C.blue],['Last Seen',account.lastSeen,C.green]].map(([lbl,val,color]) => (
              <div key={lbl} style={{ background:'#060610', borderRadius:10, padding:'12px 14px' }}><Label>{lbl}</Label><div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:16, color }}>{val}</div></div>
            ))}
          </div>
          <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
            <Btn small color={C.purple} onClick={()=>onImpersonate(account)}>⇄ Impersonate Account</Btn>
            <Btn small outline color={C.blue}>Send Email</Btn>
            <Btn small outline color={C.yellow}>Change Plan</Btn>
            <Btn small outline color={C.orange}>Extend Trial</Btn>
            <Btn small outline color={C.red} danger>Suspend</Btn>
          </div>
        </div>
      )}
      {tab === 'billing' && (
        <div>
          {[['Plan',`${plan.name} ($${plan.price}/mo)`],['Status',account.status],['MRR',`$${account.mrr}`],['Member Since',account.joined],['Next Renewal','Jun 1, 2026'],['Payment','Visa •••• 4242']].map(([k,v]) => (
            <div key={k} style={{ display:'flex', justifyContent:'space-between', padding:'10px 0', borderBottom:`1px solid ${C.border}` }}>
              <span style={{ fontSize:12, color:C.muted }}>{k}</span>
              <span style={{ fontSize:13, color:C.text, fontWeight:600 }}>{v}</span>
            </div>
          ))}
          <div style={{ display:'flex', gap:8, marginTop:16 }}><Btn small outline color={C.green}>Issue Refund</Btn><Btn small outline color={C.orange}>Apply Credit</Btn><Btn small outline color={C.blue}>View Stripe →</Btn></div>
        </div>
      )}
      {tab === 'activity' && (
        <div>
          {[['May 22','Logged in from Chrome / macOS'],['May 21','Generated 4 AI snippets'],['May 20',"Added keyword: 'best coffee sf'"],['May 18','Connected Google Search Console'],['May 15','Upgraded from Starter to Agency'],['May 1','Billing renewed $399']].map(([date,event]) => (
            <div key={event} style={{ display:'flex', gap:14, padding:'10px 0', borderBottom:`1px solid ${C.border}` }}>
              <span style={{ fontSize:11, color:C.muted, whiteSpace:'nowrap', minWidth:50 }}>{date}</span>
              <span style={{ fontSize:12, color:C.text }}>{event}</span>
            </div>
          ))}
        </div>
      )}
      {tab === 'notes' && (
        <div>
          <textarea placeholder="Add internal notes about this account…" rows={5} style={{ width:'100%', background:'#060610', border:`1px solid ${C.border}`, borderRadius:10, padding:'12px 14px', color:C.text, fontSize:13, fontFamily:'inherit', outline:'none', resize:'none', marginBottom:10 }}/>
          <Btn small color={C.purple}>Save Note</Btn>
        </div>
      )}
    </Modal>
  )
}

function AccountsTable({ onImpersonate }) {
  const [search, setSearch]       = useState('')
  const [filter, setFilter]       = useState('all')
  const [viewing, setViewing]     = useState(null)

  const filtered = SEED_ACCOUNTS.filter(a => {
    if (a.role === 'admin') return false
    if (filter !== 'all' && a.status !== filter) return false
    if (search && !a.name.toLowerCase().includes(search.toLowerCase()) && !a.email.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  return (
    <div>
      {viewing && <AccountDetailModal account={viewing} onClose={()=>setViewing(null)} onImpersonate={a=>{setViewing(null);onImpersonate(a)}}/>}
      <div style={{ display:'flex', gap:10, marginBottom:16, alignItems:'center' }}>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search accounts…" style={{ flex:1, background:'#060610', border:`1px solid ${C.border}`, borderRadius:10, padding:'9px 14px', color:C.text, fontSize:13, fontFamily:'inherit', outline:'none' }}/>
        {['all','active','trialing','paused'].map(f => (
          <button key={f} onClick={()=>setFilter(f)} style={{ background:filter===f?'#0d0d20':'transparent', border:`1px solid ${filter===f?C.border:'transparent'}`, borderRadius:8, padding:'7px 14px', fontSize:12, color:filter===f?C.text:C.muted, cursor:'pointer', fontFamily:"'Syne',sans-serif", fontWeight:700, textTransform:'capitalize' }}>{f}</button>
        ))}
        <Btn small color={C.green}>+ New Account</Btn>
      </div>
      <Card style={{ padding:0, overflow:'hidden' }}>
        <div style={{ display:'grid', gridTemplateColumns:'2fr 1.2fr 90px 80px 70px 80px 100px', padding:'11px 18px', borderBottom:`1px solid ${C.border}`, fontSize:10, color:C.muted, textTransform:'uppercase', letterSpacing:'0.1em', fontWeight:700 }}>
          <div>Account</div><div>Email</div><div>Plan</div><div>MRR</div><div>Score</div><div>Status</div><div>Actions</div>
        </div>
        {filtered.map((a,i) => (
          <div key={a.id} style={{ display:'grid', gridTemplateColumns:'2fr 1.2fr 90px 80px 70px 80px 100px', padding:'13px 18px', borderBottom:i<filtered.length-1?`1px solid #0d0d18`:'none', alignItems:'center' }}>
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              <Avatar initials={a.avatar} color={PLANS[a.plan]?.color||C.muted} size={30}/>
              <div><div style={{ fontSize:13, color:C.text, fontWeight:600 }}>{a.name}</div><div style={{ fontSize:10.5, color:C.muted }}>{a.lastSeen}</div></div>
            </div>
            <div style={{ fontSize:12, color:C.muted, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{a.email}</div>
            <div><Pill color={PLANS[a.plan]?.color||C.muted}>{PLANS[a.plan]?.name||a.plan}</Pill></div>
            <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:13, color:a.mrr>0?C.yellow:C.muted }}>{a.mrr>0?`$${a.mrr}`:'Trial'}</div>
            <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:13, color:a.geoScore>=80?C.green:a.geoScore>=60?C.yellow:C.red }}>{a.geoScore}</div>
            <div><StatusPill status={a.status}/></div>
            <div style={{ display:'flex', gap:5 }}>
              <Btn small outline color={C.blue} onClick={()=>setViewing(a)}>View</Btn>
              <Btn small color={C.purple} onClick={()=>onImpersonate(a)}>⇄</Btn>
            </div>
          </div>
        ))}
      </Card>
    </div>
  )
}

// ─── SUPPORT ─────────────────────────────────────────────────────────────────
function SupportTickets() {
  const [tickets, setTickets] = useState(SEED_TICKETS)
  const [selected, setSelected] = useState(null)

  return (
    <div style={{ display:'grid', gridTemplateColumns:'1fr 1.4fr', gap:14 }}>
      <div>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
          <Label style={{ marginBottom:0 }}>Open ({tickets.filter(t=>t.status==='open').length})</Label>
          <Btn small color={C.green}>+ New Ticket</Btn>
        </div>
        {tickets.map(t => (
          <div key={t.id} onClick={()=>setSelected(t)} style={{ background:selected?.id===t.id?'#0d0d22':C.card, border:`1px solid ${selected?.id===t.id?C.purple:C.border}`, borderLeft:`3px solid ${t.priority==='high'?C.red:t.priority==='medium'?C.orange:C.green}`, borderRadius:12, padding:'12px 14px', marginBottom:8, cursor:'pointer' }}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
              <span style={{ fontSize:12.5, color:C.text, fontWeight:600 }}>{t.subject}</span>
              <Pill color={t.status==='resolved'?C.green:C.orange}>{t.status}</Pill>
            </div>
            <div style={{ display:'flex', gap:8, alignItems:'center' }}>
              <span style={{ fontSize:11, color:C.muted }}>{t.account}</span>
              <span style={{ fontSize:11, color:C.muted }}>· {t.created}</span>
              <Pill color={t.priority==='high'?C.red:t.priority==='medium'?C.orange:C.green}>{t.priority}</Pill>
            </div>
          </div>
        ))}
      </div>
      <div>
        {!selected ? (
          <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:14, padding:40, textAlign:'center', color:C.muted, fontSize:13 }}>Select a ticket to view details</div>
        ) : (
          <Card>
            <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, color:C.text, fontSize:15, marginBottom:4 }}>{selected.subject}</div>
            <div style={{ display:'flex', gap:8, marginBottom:16 }}>
              <Pill color={C.blue}>{selected.account}</Pill>
              <Pill color={selected.priority==='high'?C.red:C.orange}>{selected.priority} priority</Pill>
              <Pill color={selected.status==='resolved'?C.green:C.orange}>{selected.status}</Pill>
            </div>
            <Divider/>
            {[{from:selected.account,time:'May 21, 9:14am',msg:"Hi, I connected my Google Search Console but the data isn't syncing. I've tried disconnecting and reconnecting but it still shows as disconnected."},{from:'Dev R. (Admin)',time:'May 21, 11:32am',msg:"Thanks for reaching out! This is usually a cache issue. Try clearing your browser cache and re-authenticating. If that doesn't work I'll escalate to engineering.",admin:true}].map((m,i) => (
              <div key={i} style={{ marginBottom:12 }}>
                <div style={{ display:'flex', gap:8, marginBottom:4 }}><span style={{ fontSize:12, fontWeight:700, color:m.admin?C.purple:C.text }}>{m.from}</span><span style={{ fontSize:10, color:C.muted }}>{m.time}</span></div>
                <div style={{ fontSize:12.5, color:C.muted, lineHeight:1.7, padding:'10px 12px', background:'#060610', borderRadius:8 }}>{m.msg}</div>
              </div>
            ))}
            <textarea placeholder="Type your reply…" rows={3} style={{ width:'100%', background:'#060610', border:`1px solid ${C.border}`, borderRadius:10, padding:'10px 12px', color:C.text, fontSize:13, fontFamily:'inherit', outline:'none', resize:'none', marginBottom:10 }}/>
            <div style={{ display:'flex', gap:8 }}>
              <Btn small color={C.purple}>Send Reply</Btn>
              {selected.status!=='resolved'&&<Btn small color={C.green} onClick={()=>setTickets(ts=>ts.map(t=>t.id===selected.id?{...t,status:'resolved'}:t))}>✓ Mark Resolved</Btn>}
              <Btn small outline color={C.muted}>Assign</Btn>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}

// ─── SYSTEM HEALTH ────────────────────────────────────────────────────────────
function SystemHealth() {
  const services = [
    {name:'API Gateway',         status:'operational',latency:'42ms', uptime:'99.98%'},
    {name:'AI Snippet Engine',   status:'operational',latency:'1.2s', uptime:'99.91%'},
    {name:'GSC Sync Worker',     status:'degraded',   latency:'8.4s', uptime:'97.3%'},
    {name:'Citation Crawler',    status:'operational',latency:'3.1s', uptime:'99.87%'},
    {name:'Stripe Webhook',      status:'operational',latency:'120ms',uptime:'100%'},
    {name:'Email Delivery',      status:'operational',latency:'300ms',uptime:'99.95%'},
    {name:'Schema Validator',    status:'incident',   latency:'—',    uptime:'94.2%'},
    {name:'PDF Report Generator',status:'operational',latency:'2.1s', uptime:'99.76%'},
  ]
  const sc = {operational:C.green,degraded:C.orange,incident:C.red}

  return (
    <div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr 1fr', gap:14, marginBottom:20 }}>
        {[{label:'Overall Uptime',val:'99.7%',color:C.green},{label:'Avg Latency',val:'188ms',color:C.blue},{label:'Active Incidents',val:'1',color:C.red},{label:'API Calls Today',val:'84.2K',color:C.yellow}].map(m=>(
          <Card key={m.label}><Label>{m.label}</Label><div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:24, color:m.color }}>{m.val}</div></Card>
        ))}
      </div>
      <Card style={{ marginBottom:14 }}>
        <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, color:C.text, marginBottom:14, display:'flex', justifyContent:'space-between' }}>
          <span>Service Status</span>
          <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:12 }}><Pulse color={C.green}/>Auto-refreshing</div>
        </div>
        {services.map(s=>(
          <div key={s.name} style={{ display:'flex', alignItems:'center', gap:14, padding:'11px 14px', background:'#060610', borderRadius:10, marginBottom:6, border:`1px solid ${s.status!=='operational'?sc[s.status]+'44':C.border}` }}>
            <div style={{ width:8, height:8, borderRadius:'50%', background:sc[s.status], flexShrink:0 }}/>
            <div style={{ flex:1, fontWeight:600, fontSize:13, color:C.text }}>{s.name}</div>
            <div style={{ fontSize:11, color:C.muted }}>Latency: {s.latency}</div>
            <div style={{ fontSize:11, color:C.muted }}>Uptime: {s.uptime}</div>
            <Pill color={sc[s.status]}>{s.status}</Pill>
          </div>
        ))}
      </Card>
    </div>
  )
}

// ─── AUDIT LOG ────────────────────────────────────────────────────────────────
function AuditLog() {
  const logs = [
    {time:'May 22 10:41',actor:'Admin',      action:'Impersonated',     target:'Sarah Kim',         ip:'10.0.1.1'},
    {time:'May 22 10:38',actor:'Admin',      action:'Plan changed',     target:'Tom Okafor → Growth',ip:'10.0.1.1'},
    {time:'May 22 09:15',actor:'Chloe B.',   action:'Login',            target:'Chrome / FR',       ip:'91.2.3.4'},
    {time:'May 21 18:02',actor:'Admin',      action:'Ticket resolved',  target:'T-003',             ip:'10.0.1.1'},
    {time:'May 21 14:30',actor:'Sarah K.',   action:'API key rotated',  target:'—',                 ip:'76.33.2.1'},
    {time:'May 20 09:00',actor:'Marcus W.',  action:'GSC connected',    target:'verdantco.com',     ip:'52.1.44.3'},
    {time:'May 19 17:22',actor:'Admin',      action:'Refund issued',    target:'$149 to Marcus W.', ip:'10.0.1.1'},
  ]
  return (
    <Card style={{ padding:0, overflow:'hidden' }}>
      <div style={{ padding:'14px 18px', borderBottom:`1px solid ${C.border}`, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, color:C.text }}>Audit Log</div>
        <div style={{ display:'flex', gap:8 }}>
          <input placeholder="Filter…" style={{ background:'#060610', border:`1px solid ${C.border}`, borderRadius:8, padding:'6px 12px', color:C.text, fontSize:12, fontFamily:'inherit', outline:'none' }}/>
          <Btn small outline color={C.muted}>Export CSV</Btn>
        </div>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'110px 100px 130px 1fr 90px', padding:'10px 18px', borderBottom:`1px solid ${C.border}`, fontSize:10, color:C.muted, textTransform:'uppercase', letterSpacing:'0.1em', fontWeight:700 }}>
        <div>Time</div><div>Actor</div><div>Action</div><div>Target</div><div>IP</div>
      </div>
      {logs.map((l,i) => (
        <div key={i} style={{ display:'grid', gridTemplateColumns:'110px 100px 130px 1fr 90px', padding:'11px 18px', borderBottom:i<logs.length-1?`1px solid #0d0d18`:'none', alignItems:'center' }}>
          <div style={{ fontSize:11, color:C.muted }}>{l.time}</div>
          <div style={{ fontSize:12, color:l.actor==='Admin'?C.purple:C.text, fontWeight:l.actor==='Admin'?700:400 }}>{l.actor}</div>
          <div style={{ fontSize:12, color:C.text }}>{l.action}</div>
          <div style={{ fontSize:12, color:C.muted, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{l.target}</div>
          <div style={{ fontSize:11, color:C.muted, fontFamily:'monospace' }}>{l.ip}</div>
        </div>
      ))}
    </Card>
  )
}

// ─── IMPERSONATION VIEW ───────────────────────────────────────────────────────
function ImpersonationView({ account, onExit }) {
  return (
    <div style={{ minHeight:'100vh', background:C.bg }}>
      <div style={{ background:'linear-gradient(90deg,#2a0a3a,#1a0a2a)', border:`1px solid ${C.purple}44`, padding:'10px 24px', display:'flex', alignItems:'center', gap:14 }}>
        <span style={{ fontSize:16 }}>👁️</span>
        <div style={{ flex:1 }}>
          <span style={{ fontSize:13, color:C.purple, fontWeight:700, fontFamily:"'Syne',sans-serif" }}>Admin Impersonation Active</span>
          <span style={{ fontSize:12, color:C.muted, marginLeft:10 }}>Viewing as {account.name} ({account.email})</span>
        </div>
        <div style={{ fontSize:11, color:C.muted }}>Read-only · All actions logged</div>
        <Btn small color={C.purple} onClick={onExit}>Exit Impersonation ×</Btn>
      </div>
      <div style={{ padding:40, maxWidth:900, margin:'0 auto' }}>
        <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:20, color:C.text, marginBottom:6 }}>{account.name}'s Dashboard</div>
        <div style={{ color:C.muted, fontSize:13, marginBottom:28 }}>Read-only impersonation. To make changes, exit and use account management tools.</div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr 1fr', gap:14, marginBottom:20 }}>
          {[{label:'GEO Score',val:account.geoScore,color:C.yellow},{label:'Locations',val:account.locations,color:C.blue},{label:'Plan',val:PLANS[account.plan]?.name,color:PLANS[account.plan]?.color||C.muted},{label:'MRR',val:account.mrr>0?`$${account.mrr}`:'Trial',color:C.green}].map(m=>(
            <Card key={m.label}><Label>{m.label}</Label><div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:20, color:m.color }}>{m.val}</div></Card>
          ))}
        </div>
        <div style={{ padding:'16px 20px', background:'#1a0a2a', border:`1px solid ${C.purple}44`, borderRadius:12, display:'flex', alignItems:'center', gap:12 }}>
          <span style={{ fontSize:20 }}>🔒</span>
          <div style={{ flex:1, fontSize:13, color:C.muted }}>You're in <span style={{ color:C.purple, fontWeight:700 }}>read-only impersonation mode</span>.</div>
          <Btn small color={C.purple} onClick={onExit}>Exit →</Btn>
        </div>
      </div>
    </div>
  )
}

// ─── MAIN ADMIN SHELL ─────────────────────────────────────────────────────────
const ADMIN_TABS = [
  {id:'overview',label:'Revenue',   icon:'📈'},
  {id:'accounts',label:'Accounts',  icon:'👥'},
  {id:'support', label:'Support',   icon:'🎧'},
  {id:'health',  label:'Sys Health',icon:'🩺'},
  {id:'audit',   label:'Audit Log', icon:'📜'},
]

function AdminShell({ admin, onLogout }) {
  const [tab, setTab]               = useState('overview')
  const [impersonating, setImpersonating] = useState(null)

  if (impersonating) return <ImpersonationView account={impersonating} onExit={()=>setImpersonating(null)}/>

  const openTickets = SEED_TICKETS.filter(t=>t.status==='open').length
  const totalMrr    = SEED_ACCOUNTS.reduce((s,a)=>s+a.mrr,0)

  const renderContent = () => {
    if (tab==='overview') return <RevenueOverview/>
    if (tab==='accounts') return <AccountsTable onImpersonate={setImpersonating}/>
    if (tab==='support')  return <SupportTickets/>
    if (tab==='health')   return <SystemHealth/>
    if (tab==='audit')    return <AuditLog/>
  }

  return (
    <div style={{ minHeight:'100vh', background:C.bg }}>
      {/* TOPBAR */}
      <div style={{ height:54, borderBottom:`1px solid ${C.border}`, padding:'0 24px', display:'flex', alignItems:'center', justifyContent:'space-between', position:'sticky', top:0, background:C.bg, zIndex:100 }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ width:30, height:30, background:'linear-gradient(135deg,#f0c040,#a78bfa)', borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center', fontSize:15 }}>⚙️</div>
          <span style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:18, color:'#e8e8f0' }}>GEOrank</span>
          <Pill color={C.purple}>ADMIN PORTAL</Pill>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:14 }}>
          {openTickets > 0 && (
            <div onClick={()=>setTab('support')} style={{ display:'flex', alignItems:'center', gap:6, cursor:'pointer', background:'#2a0a0a', border:`1px solid ${C.red}44`, borderRadius:8, padding:'5px 12px' }}>
              <span style={{ fontSize:12 }}>🎧</span>
              <span style={{ fontSize:12, color:C.red, fontWeight:700 }}>{openTickets} open tickets</span>
            </div>
          )}
          <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:12, color:C.muted }}><Pulse color={C.green}/>All systems</div>
          <div style={{ width:1, height:18, background:C.border }}/>
          <Avatar initials="DR" color={C.purple} size={28}/>
          <span style={{ fontSize:12, color:C.muted }}>{admin.email}</span>
          <Btn small outline color={C.muted} onClick={onLogout}>Logout</Btn>
        </div>
      </div>

      <div style={{ display:'flex', height:'calc(100vh - 54px)' }}>
        {/* SIDEBAR */}
        <div style={{ width:200, borderRight:`1px solid ${C.border}`, padding:'20px 12px', display:'flex', flexDirection:'column' }}>
          <Label>Admin Navigation</Label>
          {ADMIN_TABS.map(t => (
            <button key={t.id} onClick={()=>setTab(t.id)} style={{ display:'flex', alignItems:'center', gap:9, width:'100%', padding:'9px 12px', borderRadius:10, border:`1px solid ${tab===t.id?C.border:'transparent'}`, background:tab===t.id?'#0d0d20':'transparent', color:tab===t.id?C.text:C.muted, fontSize:13, fontFamily:"'Syne',sans-serif", fontWeight:tab===t.id?700:500, cursor:'pointer', marginBottom:3, textAlign:'left' }}>
              <span>{t.icon}</span>{t.label}
              {t.id==='support'&&openTickets>0&&<span style={{ marginLeft:'auto', background:C.red, color:'#fff', borderRadius:'50%', width:18, height:18, display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, fontWeight:800 }}>{openTickets}</span>}
            </button>
          ))}
          <div style={{ marginTop:'auto' }}>
            <Divider/>
            <div style={{ background:'linear-gradient(135deg,#1a0a2a,#0a0a1a)', border:`1px solid ${C.purple}44`, borderRadius:12, padding:14 }}>
              <Label>Platform</Label>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
                <span style={{ fontSize:12, color:C.muted }}>Total MRR</span>
                <span style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, color:C.yellow, fontSize:14 }}>${totalMrr.toLocaleString()}</span>
              </div>
              <div style={{ display:'flex', justifyContent:'space-between' }}>
                <span style={{ fontSize:12, color:C.muted }}>Accounts</span>
                <span style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, color:C.text, fontSize:14 }}>{SEED_ACCOUNTS.filter(a=>a.role!=='admin').length}</span>
              </div>
            </div>
          </div>
        </div>

        {/* MAIN */}
        <div style={{ flex:1, overflow:'auto', padding:'26px 28px' }}>
          <div style={{ maxWidth:1100 }}>
            <div style={{ marginBottom:20 }}>
              <h1 style={{ fontFamily:"'Syne',sans-serif", fontSize:20, fontWeight:800, color:C.text, marginBottom:4 }}>{ADMIN_TABS.find(t=>t.id===tab)?.label}</h1>
              <div style={{ height:2, width:24, background:'linear-gradient(90deg,#a78bfa,#f472b6)', borderRadius:2 }}/>
            </div>
            <div key={tab} style={{ animation:'fadeIn .22s ease' }}>{renderContent()}</div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── ROOT ─────────────────────────────────────────────────────────────────────
export default function AdminApp() {
  const [admin, setAdmin]     = useState(null)
  const [booting, setBooting] = useState(true)

  useEffect(() => { const u = db.get('adminUser'); setAdmin(u); setBooting(false) }, [])

  const logout = () => { db.del('adminUser'); setAdmin(null) }

  if (booting) return <div style={{ minHeight:'100vh', background:C.bg, display:'flex', alignItems:'center', justifyContent:'center' }}><Spinner color={C.purple}/></div>
  if (!admin)  return <AdminLogin onAuth={u=>setAdmin(u)}/>
  return <AdminShell admin={admin} onLogout={logout}/>
}
