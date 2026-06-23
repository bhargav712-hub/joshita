import React, { useState, useEffect } from 'react'
import { supabase } from '../../supabaseClient'
import { MapPin, Users, Calendar, AlertCircle } from 'lucide-react'

export default function ChefMyEvents({ currentUser }) {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadEvents()
  }, [])

  async function loadEvents() {
    setLoading(true)
    // Fetch bookings that are approved and need a chef
    const { data } = await supabase
      .from('bookings')
      .select('*, profiles(allergies, dietary_preferences, family_preferences, special_preferences)')
      .in('status', ['confirmed', 'advance_paid', 'live_cooking'])
      .order('event_date', { ascending: true })

    if (data) setEvents(data)
    setLoading(false)
  }

  const getTierColor = (tier) => {
    switch(tier) {
      case 'signature': return 'var(--gold-primary)' // Highest tier
      case 'curated': return '#4a90e2'
      case 'intimate': return '#50c878'
      default: return 'var(--terracotta)'
    }
  }

  if (loading) return <p className="desc">Loading assigned events...</p>

  if (events.length === 0) {
    return (
      <div className="dash-card" style={{ textAlign: 'center', padding: '60px 20px' }}>
        <h3 style={{ color: 'var(--ink)' }}>No Upcoming Events</h3>
        <p className="desc">You have no scheduled events at this time.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="dash-card" style={{ paddingBottom: '20px' }}>
        <h2>My Assigned Events</h2>
        <p className="desc">
          Review your upcoming service schedule, dietary restrictions, and menu locked for each event.
        </p>
      </div>

      <div className="dash-grid-2">
        {events.map(event => (
          <div key={event.id} className="dash-card" style={{ position: 'relative', overflow: 'hidden' }}>
            {/* Color coded tier strip */}
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '6px', background: getTierColor(event.package_tier) }}></div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: '10px' }}>
              <div>
                <h3 style={{ margin: 0 }}>{event.event_date}</h3>
                <span style={{ 
                  display: 'inline-block', padding: '3px 8px', borderRadius: '4px', fontSize: '11px', 
                  fontWeight: 'bold', background: 'rgba(26, 22, 20, 0.05)', color: 'var(--ink)', 
                  textTransform: 'uppercase', marginTop: '5px' 
                }}>
                  {event.status.replace(/_/g, ' ')}
                </span>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ display: 'block', fontSize: '12px', color: getTierColor(event.package_tier), fontWeight: 'bold', textTransform: 'uppercase' }}>
                  {event.package_tier || 'Custom'} Tier
                </span>
              </div>
            </div>

            <div className="space-y-2" style={{ marginTop: '20px' }}>
              <p className="desc" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Users size={16} /> {event.guest_count} Guests
              </p>
              <p className="desc" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MapPin size={16} /> Pincode: {event.venue_pincode} 
                <span style={{ fontSize: '11px', color: '#aaa', fontStyle: 'italic' }}>(Full address unlocks 24h prior)</span>
              </p>
            </div>

            {event.profiles && (
              <div style={{ marginTop: '20px', padding: '15px', background: 'rgba(181, 83, 45, 0.05)', borderRadius: '6px', border: '1px solid rgba(181, 83, 45, 0.2)' }}>
                <p style={{ margin: '0 0 10px 0', fontSize: '13px', fontWeight: 'bold', color: 'var(--terracotta)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <AlertCircle size={14} /> Dietary Alerts
                </p>
                <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', color: 'var(--ink-soft)' }}>
                  {event.profiles.allergies && <li><strong>Allergies:</strong> {event.profiles.allergies}</li>}
                  {event.profiles.dietary_preferences && <li><strong>Diet:</strong> {event.profiles.dietary_preferences}</li>}
                  {event.profiles.special_preferences && <li><strong>Notes:</strong> {event.profiles.special_preferences}</li>}
                  {(!event.profiles.allergies && !event.profiles.dietary_preferences) && <li>No specific dietary alerts recorded.</li>}
                </ul>
              </div>
            )}

            <button className="submit-btn" style={{ marginTop: '20px', width: '100%', background: 'var(--ink)' }}>
              View Event Brief & Menu
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
