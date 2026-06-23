import React, { useState, useEffect } from 'react'
import { supabase } from '../../supabaseClient'
import { CheckSquare, Flame, CheckCircle, Clock } from 'lucide-react'

export default function ChefPrepQueue({ currentUser }) {
  const [upcomingEvents, setUpcomingEvents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadPrepData()
  }, [])

  async function loadPrepData() {
    setLoading(true)
    const { data } = await supabase
      .from('bookings')
      .select('id, event_date, guest_count, status')
      .in('status', ['confirmed', 'advance_paid']) // Events that need prep
      .order('event_date', { ascending: true })

    if (data) setUpcomingEvents(data)
    setLoading(false)
  }

  // Hardcoded prep lists based on the dishes for demonstration
  const dummyPrepItems = [
    { dish: 'Flame Wok Chicken Noodles', prep: 'Marinate 5kg chicken thigh (soy, ginger, garlic)', station: 'Wok Station' },
    { dish: 'Flame Wok Chicken Noodles', prep: 'Chop 2kg spring onions, 1kg bok choy', station: 'Prep Station A' },
    { dish: 'Signature Teppanyaki Rice', prep: 'Cook and cool 8kg Jasmine rice (day before)', station: 'Rice Cooker' },
    { dish: 'Szechuan Pepper Paneer', prep: 'Cube 4kg Paneer, prepare Szechuan pepper dust', station: 'Prep Station B' }
  ]

  if (loading) return <p className="desc">Loading prep lists...</p>

  if (upcomingEvents.length === 0) {
    return (
      <div className="dash-card" style={{ textAlign: 'center', padding: '60px 20px' }}>
        <CheckCircle size={40} color="var(--terracotta)" style={{ marginBottom: '20px' }} />
        <h3>All Caught Up</h3>
        <p className="desc">No active prep lists required for the next 48 hours.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="dash-card" style={{ paddingBottom: '20px' }}>
        <h2>Active Prep Queue</h2>
        <p className="desc">
          Mise-en-place and station assignments for upcoming events. Check off items as you complete them in the central kitchen.
        </p>
      </div>

      {upcomingEvents.map(event => (
        <div key={event.id} className="dash-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--ink-border)', paddingBottom: '15px', marginBottom: '20px' }}>
            <div>
              <h3 style={{ margin: 0, color: 'var(--terracotta)' }}>Event: {event.event_date}</h3>
              <p style={{ margin: '5px 0 0 0', fontSize: '13px', color: '#888', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Clock size={12} /> Prep Target: 24h before dispatch • {event.guest_count} Guests
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {dummyPrepItems.map((item, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '15px', padding: '15px', background: 'rgba(26, 22, 20, 0.03)', border: '1px solid rgba(26, 22, 20, 0.08)', borderRadius: '6px' }}>
                <input type="checkbox" style={{ width: '20px', height: '20px', accentColor: 'var(--terracotta)', marginTop: '2px', cursor: 'pointer' }} />
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontWeight: 'bold', fontSize: '15px' }}>{item.prep}</p>
                  <p style={{ margin: '5px 0 0 0', fontSize: '13px', color: 'var(--ink-soft)' }}>For: {item.dish}</p>
                </div>
                <div style={{ padding: '5px 10px', background: 'rgba(181, 83, 45, 0.1)', color: 'var(--terracotta-deep)', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Flame size={12} /> {item.station}
                </div>
              </div>
            ))}
          </div>

          <button className="submit-btn" style={{ marginTop: '20px', width: '100%' }}>
            Mark Entire Event Prep as Completed
          </button>
        </div>
      ))}
    </div>
  )
}
