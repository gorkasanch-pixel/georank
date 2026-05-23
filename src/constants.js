// ─── DESIGN TOKENS ────────────────────────────────────────────────────────────
export const C = {
  bg:     '#07070f',
  card:   '#0d0d1a',
  border: '#161628',
  text:   '#d0d0e8',
  muted:  '#525270',
  yellow: '#f0c040',
  green:  '#4ade80',
  blue:   '#60a5fa',
  pink:   '#f472b6',
  red:    '#f87171',
  orange: '#fb923c',
  purple: '#a78bfa',
}

// ─── PLANS ────────────────────────────────────────────────────────────────────
export const PLANS = {
  starter: { name:'Starter', price:49,  color:C.green,  merchants:1,   keywords:10,  snippets:20,
    features:['1 merchant location','10 tracked keywords','20 AI snippets/mo','Basic schema builder','Email reports'] },
  growth:  { name:'Growth',  price:149, color:C.blue,   merchants:5,   keywords:50,  snippets:100,
    features:['5 merchant locations','50 tracked keywords','100 AI snippets/mo','Full schema suite','GBP integration','Priority support'] },
  agency:  { name:'Agency',  price:399, color:C.yellow, merchants:999, keywords:999, snippets:999,
    features:['Unlimited locations','Unlimited keywords','Unlimited AI snippets','White-label reports','API access','Dedicated account manager'] },
}

// ─── SCHEMA TYPES ─────────────────────────────────────────────────────────────
export const SCHEMA_TYPES = [
  { id:'local',   icon:'🏪', label:'Local Business',  desc:'Core business info for Google Maps & AI location queries' },
  { id:'faq',     icon:'❓', label:'FAQ',             desc:'Q&A surfaced in ChatGPT, Perplexity & voice search' },
  { id:'product', icon:'📦', label:'Product',         desc:'Product listings for AI shopping agents' },
  { id:'review',  icon:'⭐', label:'Review / Rating', desc:'Star ratings in results and AI summaries' },
  { id:'event',   icon:'📅', label:'Event',           desc:'Events indexed by AI assistants for what\'s on queries' },
  { id:'menu',    icon:'🍽️', label:'Restaurant Menu', desc:'Menu data for AI food recommendation engines' },
]

// ─── SAMPLE DATA ──────────────────────────────────────────────────────────────
export const SAMPLE_MERCHANTS = [
  { id:'m1', name:'Bloom & Grind Coffee',  category:'Café',   city:'San Francisco, CA', avatar:'☕', score:74, googleScore:81, aiScore:67, localScore:79 },
  { id:'m2', name:'Verdant Garden Supply', category:'Retail', city:'Oakland, CA',       avatar:'🌿', score:61, googleScore:69, aiScore:53, localScore:64 },
  { id:'m3', name:'Ironveil Fitness',      category:'Gym',    city:'Berkeley, CA',      avatar:'🏋️', score:88, googleScore:91, aiScore:85, localScore:87 },
]

export const SAMPLE_KEYWORDS = [
  { id:1, keyword:'artisan coffee shop downtown', google:4,  ai:2,  trend:'up',     vol:'1.2K', cpc:'$1.40' },
  { id:2, keyword:'best espresso near me',        google:8,  ai:5,  trend:'up',     vol:'3.8K', cpc:'$2.10' },
  { id:3, keyword:'organic pastries breakfast',   google:12, ai:7,  trend:'stable', vol:'890',  cpc:'$0.90' },
  { id:4, keyword:'wifi friendly cafe work',      google:6,  ai:3,  trend:'up',     vol:'540',  cpc:'$1.70' },
  { id:5, keyword:'vegan options cafe',           google:19, ai:11, trend:'down',   vol:'2.1K', cpc:'$1.20' },
]

export const SEED_ACCOUNTS = [
  { id:'a1', name:'Sarah Kim',        email:'sarah@bloomgrind.com',     plan:'agency',  status:'active',   joined:'2025-11-03', mrr:399, locations:4, geoScore:74, lastSeen:'2 min ago',  avatar:'SK', role:'merchant' },
  { id:'a2', name:'Marcus Webb',      email:'marcus@verdantco.com',     plan:'growth',  status:'active',   joined:'2026-01-18', mrr:149, locations:2, geoScore:61, lastSeen:'1 hr ago',   avatar:'MW', role:'merchant' },
  { id:'a3', name:'Priya Nair',       email:'priya@ironveilfitness.io', plan:'agency',  status:'active',   joined:'2025-09-22', mrr:399, locations:7, geoScore:88, lastSeen:'3 hrs ago',  avatar:'PN', role:'merchant' },
  { id:'a4', name:'Tom Okafor',       email:'tom@harvestbowls.co',      plan:'starter', status:'trialing', joined:'2026-04-30', mrr:0,   locations:1, geoScore:42, lastSeen:'yesterday',  avatar:'TO', role:'merchant' },
  { id:'a5', name:'Lena Schulz',      email:'lena@stadtlicht.de',       plan:'growth',  status:'active',   joined:'2026-02-14', mrr:149, locations:3, geoScore:79, lastSeen:'5 min ago',  avatar:'LS', role:'merchant' },
  { id:'a6', name:'Raj Patel',        email:'raj@spiceroute.in',        plan:'starter', status:'paused',   joined:'2025-12-01', mrr:0,   locations:1, geoScore:55, lastSeen:'2 days ago', avatar:'RP', role:'merchant' },
  { id:'a7', name:'Chloe Beaumont',   email:'chloe@lemarche.fr',        plan:'agency',  status:'active',   joined:'2025-08-10', mrr:399, locations:9, geoScore:91, lastSeen:'just now',   avatar:'CB', role:'merchant' },
]

export const SEED_TICKETS = [
  { id:'t1', account:'Sarah Kim',   subject:'GSC not syncing after OAuth',    status:'open',     priority:'high',   created:'May 21', assignee:'Dev R.'      },
  { id:'t2', account:'Tom Okafor', subject:'Can\'t add second location',       status:'open',     priority:'medium', created:'May 20', assignee:'Unassigned'  },
  { id:'t3', account:'Marcus Webb',subject:'Invoice shows wrong amount',       status:'resolved', priority:'low',    created:'May 18', assignee:'Dev R.'      },
  { id:'t4', account:'Raj Patel',  subject:'Account paused by mistake',        status:'open',     priority:'high',   created:'May 22', assignee:'Unassigned'  },
  { id:'t5', account:'Lena Schulz',subject:'Schema validator returning 404',   status:'open',     priority:'medium', created:'May 19', assignee:'Dev R.'      },
]

export const MRR_HISTORY   = [4100,5200,6300,7800,8900,10400,11800,13200,14700,15900,17200,18900]
export const CHURN_HISTORY = [2,3,1,4,2,3,2,1,3,2,2,1]
export const SIGNUP_HISTORY= [8,11,14,18,16,22,19,24,27,21,29,33]
export const CHART_DATA    = {
  ai:     [420,510,490,630,710,842,760,900,1020,1100,980,1204],
  google: [1800,2100,1950,2400,2700,3100,2900,3400,3800,4100,3700,4291],
  clicks: [84,102,97,120,135,160,148,175,190,210,195,231],
}
export const MONTHS = ['Jun','Jul','Aug','Sep','Oct','Nov','Dec','Jan','Feb','Mar','Apr','May']
