import React, { useState, useEffect } from 'react'
import { supabase } from '../../supabaseClient'
import { MapPin, Users, Clock, Phone, Navigation } from 'lucide-react'

export default function StaffActiveDispatch({ currentUser }) {
  const [activeEvent, setActiveEvent] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadActiveDispatch()
  }, [])

  async function loadActiveDispatch() {
    setLoading(true)
    
    // In a real app, we'd look for an event assigned specifically to this staff member
    // For now, we pull the most immediate event that is dispatched to cart
    const { data } = await supabase
      .from('bookings')
      .select('*, profiles(full_name, phone_number)')
      .eq('status', 'dispatched_to_cart')
      .order('event_date', { ascending: true })
      .limit(1)

    if (data && data.length > 0) {
      setActiveEvent(data[0])
    }
    
    setLoading(false)
  }

  const handleStartNavigation = () => {
    alert('Opening Google Maps navigation to Pincode: ' + activeEvent.venue_pincode)
  }

  if (loading) return <p className="desc">Locating active dispatch...</p>

  if (!activeEvent) {
    return (
      <div className="dash-card" style={{ textAlign: 'center', padding: '60px 20px', marginTop: '20px' }}>
        <h3 style={{ color: 'var(--ink)' }}>Standby Mode</h3>
        <p className="desc">You have no active dispatches at this time. Grab a coffee and wait for the Kitchen to dispatch the next cart!</p>
      </div>
    )
  }

  return (
    <div className="space-y-6" style={{ marginTop: '20px' }}>
      
      <div style={{ background: 'var(--terracotta)', color: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 20px rgba(181, 83, 45, 0.3)' }}>
        <h3 style={{ margin: '0 0 10px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '10px', height: '10px', background: '#00ff88', borderRadius: '50%', boxShadow: '0 0 10px #00ff88' }}></div>
          ACTIVE DISPATCH
        </h3>
        <p style={{ margin: 0, fontSize: '24px', fontWeight: 'bold' }}>{activeEvent.event_date}</p>
        <p style={{ margin: '5px 0 0 0', opacity: 0.9 }}>{activeEvent.package_tier.toUpperCase()} TIER</p>
      </div>

      <div className="dash-card">
        <h4 style={{ margin: '0 0 15px 0', fontSize: '14px', color: 'var(--terracotta)' }}>Mission Details</h4>
        
        <div className="space-y-4">
          <div style={{ display: 'flex', gap: '15px', alignItems: 'flex-start' }}>
            <MapPin color="var(--terracotta-deep)" size={20} style={{ marginTop: '2px' }} />
            <div>
              <p style={{ margin: 0, fontWeight: 'bold' }}>Destination</p>
              <p className="desc" style={{ margin: '2px 0 0 0' }}>Zone {activeEvent.venue_pincode} (Full Address Unlocked)</p>
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '15px', alignItems: 'flex-start' }}>
            <Users color="var(--terracotta-deep)" size={20} style={{ marginTop: '2px' }} />
            <div>
              <p style={{ margin: 0, fontWeight: 'bold' }}>Host Contact</p>
              <p className="desc" style={{ margin: '2px 0 0 0' }}>{activeEvent.profiles?.full_name || 'Guest'} • {activeEvent.guest_count} Guests</p>
            </div>
          </div>
        </div>

        <button 
          onClick={handleStartNavigation}
          className="submit-btn" 
          style={{ width: '100%', marginTop: '25px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', padding: '15px' }}
        >
          <Navigation size={18} /> Start Navigation
        </button>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
        <button style={{ background: 'white', border: '1px solid var(--ink-border)', padding: '15px', borderRadius: '8px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', color: 'var(--ink)' }}>
          <Phone size={24} color="#4a90e2" />
          <span style={{ fontSize: '13px', fontWeight: 'bold' }}>Call Host</span>
        </button>
        <button style={{ background: 'white', border: '1px solid var(--ink-border)', padding: '15px', borderRadius: '8px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', color: 'var(--ink)' }}>
          <Clock size={24} color="var(--terracotta)" />
          <span style={{ fontSize: '13px', fontWeight: 'bold' }}>Log Arrival</span>
        </button>
      </div>

    </div>
  )
}
