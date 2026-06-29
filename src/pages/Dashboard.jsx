import { useState, useEffect } from 'react'
import { useNavigate, NavLink, Outlet } from 'react-router-dom'
import { LayoutDashboard, CalendarCheck, Users, UtensilsCrossed, ChefHat, Truck, Lock, BarChart3, Settings, BookOpen, User, Image as ImageIcon, CreditCard } from 'lucide-react'
import { supabase } from '../supabaseClient'
import ChefPortal from './chef/ChefPortal'
import StaffPortal from './staff/StaffPortal'
import './Dashboard.css'

const dishes = [
  { id: 1, name: 'Flame Wok Chicken Noodles' },
  { id: 2, name: 'Hand-Pulled Veggie Ramen' },
  { id: 3, name: 'Szechuan Pepper Paneer' },
  { id: 4, name: 'Signature Teppanyaki Rice' },
]

export default function Dashboard() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState(null)
  const [userRole, setUserRole] = useState('customer')

  // Customer state
  const [customerBookings, setCustomerBookings] = useState([])
  const [selectedDishes, setSelectedDishes] = useState([])
  const [eventDate, setEventDate] = useState('')
  const [pincode, setPincode] = useState('')
  const [guests, setGuests] = useState('')

  // Admin state
  const [adminBookings, setAdminBookings] = useState([])

  // Chef state
  const [chefBookings, setChefBookings] = useState([])
  const [meatQtys, setMeatQtys] = useState({})
  const [vegQtys, setVegQtys] = useState({})

  // Cart state
  const [cartBookings, setCartBookings] = useState([])

  useEffect(() => {
    initApp()
  }, [])

  async function initApp() {
    const { data: { session }, error } = await supabase.auth.getSession()
    if (error || !session) {
      navigate('/account', { replace: true })
      return
    }

    const user = session.user
    setCurrentUser(user)

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profileError) {
      console.error('Error fetching profile:', profileError)
    }

    const role = profile?.role || 'customer'
    console.log('Fetched role from DB:', profile?.role, 'Final role set:', role)
    setUserRole(role)
    setLoading(false)

    if (role === 'customer') {
      loadCustomerBookings(user.id)
    } else if (role === 'admin') {
      loadAdminBookings()
    } else if (role === 'chef') {
      loadChefBookings()
    } else if (role === 'cart_staff') {
      loadCartBookings()
    }
  }

  // CUSTOMER
  async function loadCustomerBookings(userId) {
    const { data } = await supabase
      .from('bookings')
      .select('*')
      .eq('user_id', userId || currentUser?.id)
      .order('created_at', { ascending: false })
    setCustomerBookings(data || [])
  }

  async function handleBookingSubmit(e) {
    e.preventDefault()
    if (selectedDishes.length === 0) {
      alert('Please choose at least one dish for your booking!')
      return
    }

    const { data: booking, error } = await supabase
      .from('bookings')
      .insert([{
        user_id: currentUser.id,
        event_date: eventDate,
        venue_pincode: pincode,
        guest_count: parseInt(guests),
        status: 'pending_admin',
      }])
      .select()
      .single()

    if (error) { alert('Error making booking: ' + error.message); return }

    const linkData = selectedDishes.map((id) => ({
      booking_id: booking.id,
      menu_item_id: id,
      quantity: 1,
    }))

    await supabase.from('booking_menu_items').insert(linkData)
    alert('Your booking has been requested! The Admin has been notified.')
    setEventDate('')
    setPincode('')
    setGuests('')
    setSelectedDishes([])
    loadCustomerBookings()
  }

  function toggleDish(id) {
    setSelectedDishes((prev) =>
      prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]
    )
  }

  // ADMIN
  async function loadAdminBookings() {
    const { data } = await supabase
      .from('bookings')
      .select('*')
      .order('created_at', { ascending: false })
    setAdminBookings(data || [])
  }

  async function updateBookingStatus(id, newStatus) {
    const { error } = await supabase.from('bookings').update({ status: newStatus }).eq('id', id)
    if (error) alert('Failed to update: ' + error.message)
    else loadAdminBookings()
  }

  // CHEF
  async function loadChefBookings() {
    const { data } = await supabase
      .from('bookings')
      .select('*')
      .eq('status', 'pending_chef_ingredients')
    const bookings = data || []
    setChefBookings(bookings)
    const meats = {}; const vegs = {}
    bookings.forEach((b) => {
      meats[b.id] = (b.guest_count * 0.1).toFixed(1)
      vegs[b.id] = (b.guest_count * 0.15).toFixed(1)
    })
    setMeatQtys(meats)
    setVegQtys(vegs)
  }

  async function submitIngredients(bookingId) {
    const requisitions = [
      { booking_id: bookingId, item_name: 'Base Proteins', required_qty: parseFloat(meatQtys[bookingId]), unit: 'kg' },
      { booking_id: bookingId, item_name: 'Assorted Vegetables', required_qty: parseFloat(vegQtys[bookingId]), unit: 'kg' },
    ]
    const { error: reqError } = await supabase.from('inventory_requisitions').insert(requisitions)
    if (reqError) { alert('Error sending to inventory: ' + reqError.message); return }
    const { error: statusError } = await supabase.from('bookings').update({ status: 'pending_inventory_dispatch' }).eq('id', bookingId)
    if (statusError) { alert('Error updating status: ' + statusError.message) }
    else { alert('Requisitions successfully dispatched to the inventory section!'); loadChefBookings() }
  }

  // CART
  async function loadCartBookings() {
    const { data } = await supabase
      .from('bookings')
      .select('*')
      .or('status.eq.pending_inventory_dispatch,status.eq.dispatched_to_cart,status.eq.live_cooking')
    setCartBookings(data || [])
  }

  async function dispatchCart(id) {
    await supabase.from('bookings').update({ status: 'dispatched_to_cart' }).eq('id', id)
    loadCartBookings()
  }
  async function startCooking(id) {
    await supabase.from('bookings').update({ status: 'live_cooking' }).eq('id', id)
    loadCartBookings()
  }
  async function completeEvent(id) {
    await supabase.from('bookings').update({ status: 'completed' }).eq('id', id)
    loadCartBookings()
  }

  // LOGOUT
  async function handleLogout() {
    await supabase.auth.signOut()
    navigate('/account', { replace: true })
  }

  if (loading) {
    return (
      <div className="dash-body">
        <aside className="dash-sidebar">
          <div className="logo" style={{ padding: '24px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <img className="logo-img" src="/assets/logo.png" alt="ariva" style={{ height: '32px', width: 'auto', display: 'block' }} />
          </div>
          <div className="sidebar-content"></div>
          <div className="sidebar-bottom">
            <span className="role-badge">Loading...</span>
          </div>
        </aside>
        <main className="dash-main">
          <div className="loading-spinner">
            <div className="spinner-circle"></div>
            <p className="spinner-text">Authenticating and loading dashboard...</p>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="dash-body">
      <aside className="dash-sidebar">
        <div className="logo" style={{ padding: '24px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <img className="logo-img" src="/assets/logo.png" alt="ariva" style={{ height: '32px', width: 'auto', display: 'block' }} />
        </div>
        
        <div className="sidebar-content">
          {userRole === 'admin' && (
            <>
              <NavLink to="/dashboard" end className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                <LayoutDashboard size={18} /> Overview
              </NavLink>
              <NavLink to="/dashboard/bookings" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                <CalendarCheck size={18} /> Bookings
              </NavLink>
              <NavLink to="/dashboard/customers" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                <Users size={18} /> Customers
              </NavLink>
              <NavLink to="/dashboard/menu" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                <UtensilsCrossed size={18} /> Menu Editor
              </NavLink>
              <NavLink to="/dashboard/kitchen" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                <ChefHat size={18} /> Kitchen
              </NavLink>
              <NavLink to="/dashboard/logistics" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                <Truck size={18} /> Logistics
              </NavLink>
              
              <NavLink to="/dashboard/vault" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                <Lock size={18} /> Recipe Vault
              </NavLink>
              
              <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)', margin: '15px 0' }}></div>
              
              <NavLink to="/dashboard/team" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                <Users size={18} /> Team & Roles
              </NavLink>
              
              <NavLink to="/dashboard/reports" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                <BarChart3 size={18} /> Financial Reports
              </NavLink>
              <NavLink to="/dashboard/settings" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                <Settings size={18} /> Settings
              </NavLink>
            </>
          )}
          {userRole === 'customer' && (
            <>
              <NavLink to="/dashboard" end className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                <LayoutDashboard size={18} /> Overview
              </NavLink>
              <Link to="/book" className="sidebar-link">
                <UtensilsCrossed size={18} /> Book an Event
              </Link>
              <NavLink to="/dashboard/my-bookings" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                <CalendarCheck size={18} /> My Bookings
              </NavLink>
              <NavLink to="/dashboard/submit-byor" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                <BookOpen size={18} /> Submit BYOR
              </NavLink>
              <NavLink to="/dashboard/profile" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                <User size={18} /> My Profile
              </NavLink>
              <NavLink to="/dashboard/gallery" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                <ImageIcon size={18} /> Memory Gallery
              </NavLink>
              <NavLink to="/dashboard/billing" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                <CreditCard size={18} /> Payment History
              </NavLink>
            </>
          )}
          {userRole === 'chef' && (
            <NavLink to="/dashboard" end className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <ChefHat size={18} /> Kitchen Portal
            </NavLink>
          )}
          {userRole === 'cart_staff' && (
            <NavLink to="/dashboard" end className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <Truck size={18} /> Cart Operations
            </NavLink>
          )}
        </div>

        <div className="sidebar-bottom">
          <span className="role-badge">{userRole}</span>
          <button className="logout-btn" onClick={handleLogout}>Logout</button>
        </div>
      </aside>

      <main className="dash-main">
        {userRole === 'admin' || userRole === 'customer' ? (
          <Outlet context={{ currentUser }} />
        ) : (
          <div className="portal-container">
            {/* CHEF PORTAL */}
            {userRole === 'chef' && <ChefPortal currentUser={currentUser} />}

            {/* CART OPERATIONS PORTAL */}
            {userRole === 'cart_staff' && <StaffPortal currentUser={currentUser} />}
          </div>
        )}
      </main>
    </div>
  )
}
