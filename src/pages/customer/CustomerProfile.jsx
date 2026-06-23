import React, { useState, useEffect } from 'react'
import { supabase } from '../../supabaseClient'

export default function CustomerProfile({ currentUser }) {
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  
  // Profile state
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [addressArea, setAddressArea] = useState('')
  const [dietary, setDietary] = useState('')
  const [allergies, setAllergies] = useState('')
  const [familyPrefs, setFamilyPrefs] = useState('')
  const [specialPrefs, setSpecialPrefs] = useState('')
  const [loyaltyTier, setLoyaltyTier] = useState('bronze')

  useEffect(() => {
    if (currentUser) {
      loadProfile()
    }
  }, [currentUser])

  async function loadProfile() {
    setLoading(true)
    const { data } = await supabase.from('profiles').select('*').eq('id', currentUser.id).single()
    if (data) {
      setFullName(data.full_name || '')
      setPhone(data.phone || '')
      setAddressArea(data.address_area || '')
      setDietary(data.dietary_preferences || '')
      setAllergies(data.allergies || '')
      setFamilyPrefs(data.family_preferences || '')
      setSpecialPrefs(data.special_preferences || '')
      setLoyaltyTier(data.loyalty_tier || 'bronze')
    }
    setLoading(false)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    
    const { error } = await supabase.from('profiles').update({
      full_name: fullName,
      phone: phone,
      address_area: addressArea,
      dietary_preferences: dietary,
      allergies: allergies,
      family_preferences: familyPrefs,
      special_preferences: specialPrefs
    }).eq('id', currentUser.id)

    setSaving(false)

    if (error) {
      alert('Error updating profile: ' + error.message)
    } else {
      alert('Profile updated successfully!')
    }
  }

  if (loading) return <p className="desc">Loading profile...</p>

  return (
    <div className="space-y-6">
      
      {/* LOYALTY CARD */}
      <div className="dash-card" style={{ background: 'linear-gradient(135deg, var(--ink), var(--ink-soft))', borderLeft: '4px solid var(--terracotta)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ margin: 0, color: 'var(--bone)', fontSize: '20px' }}>Loyalty Status</h3>
            <p style={{ color: 'var(--sand)', margin: '5px 0 0 0', fontSize: '14px' }}>
              You are currently a <strong style={{ textTransform: 'uppercase' }}>{loyaltyTier}</strong> tier host.
            </p>
          </div>
          <div style={{ padding: '15px 25px', background: 'rgba(216, 164, 127, 0.1)', borderRadius: '8px', textAlign: 'center' }}>
            <span style={{ display: 'block', fontSize: '24px', fontWeight: 'bold', color: 'var(--terracotta)' }}>{loyaltyTier === 'bronze' ? '0%' : loyaltyTier === 'silver' ? '5%' : '10%'}</span>
            <span style={{ fontSize: '11px', color: 'var(--sand)', textTransform: 'uppercase', letterSpacing: '1px' }}>Discount</span>
          </div>
        </div>
        <p style={{ margin: '15px 0 0 0', fontSize: '13px', color: '#aaa' }}>
          Host 3 more events to reach the next tier and unlock exclusive chef privileges!
        </p>
      </div>

      {/* PROFILE FORM */}
      <div className="dash-card">
        <h3>My Profile & Preferences</h3>
        <p className="desc" style={{ marginBottom: '20px' }}>
          Your exact preferences dictate how our chefs prepare your food. We take these notes very seriously.
        </p>

        <form className="space-y-4" onSubmit={handleSave}>
          <div className="dash-grid-2">
            <div>
              <label className="form-label">Full Name</label>
              <input type="text" className="form-input" value={fullName} onChange={(e) => setFullName(e.target.value)} />
            </div>
            <div>
              <label className="form-label">Phone Number</label>
              <input type="tel" className="form-input" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
          </div>

          <div>
            <label className="form-label">Primary Address Area (Hyderabad)</label>
            <input type="text" className="form-input" placeholder="e.g. Jubilee Hills, Banjara Hills" value={addressArea} onChange={(e) => setAddressArea(e.target.value)} />
          </div>

          <hr style={{ border: 0, borderTop: '1px solid var(--ink-border)', margin: '30px 0' }} />
          <h4 style={{ color: 'var(--ink)' }}>Hyper-Personalization Data</h4>

          <div className="dash-grid-2">
            <div>
              <label className="form-label">Your Dietary Preferences</label>
              <input type="text" className="form-input" placeholder="e.g. Vegetarian, Jain, Keto" value={dietary} onChange={(e) => setDietary(e.target.value)} />
            </div>
            <div>
              <label className="form-label">Allergies (You & Frequent Guests)</label>
              <input type="text" className="form-input" placeholder="e.g. Peanuts, Shellfish" value={allergies} onChange={(e) => setAllergies(e.target.value)} />
            </div>
          </div>

          <div>
            <label className="form-label">Family Member Quirks</label>
            <textarea className="form-input" rows="2" placeholder="e.g. Father is diabetic, Daughter prefers Jain food on Sundays" value={familyPrefs} onChange={(e) => setFamilyPrefs(e.target.value)}></textarea>
          </div>

          <div>
            <label className="form-label">Special Delivery / Service Preferences</label>
            <textarea className="form-input" rows="2" placeholder="e.g. Always serve sulemani chai instead of coffee" value={specialPrefs} onChange={(e) => setSpecialPrefs(e.target.value)}></textarea>
          </div>

          <button type="submit" className="submit-btn" disabled={saving}>
            {saving ? 'Saving...' : 'Save Preferences'}
          </button>
        </form>
      </div>

    </div>
  )
}
