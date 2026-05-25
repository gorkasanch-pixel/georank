import { useEffect, useState } from 'react'

export default function GbpCallback() {
  const [status, setStatus] = useState('Connecting to Google Business Profile...')
  const [error, setError]   = useState(null)

  useEffect(() => {
    const params   = new URLSearchParams(window.location.search)
    const code      = params.get('code')
    const merchantId = params.get('state')

    if (!code) {
      setError('No authorization code received from Google.')
      return
    }

    const exchange = async () => {
      try {
        setStatus('Authorizing with Google...')
        const res = await fetch('https://ezltbarrkvlfijbkwwam.supabase.co/functions/v1/connect-gbp?action=callback', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code, merchant_id: merchantId }),
        })
        const data = await res.json()
        if (data.success) {
          setStatus(`Connected! Found ${data.locations?.length || 0} location(s). Redirecting...`)
          setTimeout(() => { window.location.href = '/app/?gbp=connected' }, 1500)
        } else {
          setError(data.error || 'Connection failed. Please try again.')
        }
      } catch (e) {
        setError(e.message)
      }
    }

    exchange()
  }, [])

  return (
    <div style={{ minHeight:'100vh', background:'#07070f', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'DM Mono',monospace" }}>
      <div style={{ textAlign:'center', maxWidth:400, padding:24 }}>
        <div style={{ fontSize:36, marginBottom:20 }}>🔍</div>
        {error ? (
          <>
            <div style={{ color:'#f87171', fontSize:15, marginBottom:16 }}>{error}</div>
            <button onClick={()=>window.location.href='/app/'} style={{ background:'#f0c040', color:'#07070f', border:'none', borderRadius:10, padding:'10px 24px', fontSize:13, fontWeight:800, cursor:'pointer' }}>Back to App</button>
          </>
        ) : (
          <>
            <div style={{ color:'#d0d0e8', fontSize:15, marginBottom:8 }}>{status}</div>
            <div style={{ color:'#525270', fontSize:12 }}>Please wait...</div>
          </>
        )}
      </div>
    </div>
  )
}
