import React, { useState, useEffect } from 'react'
import { supabase } from '../../supabaseClient'
import { Camera, Upload, CheckCircle } from 'lucide-react'

export default function StaffCamera() {
  const [activeEvent, setActiveEvent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [photoCount, setPhotoCount] = useState(0)

  useEffect(() => {
    loadActiveDispatch()
  }, [])

  async function loadActiveDispatch() {
    setLoading(true)
    const { data } = await supabase
      .from('bookings')
      .select('id, event_date')
      .in('status', ['dispatched_to_cart', 'live_cooking'])
      .order('event_date', { ascending: true })
      .limit(1)

    if (data && data.length > 0) {
      setActiveEvent(data[0])
      
      // Check how many photos already exist
      const { count } = await supabase
        .from('event_memories')
        .select('*', { count: 'exact', head: true })
        .eq('booking_id', data[0].id)
        
      if (count) setPhotoCount(count)
    }
    setLoading(false)
  }

  const simulateUpload = async () => {
    setUploading(true)
    
    // Simulate camera delay and network upload
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // In a real app, this would use Supabase Storage to upload an actual file.
    // Here we just insert a new memory record with a random Unsplash food/event image.
    const randomSeed = Math.floor(Math.random() * 1000)
    const mockImageUrl = `https://source.unsplash.com/random/800x600/?culinary,event&sig=${randomSeed}`
    
    const { error } = await supabase
      .from('event_memories')
      .insert([
        { 
          booking_id: activeEvent.id, 
          image_url: mockImageUrl, 
          caption: 'Live Event Capture' 
        }
      ])
      
    setUploading(false)
    
    if (error) {
      alert('Upload failed: ' + error.message)
    } else {
      setPhotoCount(prev => prev + 1)
      alert('Photo uploaded successfully to the Customer Gallery!')
    }
  }

  if (loading) return <p className="desc">Checking active events...</p>

  if (!activeEvent) {
    return (
      <div className="dash-card" style={{ textAlign: 'center', padding: '60px 20px', marginTop: '20px' }}>
        <h3 style={{ color: 'var(--ink)' }}>No Active Event</h3>
        <p className="desc">You must be actively dispatched to an event to upload photos.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6" style={{ marginTop: '20px' }}>
      <div className="dash-card" style={{ textAlign: 'center', padding: '30px 20px' }}>
        <Camera size={48} color="var(--terracotta)" style={{ margin: '0 auto 15px' }} />
        <h2>Event Gallery Capture</h2>
        <p className="desc">
          Take 5-10 high quality photos of the setup, live wok action, and final plating. These will instantly appear in the Customer's Memory Gallery.
        </p>
        
        <div style={{ margin: '30px 0', padding: '20px', background: 'rgba(26,22,20,0.03)', borderRadius: '8px' }}>
          <p style={{ margin: '0 0 10px 0', fontSize: '18px', fontWeight: 'bold' }}>Active Target: Event {activeEvent.event_date}</p>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '24px', fontWeight: 'bold', color: photoCount >= 5 ? '#00cc66' : 'var(--terracotta)' }}>{photoCount}</span>
            <span className="desc">/ 5 Minimum Photos Uploaded</span>
          </div>
        </div>

        <button 
          onClick={simulateUpload}
          disabled={uploading}
          className="submit-btn" 
          style={{ width: '100%', height: '60px', fontSize: '16px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' }}
        >
          {uploading ? (
            'Uploading to server...'
          ) : (
            <><Upload size={20} /> Open Camera & Upload</>
          )}
        </button>

        {photoCount >= 5 && (
          <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', color: '#00cc66', fontWeight: 'bold' }}>
            <CheckCircle size={18} /> Minimum target reached! Great job.
          </div>
        )}
      </div>
    </div>
  )
}
