import { useState, useEffect } from 'react'
import { supabase } from '../../supabaseClient'
import { Star, ChevronDown, ChevronUp, Shield } from 'lucide-react'

export default function Customers() {
  const [profiles, setProfiles] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedCustomerId, setSelectedCustomerId] = useState(null)
  const [saveStatus, setSaveStatus] = useState({})
  
  // New state for Role Filter
  const [roleFilter, setRoleFilter] = useState('all')

  useEffect(() => {
    fetchCustomers()
  }, [])

  async function fetchCustomers() {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      setProfiles(data || [])
    } catch (err) {
      console.error('Error fetching profiles:', err.message)
    } finally {
      setLoading(false)
    }
  }

  async function updateDietaryNotes(id, newNotes) {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ dietary_notes: newNotes })
        .eq('id', id)
      
      if (error) throw error
      
      setSaveStatus(prev => ({ ...prev, [id]: 'Notes Saved!' }))
      setTimeout(() => {
        setSaveStatus(prev => ({ ...prev, [id]: null }))
      }, 2000)
    } catch (err) {
      console.error('Error updating notes:', err.message)
      alert('Failed to save notes.')
    }
  }

  async function updateUserRole(id, newRole) {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', id)
      
      if (error) throw error
      
      setSaveStatus(prev => ({ ...prev, [id]: 'Role Updated!' }))
      
      // Update local state
      setProfiles(prev => prev.map(p => p.id === id ? { ...p, role: newRole } : p))
      
      setTimeout(() => {
        setSaveStatus(prev => ({ ...prev, [id]: null }))
      }, 2000)
    } catch (err) {
      console.error('Error updating role:', err.message)
      alert('Failed to update role.')
    }
  }

  if (loading) return <div style={{ padding: '20px' }}>Loading Profiles...</div>

  // Filter profiles based on the selected role
  const displayedProfiles = roleFilter === 'all' 
    ? profiles 
    : profiles.filter(p => p.role === roleFilter)

  return (
    <div className="space-y-6" style={{ padding: '20px' }}>
      <div className="dash-card">
        <h2>User Management & CRM</h2>
        <p className="desc" style={{ fontFamily: 'var(--sans)' }}>
          Manage all registered profiles, assign roles (Admin/Chef/Customer), and view dietary notes.
        </p>
      </div>
      
      <div className="dash-card" style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '15px 20px' }}>
        <label style={{ fontWeight: 'bold', color: 'var(--ink)' }}>Filter by Role:</label>
        <select 
          value={roleFilter} 
          onChange={(e) => setRoleFilter(e.target.value)}
          style={{ padding: '8px 15px', borderRadius: '4px', border: '1px solid #ccc', outline: 'none' }}
        >
          <option value="all">All Profiles</option>
          <option value="customer">Customers</option>
          <option value="admin">Admins</option>
          <option value="chef">Chefs</option>
          <option value="cart_staff">Cart Staff</option>
        </select>
        <span style={{ fontSize: '13px', color: 'var(--ink-soft)', marginLeft: '10px' }}>
          Showing {displayedProfiles.length} of {profiles.length} total registered users.
        </span>
      </div>

      <div className="space-y-4">
        {displayedProfiles.length === 0 ? (
          <p style={{ color: 'var(--ink-soft)' }}>No profiles found for this filter.</p>
        ) : (
          displayedProfiles.map((p) => {
            const isExpanded = selectedCustomerId === p.id
            
            return (
              <div 
                className="dash-card" 
                key={p.id}
                style={{ 
                  cursor: isExpanded ? 'default' : 'pointer', 
                  border: isExpanded ? '2px solid var(--terracotta)' : '1px solid rgba(26, 22, 20, 0.08)',
                  padding: '20px',
                  transition: '0.2s ease-in-out'
                }}
              >
                {/* LIST ITEM SUMMARY HEADER */}
                <div 
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
                  onClick={() => setSelectedCustomerId(isExpanded ? null : p.id)}
                >
                  <div>
                    <h3 style={{ margin: '0 0 6px 0', fontFamily: 'var(--sans)', fontSize: '18px', fontWeight: 600, color: isExpanded ? 'var(--terracotta)' : 'var(--ink)' }}>
                      {p.full_name || `User: ${p.id.split('-')[0]}`}
                      {p.role !== 'customer' && (
                        <span style={{ marginLeft: '10px', fontSize: '11px', background: 'var(--ink)', color: 'white', padding: '3px 8px', borderRadius: '4px', verticalAlign: 'middle', textTransform: 'uppercase' }}>
                          <Shield size={10} style={{ display: 'inline', marginRight: '3px', marginBottom: '2px' }} />
                          {p.role}
                        </span>
                      )}
                    </h3>
                    <p style={{ margin: 0, fontSize: '13px', color: 'var(--ink-soft)', fontFamily: 'var(--sans)' }}>
                      {p.email || 'No Email Provided'}
                    </p>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    {p.is_repeat_customer && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#fef3c7', color: '#b45309', padding: '6px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 700, fontFamily: 'var(--sans)', border: '1px solid #fcd34d' }}>
                        <Star size={14} fill="currentColor" /> VIP REPEAT
                      </div>
                    )}
                    <div style={{ color: 'var(--ink-soft)' }}>
                      {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </div>
                  </div>
                </div>

                {/* EXPANDED PROFILE DETAILS */}
                {isExpanded && (
                  <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid rgba(26,22,20,0.1)', animation: 'fadeIn 0.3s' }}>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                      <div style={{ background: 'rgba(26,22,20,0.02)', padding: '15px', borderRadius: '8px' }}>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', marginBottom: '8px', color: 'var(--ink-soft)' }}>System Role</label>
                        <select 
                          value={p.role || 'customer'} 
                          onChange={(e) => updateUserRole(p.id, e.target.value)}
                          style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                        >
                          <option value="customer">Customer</option>
                          <option value="admin">Admin</option>
                          <option value="chef">Chef</option>
                          <option value="cart_staff">Cart Staff</option>
                        </select>
                      </div>
                      
                      <div style={{ background: 'rgba(26,22,20,0.02)', padding: '15px', borderRadius: '8px' }}>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', marginBottom: '8px', color: 'var(--ink-soft)' }}>Customer Tier</label>
                        <p style={{ margin: 0, fontWeight: 'bold' }}>{p.loyalty_tier ? p.loyalty_tier.toUpperCase() : 'BRONZE'}</p>
                      </div>
                      
                      <div style={{ background: 'rgba(26,22,20,0.02)', padding: '15px', borderRadius: '8px' }}>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', marginBottom: '8px', color: 'var(--ink-soft)' }}>Contact Number</label>
                        <p style={{ margin: 0, fontWeight: 'bold' }}>{p.phone_number || 'Not provided'}</p>
                      </div>
                    </div>

                    <div style={{ background: 'rgba(181, 83, 45, 0.05)', padding: '20px', borderRadius: '8px', border: '1px solid rgba(181, 83, 45, 0.2)' }}>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '10px', color: 'var(--terracotta-deep)', fontFamily: 'var(--sans)' }}>
                        Admin CRM Notes (Allergies & Dietary)
                      </label>
                      <textarea 
                        style={{ minHeight: '80px', resize: 'vertical', width: '100%', marginBottom: '8px', fontSize: '13px', padding: '12px', background: 'white', border: '1px solid #ccc', borderRadius: '4px' }}
                        defaultValue={p.dietary_notes || ''}
                        onBlur={(e) => updateDietaryNotes(p.id, e.target.value)}
                        placeholder="e.g. Severe peanut allergy, strict vegetarian, highly allergic to shellfish..."
                      ></textarea>
                      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <span style={{ fontSize: '10px', background: saveStatus[p.id] ? 'green' : 'var(--ink-soft)', color: 'white', padding: '4px 8px', borderRadius: '4px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                          {saveStatus[p.id] || 'Click outside to save notes'}
                        </span>
                      </div>
                    </div>

                  </div>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
