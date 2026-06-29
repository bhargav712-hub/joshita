import React, { useState, useEffect } from 'react'
import { useOutletContext } from 'react-router-dom'
import { supabase } from '../../supabaseClient'
import { Share2, Lock } from 'lucide-react'

export default function CustomerGallery() {
  const { currentUser } = useOutletContext()
  const [events, setEvents] = useState([])
  const [memories, setMemories] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (currentUser) {
      loadGallery()
    }
  }, [currentUser])

  async function loadGallery() {
    setLoading(true)
    
    // Fetch completed bookings for this user
    const { data: bookingData } = await supabase
      .from('bookings')
      .select('id, event_date, guest_count')
      .eq('user_id', currentUser.id)
      .eq('status', 'completed')
      .order('event_date', { ascending: false })

    if (bookingData && bookingData.length > 0) {
      setEvents(bookingData)
      
      const bookingIds = bookingData.map(b => b.id)
      
      // Fetch memories for these bookings
      const { data: memoryData } = await supabase
        .from('event_memories')
        .select('*')
        .in('booking_id', bookingIds)

      if (memoryData) {
        // Group memories by booking ID
        const grouped = {}
        bookingIds.forEach(id => grouped[id] = [])
        memoryData.forEach(m => {
          if (!grouped[m.booking_id]) grouped[m.booking_id] = []
          grouped[m.booking_id].push(m)
        })
        setMemories(grouped)
      }
    }
    
    setLoading(false)
  }

  const handleShare = (eventId) => {
    // In a real app, this would generate a signed/public token link
    alert(`A private sharable link for Event #${eventId} has been copied to your clipboard! You can share this with your friends.`)
  }

  if (loading) return <p className="desc">Loading your memories...</p>

  if (events.length === 0) {
    return (
      <div className="dash-card" style={{ textAlign: 'center', padding: '60px 20px' }}>
        <h3 style={{ color: 'var(--terracotta)' }}>No Memories Yet</h3>
        <p className="desc" style={{ maxWidth: '400px', margin: '0 auto' }}>
          Once you host an ARIVA event, our staff will upload high-quality photos of the setup, live cooking, and beautiful plating right here for you to cherish and share.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="dash-card" style={{ paddingBottom: '20px' }}>
        <h2>Event Memory Gallery</h2>
        <p className="desc">
          Relive your favorite ARIVA experiences. Share these private links with your friends and family.
        </p>
      </div>

      {events.map(event => {
        const eventMemories = memories[event.id] || []
        
        return (
          <div key={event.id} className="dash-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--ink-border)', paddingBottom: '15px', marginBottom: '20px' }}>
              <div>
                <h3 style={{ margin: 0, color: 'var(--gold-primary)' }}>Event: {event.event_date}</h3>
                <p style={{ margin: '5px 0 0 0', fontSize: '13px', color: '#888' }}><Lock size={12} style={{ display: 'inline', marginRight: '5px', position: 'relative', top: '1px' }}/>Private Gallery • {eventMemories.length} Photos</p>
              </div>
              <button 
                onClick={() => handleShare(event.id)}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: 'transparent', border: '1px solid var(--terracotta)', color: 'var(--terracotta)', borderRadius: '20px', cursor: 'pointer', transition: '0.2s' }}
                onMouseOver={(e) => { e.currentTarget.style.background = 'var(--terracotta)'; e.currentTarget.style.color = 'white' }}
                onMouseOut={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--terracotta)' }}
              >
                <Share2 size={16} /> Share Link
              </button>
            </div>

            {eventMemories.length === 0 ? (
              <div style={{ background: 'var(--ink-soft)', padding: '30px', textAlign: 'center', borderRadius: '8px' }}>
                <p style={{ color: '#aaa', fontStyle: 'italic', margin: 0 }}>Processing photos for this event. Check back soon!</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '15px' }}>
                {eventMemories.map(m => (
                  <div key={m.id} style={{ borderRadius: '8px', overflow: 'hidden', position: 'relative', aspectRatio: '4/3', background: '#000' }}>
                    {/* Placeholder image rendering since we don't have real uploads yet */}
                    <img 
                      src={m.image_url || `https://source.unsplash.com/random/400x300/?food,plating,event&sig=${m.id}`} 
                      alt={m.caption || 'ARIVA Event Memory'} 
                      style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.8 }}
                    />
                    {m.caption && (
                      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(transparent, rgba(0,0,0,0.8))', padding: '20px 10px 10px 10px', color: 'white', fontSize: '12px' }}>
                        {m.caption}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
