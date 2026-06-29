import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import './Account.css'

function esc(s) {
  return (s == null ? '' : String(s)).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]))
}

export default function Account() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const nextBook = searchParams.get('next') === 'book'

  const [activeTab, setActiveTab] = useState('login')
  const [msg, setMsg] = useState({ text: '', kind: '' })
  const [session, setSession] = useState(null)
  const [enquiries, setEnquiries] = useState([])
  const [loading, setLoading] = useState(true)
  const [suppressAuthRender, setSuppressAuthRender] = useState(false)

  // Login form
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPass, setLoginPass] = useState('')

  // Register form
  const [regName, setRegName] = useState('')
  const [regEmail, setRegEmail] = useState('')
  const [regPass, setRegPass] = useState('')

  function showMsg(text, kind) {
    setMsg({ text, kind: kind || 'err' })
  }

  // Check session on mount
  useEffect(() => {
    async function checkSession() {
      const { data: { session: s } } = await supabase.auth.getSession()
      if (s) {
        navigate('/dashboard', { replace: true })
      } else {
        setSession(null)
        setLoading(false)
      }
    }
    checkSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      if (suppressAuthRender) return
      if (s) {
        navigate('/dashboard', { replace: true })
      } else {
        setSession(null)
      }
    })
    return () => subscription.unsubscribe()
  }, [navigate, suppressAuthRender])

  // Load enquiries when logged in
  useEffect(() => {
    if (!session) return
    async function load() {
      const { data, error } = await supabase.from('enquiries').select('*').order('created_at', { ascending: false })
      if (!error && data) setEnquiries(data)
    }
    load()
  }, [session])

  // Google sign-in
  const handleGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.href },
    })
    if (error) showMsg(error.message)
  }

  // Email login
  const handleLogin = async (e) => {
    e.preventDefault()
    const { error } = await supabase.auth.signInWithPassword({
      email: loginEmail,
      password: loginPass,
    })
    if (error) { showMsg(error.message); return }
    // onAuthStateChange will redirect
  }

  // Email register
  const handleRegister = async (e) => {
    e.preventDefault()
    setSuppressAuthRender(true)
    const { data, error } = await supabase.auth.signUp({
      email: regEmail,
      password: regPass,
      options: { data: { full_name: regName } },
    })
    if (error) { setSuppressAuthRender(false); showMsg(error.message); return }
    await supabase.auth.signOut()
    setSuppressAuthRender(false)
    setLoginEmail(regEmail)
    setLoginPass('')
    setRegName('')
    setRegEmail('')
    setRegPass('')
    setActiveTab('login')
    if (data.session) {
      showMsg('Account created! Please log in to continue.', 'ok')
    } else {
      showMsg('Account created! Please check your email to confirm, then log in.', 'ok')
    }
  }

  // Logout
  const handleLogout = async () => {
    await supabase.auth.signOut()
    setSession(null)
    setEnquiries([])
  }

  if (loading) return null

  // Logged-in view
  if (session) {
    const name = session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || ''
    return (
      <>
        <svg width="0" height="0" style={{ position: 'absolute' }}><defs><g id="arivamark"><path d="M50 8 L80 82 Q50 68 20 82 Z" fill="none" stroke="currentColor" strokeWidth="11" strokeLinejoin="round" strokeLinecap="round" /></g></defs></svg>
        <div className="topbar">
          <Link to="/ariva-website" className="logo" aria-label="ariva home">
            <img className="logo-img" src="/assets/ariva-logo-dark.svg" alt="ariva" />
          </Link>
          <Link to="/ariva-website" className="back">← Back to site</Link>
        </div>
        <div className="acct-wrap">
          <div className="card wide">
            <div className="acct-head">
              <div>
                <span className="eyebrow">Your Account</span>
                <h1>Hello, {name}</h1>
                <div className="acct-name">{session.user.email}</div>
              </div>
              <button className="btn btn-outline logout" type="button" onClick={handleLogout}>Log out</button>
            </div>

            {nextBook && (
              <div className="continue-bar">
                <p>You're logged in. Ready to finish your enquiry?</p>
                <Link to="/ariva-website#book" className="btn btn-ink">Continue to booking →</Link>
              </div>
            )}

            <h3 style={{ margin: '22px 0 14px', fontSize: '22px' }}>Your booking enquiries</h3>
            <div>
              {enquiries.length === 0 ? (
                <p className="empty">No enquiries yet. When you send a booking enquiry from the site, it will appear here.</p>
              ) : (
                enquiries.map((r) => {
                  const when = r.created_at ? new Date(r.created_at).toLocaleDateString() : ''
                  return (
                    <div className="enq" key={r.id || r.created_at}>
                      <div className="enq-top"><span className="enq-pkg">{r.package || 'Enquiry'}</span><span className="enq-date">{when}</span></div>
                      <div className="enq-meta">Event date: {r.event_date || '—'} · Guests: {r.guests || '—'} · Pincode: {r.pincode || '—'}</div>
                      {r.notes && <div className="enq-notes">"{r.notes}"</div>}
                    </div>
                  )
                })
              )}
            </div>

            <p className="foot-note"><Link to="/ariva-website#book" style={{ color: 'var(--terracotta)' }}>+ Start a new enquiry</Link></p>
          </div>
        </div>
      </>
    )
  }

  // Logged-out view
  return (
    <>
      <svg width="0" height="0" style={{ position: 'absolute' }}><defs><g id="arivamark"><path d="M50 8 L80 82 Q50 68 20 82 Z" fill="none" stroke="currentColor" strokeWidth="11" strokeLinejoin="round" strokeLinecap="round" /></g></defs></svg>
      <div className="topbar">
        <Link to="/ariva-website" className="logo" aria-label="ariva home">
          <img className="logo-img" src="/assets/ariva-logo-dark.svg" alt="ariva" />
        </Link>
        <Link to="/ariva-website" className="back">← Back to site</Link>
      </div>
      <div className="acct-wrap">
        <div className="card">
          <span className="eyebrow">Your Account</span>
          <h1>Welcome to ARIVA</h1>
          <p className="sub">Sign in or create a free account to send and track your booking enquiries.</p>

          <div className={`msg${msg.text ? ' show' : ''} ${msg.kind}`}>{msg.text}</div>

          <button className="btn btn-google" type="button" onClick={handleGoogle}>
            <svg viewBox="0 0 48 48"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.4 29.3 35 24 35c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.5 5.1 29.5 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21 21-9.4 21-21c0-1.4-.2-2.8-.4-4.5z" /><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 13 24 13c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.5 5.1 29.5 3 24 3 16 3 9.1 7.6 6.3 14.7z" /><path fill="#4CAF50" d="M24 45c5.2 0 10-2 13.6-5.2l-6.3-5.3C29.2 35.9 26.7 37 24 37c-5.3 0-9.7-2.6-11.3-7l-6.5 5C9.1 42.3 16 45 24 45z" /><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4 5.5l6.3 5.3C41.4 36 45 30.6 45 24c0-1.4-.2-2.8-.4-4.5z" /></svg>
            Continue with Google
          </button>

          <div className="divider">or</div>

          <div className="tabs">
            <button type="button" className={activeTab === 'login' ? 'active' : ''} onClick={() => setActiveTab('login')}>Log in</button>
            <button type="button" className={activeTab === 'register' ? 'active' : ''} onClick={() => setActiveTab('register')}>Register</button>
          </div>

          {/* LOGIN FORM */}
          {activeTab === 'login' && (
            <form onSubmit={handleLogin}>
              <div className="field"><label htmlFor="loginEmail">Email</label><input type="email" id="loginEmail" placeholder="you@email.com" required value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} /></div>
              <div className="field"><label htmlFor="loginPass">Password</label><input type="password" id="loginPass" placeholder="Your password" required value={loginPass} onChange={(e) => setLoginPass(e.target.value)} /></div>
              <button type="submit" className="btn btn-primary">Log in</button>
            </form>
          )}

          {/* REGISTER FORM */}
          {activeTab === 'register' && (
            <form onSubmit={handleRegister}>
              <div className="field"><label htmlFor="regName">Your Name</label><input type="text" id="regName" placeholder="Full name" required value={regName} onChange={(e) => setRegName(e.target.value)} /></div>
              <div className="field"><label htmlFor="regEmail">Email</label><input type="email" id="regEmail" placeholder="you@email.com" required value={regEmail} onChange={(e) => setRegEmail(e.target.value)} /></div>
              <div className="field"><label htmlFor="regPass">Password</label><input type="password" id="regPass" placeholder="At least 6 characters" minLength="6" required value={regPass} onChange={(e) => setRegPass(e.target.value)} /></div>
              <button type="submit" className="btn btn-ink">Create account</button>
            </form>
          )}

          <p className="foot-note">By continuing you agree to be contacted about your enquiry.</p>
        </div>
      </div>
    </>
  )
}
