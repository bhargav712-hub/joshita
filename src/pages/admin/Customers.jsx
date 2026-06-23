import { useState, useEffect } from 'react'
import { supabase } from '../../supabaseClient'
import { Star, ChevronDown, ChevronUp } from 'lucide-react'

export default function Customers() {
  const [profiles, setProfiles] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedCustomerId, setSelectedCustomerId] = useState(null)
  const [saveStatus, setSaveStatus] = useState({})

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
      console.error('Error fetching customers:', err.message)
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
      
      setSaveStatus(prev => ({ ...prev, [id]: 'Saved!' }))
      setTimeout(() => {
        setSaveStatus(prev => ({ ...prev, [id]: null }))
      }, 2000)
    } catch (err) {
      console.error('Error updating notes:', err.message)
      alert('Failed to save notes.')
    }
  }

  if (loading) return <div style={{ padding: '20px' }}>Loading CRM...</div>

  // Filter out anyone who is not a 'customer'
  const customersList = profiles.filter(p => p.role === 'customer')

  return (
    <div className="space-y-6" style={{ padding: '20px' }}>
      <div className="dash-card">
        <h2>Customer CRM</h2>
        <p className="desc" style={{ fontFamily: 'var(--sans)' }}>Manage client profiles, repeat statuses, and strict dietary notes.</p>
      </div>

      <div className="space-y-4">
        {customersList.length === 0 ? (
          <p className="text-muted">No customers registered yet.</p>
        ) : (
          customersList.map((p) => {
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
                      {p.full_name || `Customer: ${p.id.split('-')[0]}`}
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
                  <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid var(--ink-border)', animation: 'fadeIn 0.3s' }}>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                      <div style={{ background: 'rgba(26,22,20,0.02)', padding: '15px', borderRadius: '8px' }}>
                        <label className="form-label" style={{ marginBottom: '5px' }}>Customer Tier</label>
                        <p style={{ margin: 0, fontWeight: 'bold' }}>{p.loyalty_tier ? p.loyalty_tier.toUpperCase() : 'BRONZE'}</p>
                      </div>
                      <div style={{ background: 'rgba(26,22,20,0.02)', padding: '15px', borderRadius: '8px' }}>
                        <label className="form-label" style={{ marginBottom: '5px' }}>Contact Number</label>
                        <p style={{ margin: 0, fontWeight: 'bold' }}>{p.phone_number || 'Not provided'}</p>
                      </div>
                    </div>

                    <div style={{ background: 'rgba(181, 83, 45, 0.05)', padding: '20px', borderRadius: '8px', border: '1px solid rgba(181, 83, 45, 0.2)' }}>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '10px', color: 'var(--terracotta-deep)', fontFamily: 'var(--sans)' }}>
                        Admin CRM Notes (Allergies & Dietary)
                      </label>
                      <textarea 
                        className="form-input" 
                        style={{ minHeight: '80px', resize: 'vertical', width: '100%', marginBottom: '8px', fontSize: '13px', padding: '12px', background: 'white' }}
                        defaultValue={p.dietary_notes || ''}
                        onBlur={(e) => updateDietaryNotes(p.id, e.target.value)}
                        placeholder="e.g. Severe peanut allergy, strict vegetarian, highly allergic to shellfish..."
                      ></textarea>
                      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <span style={{ fontSize: '10px', background: saveStatus[p.id] ? 'green' : 'var(--ink-soft)', color: 'white', padding: '4px 8px', borderRadius: '4px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                          {saveStatus[p.id] || 'Click outside to save'}
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
