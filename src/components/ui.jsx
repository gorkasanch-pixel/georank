import { C } from '../constants'

export function Pill({ children, color = '#333', dot }) {
  return (
    <span style={{ display:'inline-flex', alignItems:'center', gap:5, background:color+'22', color, borderRadius:6, padding:'2px 8px', fontSize:11, fontWeight:700, letterSpacing:'0.05em', whiteSpace:'nowrap' }}>
      {dot && <span style={{ width:5, height:5, borderRadius:'50%', background:color, display:'inline-block' }}/>}
      {children}
    </span>
  )
}

export function Btn({ children, onClick, color = C.yellow, small, outline, disabled, danger, style = {} }) {
  const bg = danger ? C.red : (outline ? 'transparent' : (disabled ? '#1a1a2e' : color))
  const fg = outline ? (danger ? C.red : color) : (disabled ? '#333' : '#07070f')
  return (
    <button onClick={onClick} disabled={disabled} style={{ background:bg, color:fg, border:outline?`1px solid ${danger?C.red:color}`:'none', borderRadius:small?7:10, padding:small?'5px 11px':'11px 22px', fontSize:small?11.5:13, fontWeight:800, cursor:disabled?'not-allowed':'pointer', fontFamily:"'Syne',sans-serif", transition:'all .15s', ...style }}>
      {children}
    </button>
  )
}

export function Card({ children, style = {}, onClick }) {
  return (
    <div onClick={onClick} style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:14, padding:'18px 20px', cursor:onClick?'pointer':undefined, ...style }}>
      {children}
    </div>
  )
}

export function Label({ children, style = {} }) {
  return <div style={{ fontSize:10.5, color:C.muted, textTransform:'uppercase', letterSpacing:'0.12em', fontWeight:700, marginBottom:7, ...style }}>{children}</div>
}

export function Pulse({ color }) {
  return <span style={{ width:7, height:7, borderRadius:'50%', background:color, display:'inline-block', animation:'pulse 1.8s infinite', color }}/>
}

export function Divider() {
  return <div style={{ height:1, background:C.border, margin:'16px 0' }}/>
}

export function Avatar({ initials, color = C.purple, size = 32 }) {
  return (
    <div style={{ width:size, height:size, borderRadius:'50%', background:color+'33', border:`1px solid ${color}55`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:size*0.35, fontWeight:800, color, fontFamily:"'Syne',sans-serif", flexShrink:0 }}>
      {initials}
    </div>
  )
}

export function ScoreRing({ score, color, size = 80 }) {
  const r = size/2-7, circ = 2*Math.PI*r, dash = (score/100)*circ
  return (
    <div style={{ position:'relative', width:size, height:size }}>
      <svg width={size} height={size} style={{ transform:'rotate(-90deg)', position:'absolute' }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#111128" strokeWidth={6}/>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={6} strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" style={{ transition:'stroke-dasharray 1.2s cubic-bezier(.4,0,.2,1)' }}/>
      </svg>
      <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center' }}>
        <span style={{ fontSize:size>70?20:14, fontWeight:800, color, fontFamily:"'Syne',sans-serif" }}>{score}</span>
      </div>
    </div>
  )
}

export function SparkLine({ data, color, w = 120, h = 36 }) {
  const max = Math.max(...data), min = Math.min(...data)
  const pts = data.map((v,i) => `${(i/(data.length-1))*w},${h-((v-min)/(max-min||1))*(h-4)}`).join(' ')
  return (
    <svg width={w} height={h}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx={(data.length-1)/(data.length-1)*w} cy={h-((data[data.length-1]-min)/(max-min||1))*(h-4)} r={3} fill={color}/>
    </svg>
  )
}

export function MiniBar({ data, color, height = 48 }) {
  const max = Math.max(...data)
  return (
    <div style={{ display:'flex', alignItems:'flex-end', gap:2, height }}>
      {data.map((v,i) => (
        <div key={i} style={{ flex:1, background:i===data.length-1?color:color+'55', borderRadius:'2px 2px 0 0', height:`${(v/max)*100}%` }}/>
      ))}
    </div>
  )
}

export function Modal({ title, onClose, children, width = 520 }) {
  return (
    <div style={{ position:'fixed', inset:0, background:'#000000bb', zIndex:200, display:'flex', alignItems:'center', justifyContent:'center', padding:20 }} onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:18, padding:28, width, maxWidth:'96vw', maxHeight:'90vh', overflow:'auto', animation:'fadeIn .18s ease' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
          <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:17, color:C.text }}>{title}</div>
          <button onClick={onClose} style={{ background:'transparent', border:'none', color:C.muted, fontSize:22, cursor:'pointer', lineHeight:1 }}>×</button>
        </div>
        {children}
      </div>
    </div>
  )
}

export function StatusPill({ status }) {
  const map = { active:[C.green,'Active'], trialing:[C.blue,'Trialing'], paused:[C.orange,'Paused'], churned:[C.red,'Churned'] }
  const [color, label] = map[status] || [C.muted, status]
  return <Pill color={color} dot>{label}</Pill>
}

export function Spinner({ color = C.yellow }) {
  return <div style={{ width:32, height:32, border:`3px solid #161628`, borderTop:`3px solid ${color}`, borderRadius:'50%', animation:'spin .8s linear infinite' }}/>
}
