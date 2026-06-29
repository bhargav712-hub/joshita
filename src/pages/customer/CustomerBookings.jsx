import React, { useState, useEffect } from 'react'
import { useOutletContext, useNavigate } from 'react-router-dom'
import { supabase } from '../../supabaseClient'

export default function CustomerBookings() {
  const { currentUser } = useOutletContext()
  const navigate = useNavigate()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (currentUser) {
      loadBookings()
    }
  }, [currentUser])

  async function loadBookings() {
    setLoading(true)
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('user_id', currentUser.id)
      .order('created_at', { ascending: false })
    
    if (!error && data) {
      setBookings(data)
    }
    setLoading(false)
  }

  if (loading) return <p className="desc">Loading your events...</p>

  const upcoming = bookings.filter(b => b.status !== 'completed')
  const past = bookings.filter(b => b.status === 'completed')

  return (
    <div className="space-y-6">
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>My Events</h2>
        <button className="submit-btn" style={{ width: 'auto', marginTop: 0 }} onClick={() => navigate('/dashboard/book')}>
          + Book an Event
        </button>
      </div>

      {/* UPCOMING EVENTS */}
      <div className="dash-card">
        <h3>Upcoming Events</h3>
        <div className="space-y-4">
          {upcoming.length === 0 ? (
            <p className="desc" style={{ fontStyle: 'italic' }}>No upcoming events scheduled.</p>
          ) : (
            upcoming.map((b) => (
              <div className="booking-item" key={b.id}>
                <div>
                  <p className="b-title">Date: {b.event_date}</p>
                  <p className="b-meta">Guests: {b.guest_count} | Pincode: {b.venue_pincode}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span className="booking-status">{b.status.replace(/_/g, ' ')}</span>
                  <p className="desc" style={{ fontSize: '13px', marginTop: '4px' }}>Package: {b.package_tier || 'Custom Selection'}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* PAST EVENTS */}
      <div className="dash-card">
        <h3>Past Events</h3>
        <div className="space-y-4">
          {past.length === 0 ? (
            <p className="desc" style={{ fontStyle: 'italic' }}>No past events.</p>
          ) : (
            past.map((b) => (
              <div className="booking-item" key={b.id} style={{ opacity: 0.7 }}>
                <div>
                  <p className="b-title">Date: {b.event_date}</p>
                  <p className="b-meta">Guests: {b.guest_count} | Pincode: {b.venue_pincode}</p>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button className="submit-btn" style={{ padding: '8px 16px', background: 'var(--ink-soft)' }}>
                    Rebook
                  </button>
                  <button className="submit-btn" style={{ padding: '8px 16px' }}>
                    Memories
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  )
}
