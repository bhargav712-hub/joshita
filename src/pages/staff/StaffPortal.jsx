import React, { useState, useEffect } from 'react'
import { supabase } from '../../supabaseClient'
import { Truck, Map, CheckSquare, Camera, AlertTriangle, Clock } from 'lucide-react'
import StaffActiveDispatch from './StaffActiveDispatch'
import StaffChecklists from './StaffChecklists'
import StaffCamera from './StaffCamera'
import StaffIssues from './StaffIssues'

export default function StaffPortal({ currentUser }) {
  const [activeTab, setActiveTab] = useState('dispatch')
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
      case 'dispatch': return <StaffActiveDispatch currentUser={currentUser} />
      case 'checklists': return <StaffChecklists currentUser={currentUser} />
      case 'camera': return <StaffCamera currentUser={currentUser} />
      case 'issues': return <StaffIssues currentUser={currentUser} />
      default: return null
    }
  }

  // Mobile-first styling overrides
  const mobileNavStyle = {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    background: 'var(--ink)',
    display: 'flex',
    justifyContent: 'space-around',
    padding: '12px 0',
    borderTop: '1px solid rgba(255,255,255,0.1)',
    zIndex: 1000
  }

  const navButtonStyle = (tabId) => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px',
    background: 'transparent',
    border: 'none',
    color: activeTab === tabId ? 'var(--terracotta)' : 'var(--ink-soft)',
    fontSize: '11px',
    fontWeight: activeTab === tabId ? 'bold' : 'normal',
    textTransform: 'uppercase',
    letterSpacing: '1px'
  })

  return (
    <div style={{ paddingBottom: '80px' }}> {/* Padding for mobile nav bar */}
      
      <div className="dash-card" style={{ padding: '20px', marginBottom: '20px', borderRadius: '0 0 12px 12px' }}>
        <h2 style={{ margin: 0, fontSize: '24px' }}>Cart Staff Portal</h2>
        <p className="desc" style={{ margin: '5px 0 0 0', fontSize: '13px' }}>Welcome, {profile?.full_name || 'Staff'}</p>
      </div>

      <main style={{ padding: '0 15px' }}>
        {renderTab()}
      </main>

      {/* MOBILE BOTTOM NAVIGATION */}
      <nav style={mobileNavStyle}>
        <button onClick={() => setActiveTab('dispatch')} style={navButtonStyle('dispatch')}>
          <Map size={20} /> Dispatch
        </button>
        <button onClick={() => setActiveTab('checklists')} style={navButtonStyle('checklists')}>
          <CheckSquare size={20} /> Checklists
        </button>
        <button onClick={() => setActiveTab('camera')} style={navButtonStyle('camera')}>
          <Camera size={20} /> Photos
        </button>
        <button onClick={() => setActiveTab('issues')} style={navButtonStyle('issues')}>
          <AlertTriangle size={20} /> Issues
        </button>
      </nav>

    </div>
  )
}
