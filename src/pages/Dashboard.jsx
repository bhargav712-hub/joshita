import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
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

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const role = profile?.role || 'customer'
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
        <nav className="dash-nav">
          <h1>ARIVA CART</h1>
          <div className="dash-nav-right">
            <span className="role-badge">Loading...</span>
          </div>
        </nav>
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
      <nav className="dash-nav">
        <h1>ARIVA CART</h1>
        <div className="dash-nav-right">
          <span className="role-badge">{userRole}</span>
          <button className="logout-btn" onClick={handleLogout}>Logout</button>
        </div>
      </nav>

      <main className="dash-main">

        {/* CUSTOMER PORTAL */}
        {userRole === 'customer' && (
          <div className="space-y-6">
            <div className="dash-card">
              <h2>Book a Cart for Your Event</h2>
              <p className="desc">Customize your menu, submit details, and track your request status below.</p>
            </div>

            <div className="dash-grid-3">
              <div className="dash-card">
                <h3>New Booking Details</h3>
                <form className="space-y-4" onSubmit={handleBookingSubmit}>
                  <div>
                    <label className="form-label">Event Date</label>
                    <input type="date" className="form-input" required value={eventDate} onChange={(e) => setEventDate(e.target.value)} />
                  </div>
                  <div>
                    <label className="form-label">Venue Pincode</label>
                    <input type="text" className="form-input" placeholder="e.g. 560001" required value={pincode} onChange={(e) => setPincode(e.target.value)} />
                  </div>
                  <div>
                    <label className="form-label">Estimated Guests</label>
                    <input type="number" className="form-input" min="10" required value={guests} onChange={(e) => setGuests(e.target.value)} />
                  </div>
                  <div>
                    <label className="form-label">Select Dishes</label>
                    <div className="menu-select-box space-y-2">
                      {dishes.map((dish) => (
                        <label className="checkbox-label" key={dish.id}>
                          <input type="checkbox" checked={selectedDishes.includes(dish.id)} onChange={() => toggleDish(dish.id)} />
                          <span>{dish.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <button type="submit" className="submit-btn">Submit Request</button>
                </form>
              </div>

              <div className="dash-card">
                <h3>Your Booking History</h3>
                <div className="space-y-4">
                  {customerBookings.length === 0 ? (
                    <p className="text-muted">No bookings requested yet.</p>
                  ) : (
                    customerBookings.map((b) => (
                      <div className="booking-item" key={b.id}>
                        <div>
                          <p className="b-title">Date: {b.event_date}</p>
                          <p className="b-meta">Pincode: {b.venue_pincode} | Guests: {b.guest_count}</p>
                        </div>
                        <span className="booking-status">{b.status.replace(/_/g, ' ')}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ADMIN PORTAL */}
        {userRole === 'admin' && (
          <div className="space-y-6">
            <div className="dash-card">
              <h2>Admin Command Center</h2>
              <p className="desc">Manage new leads, assign kitchen orders, and track execution.</p>
            </div>
            <div className="dash-grid-2">
              {adminBookings.length === 0 ? (
                <p className="text-muted">No client bookings found.</p>
              ) : (
                adminBookings.map((b) => (
                  <div className="admin-card" key={b.id}>
                    <div className="card-top">
                      <div>
                        <span className="card-id">ID: #{b.id}</span>
                        <h4>{b.event_date}</h4>
                        <p className="card-meta">Pincode: {b.venue_pincode} | Guests: {b.guest_count}</p>
                      </div>
                      <span className="card-status">{b.status.replace(/_/g, ' ')}</span>
                    </div>
                    {b.status === 'pending_admin' ? (
                      <button className="approve-btn" onClick={() => updateBookingStatus(b.id, 'pending_chef_ingredients')}>Approve &amp; Send to Chef</button>
                    ) : (
                      <span className="phase-label">Phase: {b.status.replace(/_/g, ' ')}</span>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* CHEF PORTAL */}
        {userRole === 'chef' && (
          <div className="space-y-6">
            <div className="dash-card">
              <h2>Kitchen Dashboard</h2>
              <p className="desc">Calculate and submit raw materials based on menu configurations.</p>
            </div>
            {chefBookings.length === 0 ? (
              <p className="text-muted">No bookings waiting for raw material calculations.</p>
            ) : (
              chefBookings.map((b) => (
                <div className="chef-card" key={b.id}>
                  <h4>Booking #{b.id} - Date: {b.event_date}</h4>
                  <p className="meta">Target Guests: {b.guest_count} portions</p>
                  <div className="calc-box">
                    <h5 className="calc-box-title">Calculated Requisitions Needed</h5>
                    <div className="calc-grid">
                      <div>
                        <label className="calc-label">Base Meats/Proteins (KG)</label>
                        <input type="number" className="calc-input" value={meatQtys[b.id] || ''} onChange={(e) => setMeatQtys((p) => ({ ...p, [b.id]: e.target.value }))} />
                      </div>
                      <div>
                        <label className="calc-label">Assorted Vegetables (KG)</label>
                        <input type="number" className="calc-input" value={vegQtys[b.id] || ''} onChange={(e) => setVegQtys((p) => ({ ...p, [b.id]: e.target.value }))} />
                      </div>
                    </div>
                  </div>
                  <button className="chef-submit" onClick={() => submitIngredients(b.id)}>Submit Raw Materials List</button>
                </div>
              ))
            )}
          </div>
        )}

        {/* CART OPERATIONS PORTAL */}
        {userRole === 'cart_staff' && (
          <div className="space-y-6">
            <div className="dash-card">
              <h2>Cart Operations View</h2>
              <p className="desc">Real-time checklist for on-site live cooking and resource tracking.</p>
            </div>
            {cartBookings.length === 0 ? (
              <p className="text-muted">No active cookouts currently dispatched.</p>
            ) : (
              cartBookings.map((b) => (
                <div className="cart-card" key={b.id}>
                  <div>
                    <h4>Event #{b.id} - Date: {b.event_date}</h4>
                    <p className="meta">Pincode: {b.venue_pincode} | Guests: {b.guest_count}</p>
                    <p className="status">Status: {b.status.replace(/_/g, ' ')}</p>
                  </div>
                  <div>
                    {b.status === 'pending_inventory_dispatch' && (
                      <button className="cart-btn-teal" onClick={() => dispatchCart(b.id)}>Mark Ingredients as Loaded</button>
                    )}
                    {b.status === 'dispatched_to_cart' && (
                      <button className="cart-btn-red" onClick={() => startCooking(b.id)}>Start Live Cooking (On-Site)</button>
                    )}
                    {b.status === 'live_cooking' && (
                      <button className="cart-btn-dark" onClick={() => completeEvent(b.id)}>Mark Event Completed</button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

      </main>
    </div>
  )
}
