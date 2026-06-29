import { useState, useEffect, useRef, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import './ArivaWebsite.css'

const WA_NUMBER = import.meta.env.VITE_WA_NUMBER

const posts = {
  post1: {
    tag: 'Why Live',
    title: 'Why live cooking beats any buffet tray',
    body: `<p>Think about the best meal you've ever had at a family gathering. We'd bet money it wasn't the one that arrived in steel containers an hour before guests did.</p>
      <p><strong>Food loses its soul in transit.</strong> A dosa is at its best for about ninety seconds after it leaves the tawa. Biryani is a different dish when the dum is opened in front of you. Jalebi that's been sitting for three hours is just orange sugar. This isn't snobbery - it's chemistry. Texture, aroma, and temperature are most of what we call "taste", and all three start fading the moment cooking stops.</p>
      <p><strong>The cooking is the entertainment.</strong> Watch what happens at any wedding: the longest queue is always at the live counter. People don't just want to eat - they want to watch, smell, lean in, and ask the chef to make theirs extra spicy. A live kitchen turns dinner into the main event of your evening.</p>
      <p><strong>And there's trust.</strong> When food is cooked in front of you, there's nothing to wonder about. You saw the oil, the vegetables, the hands. That transparency is something no cloud kitchen can offer.</p>
      <p>That's the whole idea behind ARIVA. We didn't set out to deliver food. We set out to deliver the moment when everyone gathers around the fire.</p>`
  },
  post2: {
    tag: 'Behind The Scenes',
    title: 'Why our kitchen rolls in on a tractor',
    body: `<p>Everyone asks about the tractor. So here's the honest story.</p>
      <p>When we designed ARIVA, we knew we wanted a full kitchen - tandoor, wok burners, a dosa tawa, cold storage, prep counters. That doesn't fit in a van. It fits in a <strong>trailer</strong> - the same sturdy, practical format food trailers use around the world.</p>
      <p>And in India, nothing moves a trailer better than a tractor. It handles narrow colony roads, gravel farm lanes, and gated community ramps that would defeat a truck. It parks precisely. It's easy to maintain. And - let's be honest - <strong>it makes an entrance.</strong></p>
      <p>There's also something quietly right about it. ARIVA comes from a family that knows agriculture, where the tractor is the most honest machine there is - it does real work, every day, without fuss. Our kitchen rides in on that same spirit: no pretension, just craft.</p>
      <p>When you book ARIVA, the tractor pulls the trailer to your gate 30–45 minutes early. By the time your first guest arrives, the counter is open, the flame is on, and the trailer looks like it was always meant to be parked right there.</p>`
  },
  post3: {
    tag: 'Heritage Recipes',
    title: 'The dish your grandmother never wrote down',
    body: `<p>Every family in Hyderabad has one. The pulao only one aunt gets right. The kodi kura your grandmother made by instinct - "konchem konchem" was her only measurement. The halwa that shows up once a year and disappears in minutes.</p>
      <p>These recipes are rarely written down. They live in someone's hands, in the smell of a kitchen, in memory. And at most celebrations, they're missing - because the host is too busy hosting to cook, and no caterer offers to make <em>your</em> food.</p>
      <p><strong>That's why the Heritage Recipe Experience exists.</strong> It's simple: when you book, share the recipe - written, or just a voice note of you (or amma) explaining it. Our chef calls you the same day to catch the details that never make it to paper. The day before your event, we do a practice cook. And on the night, your family's dish is cooked live, in front of the people it means the most to.</p>
      <p>We ask for the recipe at least two days ahead - great dishes deserve a rehearsal. And we'll be honest with you: if a dish can't be done justice live, we'll tell you upfront rather than serve a weak version of something precious.</p>
      <p>No one else in Hyderabad does this. We think every city should.</p>`
  }
}

export default function ArivaWebsite() {
  const navigate = useNavigate()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [openFaq, setOpenFaq] = useState(null)
  const [modalPost, setModalPost] = useState(null)
  const [pinMsg, setPinMsg] = useState({ text: '', cls: '' })
  const [navAccountText, setNavAccountText] = useState('Login')
  const [menuCategories, setMenuCategories] = useState([])
  const [menuItems, setMenuItems] = useState([])
  const [menuLoading, setMenuLoading] = useState(true)

  const heroSceneRef = useRef(null)
  const heroRef = useRef(null)
  const markBgRef = useRef(null)
  const fdateRef = useRef(null)
  const fpkgRef = useRef(null)

  // Nav scroll
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Scroll reveal
  useEffect(() => {
    const obs = new IntersectionObserver(
      (es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target) } }),
      { threshold: 0.12 }
    )
    document.querySelectorAll('.reveal').forEach((el) => obs.observe(el))
    return () => obs.disconnect()
  }, [])

  // Act underline animation
  useEffect(() => {
    if (menuLoading) return;
    const actObs = new IntersectionObserver(
      (es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('visible'); actObs.unobserve(e.target) } }),
      { threshold: 0.25 }
    )
    document.querySelectorAll('.act').forEach((a) => actObs.observe(a))
    return () => actObs.disconnect()
  }, [menuLoading])

  // Fetch menu data
  useEffect(() => {
    async function fetchMenu() {
      try {
        const [catsRes, itemsRes] = await Promise.all([
          supabase.from('menu_categories').select('*').order('section_number'),
          supabase.from('menu_items').select('*').eq('is_active', true).order('display_order')
        ]);
        if (!catsRes.error && !itemsRes.error) {
          setMenuCategories(catsRes.data);
          setMenuItems(itemsRes.data);
        }
      } catch (err) {
        console.error("Error fetching menu:", err);
      } finally {
        setMenuLoading(false);
      }
    }
    fetchMenu();
  }, [])

  // Hero parallax
  useEffect(() => {
    const fine = window.matchMedia('(pointer:fine)').matches
    const scene = heroSceneRef.current
    const hero = heroRef.current
    if (!scene || !fine || !hero) return

    const handleMove = (e) => {
      const r = hero.getBoundingClientRect()
      const x = (e.clientX - r.left) / r.width - 0.5
      const y = (e.clientY - r.top) / r.height - 0.5
      scene.style.transform = `rotateY(${x * 9}deg) rotateX(${-y * 7}deg)`
    }
    const handleLeave = () => { scene.style.transform = 'rotateY(0) rotateX(0)' }

    hero.addEventListener('mousemove', handleMove)
    hero.addEventListener('mouseleave', handleLeave)
    return () => {
      hero.removeEventListener('mousemove', handleMove)
      hero.removeEventListener('mouseleave', handleLeave)
    }
  }, [])

  // Card 3D tilt
  useEffect(() => {
    const fine = window.matchMedia('(pointer:fine)').matches
    if (!fine) return

    const cards = document.querySelectorAll('.card3d')
    const handlers = []
    cards.forEach((card) => {
      const move = (e) => {
        const r = card.getBoundingClientRect()
        const x = (e.clientX - r.left) / r.width - 0.5
        const y = (e.clientY - r.top) / r.height - 0.5
        card.style.transform = `perspective(900px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg) translateY(-6px)`
      }
      const leave = () => { card.style.transform = '' }
      card.addEventListener('mousemove', move)
      card.addEventListener('mouseleave', leave)
      handlers.push({ card, move, leave })
    })
    return () => handlers.forEach(({ card, move, leave }) => {
      card.removeEventListener('mousemove', move)
      card.removeEventListener('mouseleave', leave)
    })
  }, [])

  // Mark BG parallax
  useEffect(() => {
    const markBg = markBgRef.current
    const handleScroll = () => {
      if (markBg && window.scrollY < 900) {
        markBg.style.transform = `translate(-50%,-54%) scale(2.6) translateY(${window.scrollY * 0.12}px)`
      }
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Date min
  useEffect(() => {
    if (fdateRef.current) {
      fdateRef.current.min = new Date().toISOString().split('T')[0]
    }
  }, [])

  // Auth state for nav
  useEffect(() => {
    async function checkAuth() {
      const { data: { session } } = await supabase.auth.getSession()
      setNavAccountText(session ? 'My Account' : 'Login')
    }
    checkAuth()
  }, [])



  // Close mobile menu on link click
  const closeMenu = () => { setMenuOpen(false) }

  // Package preselect
  const setPkg = useCallback((name) => {
    if (!fpkgRef.current) return
    const sel = fpkgRef.current
    for (const o of sel.options) {
      if (o.text.startsWith(name)) { sel.selectedIndex = o.index; break }
    }
  }, [])

  // Pincode check
  const handlePincode = (e) => {
    const v = e.target.value.trim()
    if (v.length === 6) {
      if (/^50[0-2]\d{3}$/.test(v)) {
        setPinMsg({ text: '✓ Great news - we serve your area!', cls: 'ok' })
      } else {
        setPinMsg({ text: "We currently serve Hyderabad only - but send your enquiry and we'll see what we can do.", cls: 'no' })
      }
    } else {
      setPinMsg({ text: '', cls: '' })
    }
  }

  // FAQ toggle
  const toggleFaq = (idx) => {
    setOpenFaq((prev) => (prev === idx ? null : idx))
  }

  // Blog modal
  const openPost = (key) => {
    setModalPost(posts[key])
    document.body.style.overflow = 'hidden'
  }
  const closeModal = () => {
    setModalPost(null)
    document.body.style.overflow = ''
  }

  // Close modal on Escape
  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') closeModal() }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [])

  // Booking form
  const handleBooking = async (e) => {
    e.preventDefault()
    const g = (id) => document.getElementById(id).value

    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      alert('Please log in or create a free account first, then send your enquiry.')
      navigate('/account?next=book')
      return
    }

    const enquiry = {
      user_id: session.user.id,
      name: g('fname'),
      phone: g('fphone'),
      event_date: g('fdate') || null,
      guests: g('fguests') ? Number(g('fguests')) : null,
      package: g('fpkg'),
      pincode: g('fpin'),
      notes: g('fnotes') || null,
    }
    const { error } = await supabase.from('enquiries').insert(enquiry)
    if (error) {
      alert('Sorry - we could not save your enquiry: ' + error.message)
      return
    }

    const msg =
      `Hi ARIVA! I'd like to enquire about a booking.%0A%0A` +
      `*Name:* ${encodeURIComponent(g('fname'))}%0A` +
      `*Phone:* ${encodeURIComponent(g('fphone'))}%0A` +
      `*Date:* ${encodeURIComponent(g('fdate'))}%0A` +
      `*Guests:* ${encodeURIComponent(g('fguests'))}%0A` +
      `*Package:* ${encodeURIComponent(g('fpkg'))}%0A` +
      `*Pincode:* ${encodeURIComponent(g('fpin'))}%0A` +
      `*Details:* ${encodeURIComponent(g('fnotes') || '-')}`
    window.open(`https://wa.me/${WA_NUMBER}?text=${msg}`, '_blank')
  }

  const faqItems = [
    { q: 'What exactly does ARIVA bring to my home?', a: 'Everything. Our kitchen trailer, a professional chef and helper, all ingredients, cookware, serving ware, and the hands to set up, serve, and clean up. You provide the venue and the guests - we do the rest.' },
    { q: 'How early do you arrive, and how much space do you need?', a: "Our team arrives 30–45 minutes before your event to set up, so the counter is open and flames are on before your first guest walks in. Space-wise, we need roughly two car-lengths for the trailer - driveways, gated community lawns, and open compounds all work. For gated communities, we coordinate with your RWA for access." },
    { q: 'Is the food safe and hygienic?', a: "Hygiene is non-negotiable for us. Ingredients are sourced fresh per event, prepped under strict food-safety protocols, and cooked live in front of you. Nothing is reheated - you literally watch your food being made." },
    { q: 'Can you handle vegetarian or allergy requirements?', a: 'Absolutely. Every menu is adapted to your guests - full vegetarian menus, allergy exclusions, and spice-level adjustments. You tell us once at booking, and the chef plans around it.' },
    { q: 'How does the Heritage Recipe Experience work?', a: "Share your family recipe when you book - written or as a voice note - at least 2 days before your event. Our chef calls you the same day to understand it properly, does a practice cook the day before, and then cooks it live at your gathering. Included in Curated and Signature; +₹2,500 on Intimate." },
    { q: 'Which areas do you serve?', a: 'All of Hyderabad. Travel is included within 12 km of our base; beyond that, a transparent ₹50/km applies. Enter your pincode in the booking form and we\'ll confirm instantly.' },
    { q: 'How far in advance should I book?', a: "We take a limited number of gatherings each weekend so every event gets full attention. We recommend booking 1–2 weeks ahead - earlier for Saturdays and festival dates. Adding a Heritage Recipe? Give us at least 2 days." },
    { q: 'What if it rains?', a: "Our trailer works under covered areas - porticos, covered driveways, clubhouse entrances. If weather forces a change, we'll work with you to shift the setup or reschedule. During monsoon months we plan a covered fallback with you in advance." },
  ]

  return (
    <>
      {/* Reusable logo mark SVG defs */}
      <svg width="0" height="0" style={{ position: 'absolute' }}>
        <defs>
          <g id="arivamark">
            <path d="M50 8 L80 82 Q50 68 20 82 Z" fill="none" stroke="currentColor" strokeWidth="11" strokeLinejoin="round" strokeLinecap="round" />
          </g>
        </defs>
      </svg>

      {/* NAV */}
      <nav id="nav" className={scrolled ? 'scrolled' : ''}>
        <div className="wrap nav-inner">
          <a href="#top" className="logo" aria-label="ariva home">
            <img className="logo-img" src="/assets/ariva-logo-dark.svg" alt="ariva" />
          </a>
          <ul className={`nav-links${menuOpen ? ' openm' : ''}`} id="navLinks">
            <li><a href="#story" onClick={closeMenu}>Our Story</a></li>
            <li><a href="#menu" onClick={closeMenu}>The Menu</a></li>
            <li><a href="#byor" onClick={closeMenu}>Heritage Recipe</a></li>
            <li><a href="#packages" onClick={closeMenu}>Experiences</a></li>
            <li><a href="#blog" onClick={closeMenu}>Journal</a></li>
            <li><a href="#faq" onClick={closeMenu}>FAQs</a></li>
            <li><Link to="/account" onClick={closeMenu}>{navAccountText}</Link></li>
            <li><Link to="/book" className="btn btn-primary nav-cta" onClick={closeMenu}>Book Now</Link></li>
          </ul>
          <button className="hamburger" aria-label="Menu" onClick={() => setMenuOpen((v) => !v)}>
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>
      </nav>

      {/* HERO */}
      <header className="hero" id="top" ref={heroRef}>
        <svg className="hero-mark-bg" ref={markBgRef} width="700" height="700" viewBox="0 0 100 100" style={{ color: 'var(--bone)' }}><use href="#arivamark" /></svg>
        <div className="wrap hero-grid">
          <div>
            <span className="eyebrow">Mobile Live Kitchen · Hyderabad · Est. 2026</span>
            <h1>The live kitchen<br />comes <em>to you.</em></h1>
            <p className="lead">A chef-driven kitchen trailer arrives at your home, and every course is cooked fresh in front of your guests - the aroma, the sizzle, the theatre. That's the celebration.</p>
            <div className="hero-ctas">
              <Link to="/book" className="btn btn-primary">Reserve Your Date</Link>
              <a href="#menu" className="btn btn-light">Explore The Menu</a>
            </div>
            <div className="hero-meta">
              <div><strong>15–50 Guests</strong>Intimate gatherings</div>
              <div><strong>Live Cooking</strong>Prepared fresh on-site</div>
              <div><strong>Heritage Recipes</strong>Your family dish, reimagined</div>
            </div>
          </div>
          <div className="hero-scene" id="heroScene" ref={heroSceneRef}>
            {/* Tractor + kitchen trailer illustration */}
            <svg className="hero-trailer" viewBox="0 0 640 400" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="ARIVA tractor pulling a live kitchen trailer">
              <ellipse cx="320" cy="362" rx="290" ry="16" fill="#0c0a08" />
              <g>
                <rect x="180" y="120" width="320" height="180" rx="14" fill="#F4EFE6" />
                <rect x="180" y="120" width="320" height="44" rx="14" fill="#B5532D" />
                <rect x="180" y="150" width="320" height="14" fill="#B5532D" />
                <g>
                  <rect x="206" y="96" width="268" height="14" rx="7" fill="#93421F" />
                  <path d="M206 110 h38 l-8 22 h-22 Z" fill="#B5532D" /><path d="M244 110 h38 l-8 22 h-22 Z" fill="#F4EFE6" />
                  <path d="M282 110 h38 l-8 22 h-22 Z" fill="#B5532D" /><path d="M320 110 h38 l-8 22 h-22 Z" fill="#F4EFE6" />
                  <path d="M358 110 h38 l-8 22 h-22 Z" fill="#B5532D" /><path d="M396 110 h38 l-8 22 h-22 Z" fill="#F4EFE6" />
                  <path d="M434 110 h40 l-8 22 h-24 Z" fill="#B5532D" />
                </g>
                <rect x="214" y="178" width="180" height="76" rx="8" fill="#1A1614" />
                <rect x="222" y="186" width="164" height="60" rx="5" fill="#2a221d" />
                <circle cx="270" cy="214" r="13" fill="#D8A47F" />
                <path d="M257 210 q13 -16 26 0 l-2 -12 q-11 -8 -22 0 Z" fill="#F4EFE6" />
                <rect x="256" y="227" width="28" height="19" rx="6" fill="#F4EFE6" />
                <rect x="306" y="226" width="42" height="8" rx="4" fill="#6b6259" />
                <path d="M316 222 q5 -14 11 0 q5 -10 9 0 Z" fill="#E58A3A" />
                <path d="M320 222 q4 -9 7 0 Z" fill="#F4C26B" />
                <path d="M327 200 q-6 -8 0 -15 q6 -7 0 -14" stroke="#D8A47F" strokeWidth="3.4" strokeLinecap="round" opacity=".8" />
                <path d="M341 204 q-5 -7 0 -13 q5 -6 0 -12" stroke="#D8A47F" strokeWidth="3" strokeLinecap="round" opacity=".55" />
                <rect x="206" y="254" width="196" height="10" rx="5" fill="#93421F" />
                <g transform="translate(424 178) scale(.52)">
                  <path d="M50 8 L80 82 Q50 68 20 82 Z" fill="none" stroke="#B5532D" strokeWidth="11" strokeLinejoin="round" strokeLinecap="round" />
                </g>
                <text x="450" y="238" fontFamily="Inter,Arial" fontWeight="600" fontSize="24" fill="#1A1614" textAnchor="middle">ariva<tspan fill="#B5532D">.</tspan></text>
                <text x="450" y="256" fontFamily="Inter,Arial" fontSize="9.5" letterSpacing="2.5" fill="#5C534D" textAnchor="middle">MOBILE LIVE KITCHEN</text>
                <circle cx="252" cy="316" r="34" fill="#1A1614" /><circle cx="252" cy="316" r="18" fill="#3a322c" /><circle cx="252" cy="316" r="7" fill="#B5532D" />
                <circle cx="430" cy="316" r="34" fill="#1A1614" /><circle cx="430" cy="316" r="18" fill="#3a322c" /><circle cx="430" cy="316" r="7" fill="#B5532D" />
                <rect x="496" y="270" width="58" height="9" rx="4.5" fill="#3a322c" />
              </g>
              <g>
                <rect x="548" y="226" width="64" height="56" rx="8" fill="#B5532D" />
                <rect x="556" y="186" width="46" height="48" rx="8" fill="#93421F" />
                <rect x="562" y="192" width="34" height="26" rx="5" fill="#2a221d" />
                <rect x="600" y="170" width="9" height="34" rx="4" fill="#1A1614" />
                <path d="M604 162 q-5 -7 0 -13" stroke="#D8A47F" strokeWidth="3" strokeLinecap="round" opacity=".6" />
                <circle cx="588" cy="316" r="42" fill="#1A1614" /><circle cx="588" cy="316" r="24" fill="#3a322c" /><circle cx="588" cy="316" r="9" fill="#D8A47F" />
                <circle cx="536" cy="330" r="26" fill="#1A1614" /><circle cx="536" cy="330" r="13" fill="#3a322c" /><circle cx="536" cy="330" r="5" fill="#D8A47F" />
                <circle cx="614" cy="248" r="6" fill="#F4C26B" />
              </g>
              <path d="M186 86 Q330 60 480 86" stroke="#D8A47F" strokeWidth="2" fill="none" opacity=".7" />
              <circle cx="226" cy="78" r="4" fill="#F4C26B" /><circle cx="286" cy="71" r="4" fill="#F4C26B" /><circle cx="346" cy="68" r="4" fill="#F4C26B" /><circle cx="406" cy="71" r="4" fill="#F4C26B" /><circle cx="462" cy="80" r="4" fill="#F4C26B" />
            </svg>
            <div className="hero-chip chip1"><span className="dot"></span><div><strong>Live counter open</strong>Ghee roast dosa · flame on</div></div>
            <div className="hero-chip chip2"><span className="dot"></span><div><strong>Booked: Sat, 7 PM</strong>Birthday · 30 guests · Kompally</div></div>
            <div className="hero-chip chip3"><span className="dot"></span><div><strong>Heritage recipe confirmed</strong>"Amamma's chicken pulao"</div></div>
          </div>
        </div>
      </header>

      {/* MARQUEE */}
      <div className="marquee" aria-hidden="true">
        <div className="marquee-track">
          <span>Live flames, not buffet trays</span><span>✦</span><span>Your family recipe, our live kitchen</span><span>✦</span><span>Fresh is the new luxury</span><span>✦</span><span>Hyderabad's first doorstep live-kitchen</span><span>✦</span>
          <span>Live flames, not buffet trays</span><span>✦</span><span>Your family recipe, our live kitchen</span><span>✦</span><span>Fresh is the new luxury</span><span>✦</span><span>Hyderabad's first doorstep live-kitchen</span><span>✦</span>
        </div>
      </div>

      {/* STORY */}
      <section className="story" id="story">
        <div className="wrap story-grid">
          <div className="story-visual reveal card3d">
            <svg className="story-illus" viewBox="0 0 420 130" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <ellipse cx="210" cy="118" rx="180" ry="8" fill="#15110e" />
              <rect x="160" y="78" width="100" height="12" rx="6" fill="#6b6259" />
              <path d="M178 70 q8 -22 17 0 q8 -16 14 0 q7 -12 12 0 Z" fill="#E58A3A" />
              <path d="M186 70 q6 -14 11 0 Z" fill="#F4C26B" />
              <path d="M205 48 q-7 -9 0 -17 q7 -8 0 -16" stroke="#D8A47F" strokeWidth="3.4" strokeLinecap="round" opacity=".8" />
              <path d="M224 52 q-6 -8 0 -15 q6 -7 0 -13" stroke="#D8A47F" strokeWidth="3" strokeLinecap="round" opacity=".5" />
              <circle cx="92" cy="84" r="11" fill="#D8A47F" /><rect x="80" y="95" width="24" height="22" rx="8" fill="#B5532D" />
              <circle cx="130" cy="88" r="9" fill="#D8A47F" /><rect x="120" y="97" width="20" height="20" rx="7" fill="#F4EFE6" />
              <circle cx="316" cy="86" r="10" fill="#D8A47F" /><rect x="305" y="96" width="22" height="21" rx="8" fill="#D8A47F" />
              <circle cx="352" cy="90" r="8" fill="#D8A47F" /><rect x="343" y="98" width="18" height="19" rx="7" fill="#B5532D" />
            </svg>
            <blockquote>"The best food I've ever eaten was never at a restaurant. It was at home, cooked fresh, while everyone watched and waited."
              <cite>- The idea behind ARIVA</cite>
            </blockquote>
          </div>
          <div className="story-text reveal">
            <span className="eyebrow">Our Story</span>
            <h2 className="section-title">Born at a family gathering</h2>
            <p>ARIVA began at home in Hyderabad, watching something simple: whenever food was cooked <strong>live</strong> at a family gathering, people gathered around it. The aroma, the sizzle, the theatre of it - that was the celebration.</p>
            <p>So we built a kitchen that travels. A <strong>tractor-drawn kitchen trailer</strong> - our own take on the food trailer - that parks at your gate, opens its counter, and cooks a multi-course menu live, course by course, in front of your guests.</p>
            <p>No reheated trays. No compromise on freshness. Just <strong>fire, flavour, and the people you love</strong> - gathered around the kitchen, the way it's always meant to be.</p>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="how" id="how">
        <div className="wrap">
          <span className="eyebrow">How It Works</span>
          <h2 className="section-title">Three steps to an unforgettable evening</h2>
          <p className="section-sub">From booking to the last bite, we've made it effortless.</p>
          <div className="steps">
            <div className="step reveal card3d"><span className="step-num">01</span><h3>Choose your experience</h3><p>Pick the package that fits your gathering - from an intimate dinner for 20 to a celebration for 50. Share your date and your dietary preferences.</p></div>
            <div className="step reveal card3d"><span className="step-num">02</span><h3>We craft your menu</h3><p>Our chef curates your courses from the ARIVA menu. Adding a Heritage Recipe? Share it at booking and our chef practises it before your event.</p></div>
            <div className="step reveal card3d"><span className="step-num">03</span><h3>We arrive &amp; cook live</h3><p>On event day, the ARIVA trailer arrives 30–45 minutes early to set up. Then every course is cooked fresh in front of your guests. You host. We handle the rest.</p></div>
          </div>
          <div className="how-note reveal">
            <svg width="34" height="34" viewBox="0 0 100 100" style={{ color: 'var(--sand)' }}><use href="#arivamark" /></svg>
      
            <p><strong>Punctuality promise:</strong> our team reaches your venue ahead of time and sets up quietly - your guests only ever see a kitchen that's ready, flames on, counter open.</p>
          </div>
        </div>
      </section>

      {/* MENU */}
      <section className="menu" id="menu">
        <div className="wrap">
          <span className="eyebrow">The ARIVA Menu</span>
          <h2 className="section-title">The Menu</h2>
          <p className="section-sub">Premium Mobile Live-Kitchen · Every dish cooked fresh in front of your guests. Nothing frozen, nothing reheated, nothing pretentious.</p>
          <div className="menu-legend">
            <span className="legend-item"><span className="veg-dot"></span> Vegetarian</span>
            <span className="legend-item"><span className="nonveg-dot"></span> Non-Vegetarian</span>
          </div>
          <div className="acts">
            {menuLoading ? (
              <div style={{ padding: '60px', textAlign: 'center', color: 'var(--ink-soft)' }}>Loading ARIVA Menu...</div>
            ) : (
              menuCategories.map((cat, index) => {
                const catItems = menuItems.filter(item => item.category_id === cat.id);
                const romanNumbers = ['01', '02', '03', '04', '05', '06', '07', '08', '09'];
                const roman = romanNumbers[index] || `0${index + 1}`;
                
                return (
                  <div key={cat.id} className={`act ${index === 0 ? 'open' : ''}`}>
                    <div className="act-head">
                      <h3><span className="act-roman">{roman}</span> {cat.name}</h3>
                      <span className="act-tag">{cat.subtitle}</span>
                    </div>
                    <div className="act-body">
                      <div className="menu-items-grid">
                        {catItems.map(item => (
                          <div key={item.id} className="menu-item">
                            <div className="menu-item-head">
                              <span className={item.diet_type === 'veg' ? 'veg-dot' : 'nonveg-dot'}></span>
                              <span className="menu-item-name">{item.name}</span>
                            </div>
                            <p className="menu-item-desc" dangerouslySetInnerHTML={{ __html: item.description }}></p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
          <p className="menu-note">Menus are composed per package and fully adaptable - vegetarian-only, allergy-aware, and spice-level adjustments are always available. Final menu is confirmed with you before event day.</p>
        </div>
      </section>

      {/* BYOR */}
      <section className="byor" id="byor">
        <div className="wrap byor-grid">
          <div className="reveal">
            <span className="eyebrow">Your Family Dish, Reimagined</span>
            <h2>Heritage Recipe<br /><em>Experience</em></h2>
            <p>Share a cherished family recipe and our chef will recreate it live at your gathering.</p>
            <p>Every family has one dish that means home - grandmother's pulao, an aunt's korma, a mother's halwa. We don't just cook for you. We cook <em>your</em> food. No one else in Hyderabad does this.</p>
          </div>
          <ol className="byor-steps reveal">
            <li><strong>Share the recipe at booking</strong>Written or even a voice note - at least 2 days before your event, so we can do it justice.</li>
            <li><strong>Chef consultation</strong>Our chef calls you the same day to get every detail right - ingredients, method, the little secrets.</li>
            <li><strong>Practice cook</strong>The day before your event, our chef cooks a practice round so it's perfect on the night.</li>
            <li><strong>Live at your event</strong>Your dish, cooked in front of the people it matters to.</li>
          </ol>
        </div>
      </section>

      {/* PACKAGES */}
      <section className="packages" id="packages">
        <div className="wrap">
          <div className="center">
            <span className="eyebrow">The Experiences</span>
            <h2 className="section-title">One flat price. Zero surprises.</h2>
            <p className="section-sub">Every package is all-inclusive - chef, trailer, ingredients, service and cleanup. You'll never be handed a confusing per-plate bill.</p>
          </div>
          <div className="tiers">
            <div className="tier reveal card3d">
              <div className="tier-head">
                <div>
                  <h3 className="tier-name">Intimate</h3>
                  <div className="tier-guests">UP TO 20 GUESTS</div>
                </div>
                <div className="tier-price">₹32,000</div>
              </div>
              <ul className="tier-includes">
                <li><strong>Menu Inclusions:</strong></li>
                <li>1 welcome drink - 1 hot/cold beverage</li>
                <li>1 street food - 2 starters - 2 mains - 1 dessert</li>
                <li>Live cooking at venue</li>
                <li>Branded cart</li>
                <li>Zero-cleanup guarantee</li>
              </ul>
              <div className="tier-perfect"><h5>PERFECT FOR</h5><p>A polished evening for close family or friends — cooked live, served with care.</p></div>
              <Link to="/book" className="btn btn-outline" style={{ marginTop: '24px', width: '100%' }}>ENQUIRE</Link>
            </div>
            <div className="tier featured reveal card3d">
              <span className="tier-badge">MOST LOVED</span>
              <div className="tier-head">
                <div>
                  <h3 className="tier-name">Curated</h3>
                  <div className="tier-guests">UP TO 30 GUESTS</div>
                </div>
                <div className="tier-price">₹50,000</div>
              </div>
              <ul className="tier-includes">
                <li><strong>Menu Inclusions:</strong></li>
                <li>1 welcome drink - 1 hot/cold beverage</li>
                <li>2 street foods - 3 starters - 2 mains - 2 desserts</li>
                <li>1 BYOR dish included (your family recipe, cooked live)</li>
                <li>All Intimate-tier inclusions</li>
              </ul>
              <div className="tier-perfect"><h5>PERFECT FOR</h5><p>A thoughtfully crafted experience for mid-size gatherings.</p></div>
              <Link to="/book" className="btn btn-primary" style={{ marginTop: '24px', width: '100%' }}>ENQUIRE</Link>
            </div>
            <div className="tier reveal card3d">
              <div className="tier-head">
                <div>
                  <h3 className="tier-name">Signature</h3>
                  <div className="tier-guests">UP TO 45 GUESTS</div>
                </div>
                <div className="tier-price">₹78,000</div>
              </div>
              <ul className="tier-includes">
                <li><strong>Menu Inclusions:</strong></li>
                <li>1 welcome drink - 1 hot/cold beverage</li>
                <li>3 street foods - 3 starters - 3 mains - 2 desserts</li>
                <li>2 BYOR dishes included</li>
                <li>Hyper-Personalization (named-dish custom menu cards)</li>
                <li>All lower-tier inclusions</li>
              </ul>
              <div className="tier-perfect"><h5>PERFECT FOR</h5><p>A premium full live-kitchen celebration for milestones, anniversaries, and the events that matter most.</p></div>
              <Link to="/book" className="btn btn-outline" style={{ marginTop: '24px', width: '100%' }}>ENQUIRE</Link>
            </div>
          </div>
          <div className="bespoke-bar reveal">
            <div>
              <h3>Bespoke Experiences</h3>
              <p>Every celebration is different. Whether you're planning a themed evening, a milestone celebration, a multi-day family gathering, or a completely custom dining experience, our team will create a menu and service format tailored exclusively for your event.</p>
            </div>
            <Link to="/book" className="btn btn-outline">Start a Conversation</Link>
          </div>
          <div className="addons reveal">
            <h4>Optional Add-Ons</h4>
            <div className="addon-chips">
              <span>Extra welcome drink choice · ₹1,500</span>
              <span>Extra starter choice · ₹2,500</span>
              <span>Extra main course choice · ₹3,500</span>
              <span>Premium dessert station · ₹4,500</span>
              <span>BYOR add-on (Intimate tier) · ₹4,000</span>
              <span>Hyper-Personalization cards · ₹2,000</span>
              <span>Extra hour of service · ₹4,000</span>
              <span>Distance beyond 12 km · ₹50/km</span>
              <span>Saturday peak surcharge · +10%</span>
            </div>
          </div>
        </div>
      </section>

      {/* FOUNDING TWENTY */}
      <section className="founding">
        <div className="wrap founding-inner">
          <div>
            <span className="eyebrow">Limited Launch Offer</span>
            <h2>Founding Guest <em>Privileges</em></h2>
            <p>Be among ARIVA's first 20 hosts and enjoy:</p>
            <ul className="found-list">
              <li>Special introductory pricing - ₹15,999 flat (up to 20 guests)</li>
              <li>Complimentary menu consultation</li>
              <li>Priority booking access</li>
              <li>Early access to future ARIVA experiences</li>
            </ul>
          </div>
          <Link to="/book" className="btn">Claim a Founding Spot</Link>
        </div>
      </section>

      {/* ABOUT */}
      <section className="about" id="about">
        <div className="wrap about-grid">
          <div className="about-visual reveal card3d">
            <svg className="mark" viewBox="0 0 100 100" style={{ color: 'var(--bone)' }}><use href="#arivamark" /></svg>
            <p>"Fresh food, cooked in front of you, is the most honest luxury there is."</p>
          </div>
          <div className="about-text reveal">
            <span className="eyebrow">From the Founder</span>
            <h2 className="section-title">Why ARIVA exists</h2>
            <p>ARIVA was created from a simple belief: <strong>hosts should spend time with their guests, not worry about food logistics.</strong></p>
            <p>By combining fresh live cooking with a mobile kitchen experience, ARIVA brings restaurant-quality hospitality directly to intimate gatherings and celebrations.</p>
            <p>Our mission is to make every gathering feel effortless, memorable, and truly personal.</p>
            <div className="about-sign">Joshita Varanasi</div>
            <div className="about-role">Founder, ARIVA</div>
          </div>
        </div>
      </section>

      {/* BLOG */}
      <section className="blog" id="blog">
        <div className="wrap">
          <div className="center">
            <span className="eyebrow">The ARIVA Journal</span>
            <h2 className="section-title">Stories from the live kitchen</h2>
            <p className="section-sub">Notes on food, gatherings, and building Hyderabad's first mobile live kitchen.</p>
          </div>
          <div className="blog-grid">
            <article className="blog-card reveal card3d" onClick={() => openPost('post1')} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openPost('post1') } }} tabIndex="0" role="button" aria-haspopup="dialog" aria-label="Read article: Why live cooking beats any buffet tray">
              <div className="blog-art a1">
                <svg width="120" height="100" viewBox="0 0 120 100" fill="none"><rect x="24" y="50" width="72" height="12" rx="6" fill="#6b6259" /><path d="M40 44 q8 -22 16 0 q8 -16 14 0 q6 -12 10 0 Z" fill="#E58A3A" /><path d="M48 44 q6 -14 10 0 Z" fill="#F4C26B" /><path d="M62 24 q-6 -8 0 -16" stroke="#D8A47F" strokeWidth="3.4" strokeLinecap="round" /></svg>
              </div>
              <div className="blog-body">
                <div className="blog-tagline">Why Live</div>
                <h3>Why live cooking beats any buffet tray</h3>
                <p>Food that travels in a steel container loses something on the way. Here's what changes when the flame is lit in front of you.</p>
                <span className="blog-more">Read →</span>
              </div>
            </article>
            <article className="blog-card reveal card3d" onClick={() => openPost('post2')} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openPost('post2') } }} tabIndex="0" role="button" aria-haspopup="dialog" aria-label="Read article: Why our kitchen rolls in on a tractor">
              <div className="blog-art a2">
                <svg width="140" height="100" viewBox="0 0 140 100" fill="none"><rect x="18" y="34" width="74" height="38" rx="6" fill="#F4EFE6" /><rect x="18" y="34" width="74" height="11" rx="6" fill="#1A1614" /><circle cx="38" cy="78" r="11" fill="#1A1614" /><circle cx="74" cy="78" r="11" fill="#1A1614" /><rect x="92" y="56" width="14" height="5" rx="2.5" fill="#1A1614" /><rect x="104" y="44" width="20" height="24" rx="5" fill="#93421F" /><circle cx="116" cy="76" r="12" fill="#1A1614" /><circle cx="100" cy="80" r="7" fill="#1A1614" /></svg>
              </div>
              <div className="blog-body">
                <div className="blog-tagline">Behind The Scenes</div>
                <h3>Why our kitchen rolls in on a tractor</h3>
                <p>Everyone asks about the tractor. The honest answer: it's the most practical luxury decision we made - and it makes an entrance.</p>
                <span className="blog-more">Read →</span>
              </div>
            </article>
            <article className="blog-card reveal card3d" onClick={() => openPost('post3')} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openPost('post3') } }} tabIndex="0" role="button" aria-haspopup="dialog" aria-label="Read article: The dish your grandmother never wrote down">
              <div className="blog-art a3">
                <svg width="120" height="100" viewBox="0 0 120 100" fill="none"><path d="M30 70 q30 -16 60 0 l-5 12 q-25 10 -50 0 Z" fill="#93421F" /><ellipse cx="60" cy="70" rx="30" ry="8" fill="#1A1614" opacity=".25" /><path d="M48 52 q-5 -8 0 -15" stroke="#fff" strokeWidth="3" strokeLinecap="round" opacity=".8" /><path d="M62 48 q-5 -9 0 -16" stroke="#fff" strokeWidth="3" strokeLinecap="round" opacity=".8" /><path d="M74 52 q-4 -7 0 -13" stroke="#fff" strokeWidth="3" strokeLinecap="round" opacity=".8" /></svg>
              </div>
              <div className="blog-body">
                <div className="blog-tagline">Heritage Recipes</div>
                <h3>The dish your grandmother never wrote down</h3>
                <p>Every family has one recipe that lives in someone's hands, not in a book. The Heritage Recipe Experience exists so it can be celebrated, not just remembered.</p>
                <span className="blog-more">Read →</span>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* BLOG MODAL */}
      <div className={`modal-overlay${modalPost ? ' show' : ''}`} onClick={(e) => { if (e.target === e.currentTarget) closeModal() }}>
        <div className="modal" role="dialog" aria-modal="true">
          <button className="modal-close" aria-label="Close" onClick={closeModal}>×</button>
          {modalPost && (
            <div dangerouslySetInnerHTML={{ __html: `<div class="blog-tagline">${modalPost.tag}</div><h3>${modalPost.title}</h3>${modalPost.body}` }} />
          )}
        </div>
      </div>

      {/* FAQ */}
      <section className="faq" id="faq">
        <div className="wrap">
          <div className="center">
            <span className="eyebrow">Questions</span>
            <h2 className="section-title">Frequently asked</h2>
          </div>
          <div className="faq-list">
            {faqItems.map((item, i) => (
              <div className={`faq-item${openFaq === i ? ' open' : ''}`} key={i}>
                <button className="faq-q" onClick={() => toggleFaq(i)}>{item.q}</button>
                <div className="faq-a"><p>{item.a}</p></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BOOKING */}
      <section className="booking" id="book">
        <div className="wrap">
          <span className="eyebrow">Reserve Your Date</span>
          <h2 className="section-title">Let's plan your gathering</h2>
          <p className="section-sub">Tell us about your celebration - we'll confirm availability and call you back within a few hours.</p>
          <div className="book-grid">
            <div className="book-info">
              <h3>Prefer to talk?</h3>
              <p>WhatsApp us directly - it's the fastest way to check a date.<br /><a href={`https://wa.me/${WA_NUMBER}`} target="_blank" rel="noopener noreferrer">Chat on WhatsApp →</a></p>
              <h3>Write to us</h3>
              <p><a href="mailto:hello@arivacart.com">hello@arivacart.com</a></p>
              <h3>Serving</h3>
              <p>All of Hyderabad · Free travel within 12 km of our base · ₹50/km beyond</p>
            </div>
            <div className="form-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: '40px' }}>
              <h3 style={{ marginBottom: '15px' }}>Ready to book?</h3>
              <p style={{ marginBottom: '25px' }}>Use our new interactive menu builder to select your package and curate your perfect menu.</p>
              <Link to="/book" className="btn btn-primary" style={{ width: '100%', maxWidth: '300px' }}>Build Your Menu</Link>
            </div>
          </div>
          <div className="policy-card">
            <h3>Booking Policy</h3>
            <p>A refundable booking advance of <strong style={{ color: 'var(--bone)' }}>₹2,000</strong> is required to reserve your date. This allows us to:</p>
            <ul>
              <li>Block the event slot</li>
              <li>Begin menu planning</li>
              <li>Procure fresh ingredients</li>
              <li>Allocate our kitchen and service team</li>
            </ul>
            <p>The remaining balance is payable before the event.</p>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer>
        <div className="wrap">
          <div className="foot-grid">
            <div>
              <a href="#top" className="logo" aria-label="ariva home">
                <img className="logo-img" src="/assets/logo.png" alt="ariva" />
              </a>
              <p style={{ marginTop: '14px', maxWidth: '300px' }}>Mobile live kitchen · Hyderabad · est. 2026<br />The live kitchen comes to you.</p>
            </div>
            <ul className="foot-links">
              <li><a href="#story">Our Story</a></li>
              <li><a href="#menu">The Menu</a></li>
              <li><a href="#byor">Heritage Recipe</a></li>
              <li><a href="#packages">Experiences</a></li>
              <li><a href="#blog">Journal</a></li>
              <li><a href="#faq">FAQs</a></li>
              <li><Link to="/book">Book Now</Link></li>
            </ul>
          </div>
          <div className="foot-base">
            <span>© 2026 ARIVA · arivacart.com · Hyderabad, India</span>
            <span>Made with fire &amp; love in Hyderabad</span>
          </div>
        </div>
      </footer>

      {/* FLOATING WHATSAPP */}
      <a className="wa-float" href={`https://wa.me/${WA_NUMBER}?text=Hi%20ARIVA!%20I'd%20like%20to%20know%20more%20about%20booking%20a%20live-kitchen%20experience.`} target="_blank" rel="noopener noreferrer" aria-label="Chat on WhatsApp">
        <svg viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
      </a>
    </>
  )
}
