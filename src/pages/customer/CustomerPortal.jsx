import React, { useState, useEffect } from 'react'
import { supabase } from '../../supabaseClient'
import { Calendar, BookOpen, User, Image as ImageIcon, CreditCard } from 'lucide-react'
import CustomerBookings from './CustomerBookings'
import CustomerBYOR from './CustomerBYOR'
import CustomerProfile from './CustomerProfile'
import CustomerGallery from './CustomerGallery'

export default function CustomerPortal({ currentUser }) {
  const [activeTab, setActiveTab] = useState('bookings')
  const [profile, setProfile] = useState(null)

  useEffect(() => {
    if (currentUser) {
      loadProfile()
    }
  }, [currentUser])

  async function loadProfile() {
    const { data } = await supabase.from('profiles').select('*').eq('id', currentUser.id).single()
    if (data) setProfile(data)
  }

  const renderTab = () => {
    switch (activeTab) {
      case 'bookings':
        return <CustomerBookings currentUser={currentUser} />
      case 'byor':
        return <CustomerBYOR currentUser={currentUser} />
      case 'profile':
        return <CustomerProfile currentUser={currentUser} />
      case 'gallery':
        return <CustomerGallery currentUser={currentUser} />
      case 'billing':
        return <div className="dash-card"><h2>Payment History</h2><p className="desc">Invoices coming soon...</p></div>
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      
      <div className="dash-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px 40px' }}>
        <div>
          <h2 style={{ margin: 0 }}>Customer Dashboard</h2>
          <p className="desc" style={{ margin: '5px 0 0 0' }}>Welcome back{profile?.loyalty_tier ? ` · ${profile.loyalty_tier.charAt(0).toUpperCase() + profile.loyalty_tier.slice(1)} Host` : ''}</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '32px' }}>
        <aside style={{ width: '250px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <button onClick={() => setActiveTab('bookings')} className={`sidebar-link ${activeTab === 'bookings' ? 'active' : ''}`} style={{ width: '100%', border: 'none', background: activeTab === 'bookings' ? 'var(--terracotta)' : 'transparent', color: activeTab === 'bookings' ? 'white' : 'var(--ink)' }}>
            <Calendar size={18} /> My Bookings
          </button>
          <button onClick={() => setActiveTab('byor')} className={`sidebar-link ${activeTab === 'byor' ? 'active' : ''}`} style={{ width: '100%', border: 'none', background: activeTab === 'byor' ? 'var(--terracotta)' : 'transparent', color: activeTab === 'byor' ? 'white' : 'var(--ink)' }}>
            <BookOpen size={18} /> Submit BYOR
          </button>
          <button onClick={() => setActiveTab('profile')} className={`sidebar-link ${activeTab === 'profile' ? 'active' : ''}`} style={{ width: '100%', border: 'none', background: activeTab === 'profile' ? 'var(--terracotta)' : 'transparent', color: activeTab === 'profile' ? 'white' : 'var(--ink)' }}>
            <User size={18} /> My Profile
          </button>
          <button onClick={() => setActiveTab('gallery')} className={`sidebar-link ${activeTab === 'gallery' ? 'active' : ''}`} style={{ width: '100%', border: 'none', background: activeTab === 'gallery' ? 'var(--terracotta)' : 'transparent', color: activeTab === 'gallery' ? 'white' : 'var(--ink)' }}>
            <ImageIcon size={18} /> Memory Gallery
          </button>
          <button onClick={() => setActiveTab('billing')} className={`sidebar-link ${activeTab === 'billing' ? 'active' : ''}`} style={{ width: '100%', border: 'none', background: activeTab === 'billing' ? 'var(--terracotta)' : 'transparent', color: activeTab === 'billing' ? 'white' : 'var(--ink)' }}>
            <CreditCard size={18} /> Payment History
          </button>
        </aside>
        
        <main style={{ flex: 1 }}>
          {renderTab()}
        </main>
      </div>

    </div>
  )
}
