import React, { useState, useEffect } from 'react'
import { supabase } from '../../supabaseClient'
import { Shield, ShieldAlert, User, ChefHat, Truck } from 'lucide-react'

export default function Team() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadUsers()
  }, [])

  async function loadUsers() {
    setLoading(true)
    const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false })
    if (data) setUsers(data)
    setLoading(false)
  }

  async function updateRole(userId, newRole) {
    const { error } = await supabase.from('profiles').update({ role: newRole }).eq('id', userId)
    if (error) {
      alert('Failed to update role: ' + error.message)
    } else {
      loadUsers()
      alert('Role updated successfully!')
    }
  }

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin': return <Shield size={16} style={{ color: 'red' }} />
      case 'chef': return <ChefHat size={16} style={{ color: 'var(--terracotta)' }} />
      case 'cart_staff': return <Truck size={16} style={{ color: '#4a90e2' }} />
      default: return <User size={16} style={{ color: '#aaa' }} />
    }
  }

  if (loading) return <p className="desc">Loading users...</p>

  return (
    <div className="space-y-6">
      <div className="dash-card">
        <h2>Team & Access Management</h2>
        <p className="desc">Manage roles for all registered accounts. Anyone who signs up is a "Customer" by default.</p>
        
        <div style={{ marginTop: '30px' }} className="space-y-4">
          {users.filter(u => u.role !== 'admin').map(user => (
            <div key={user.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', background: 'rgba(26, 22, 20, 0.03)', border: '1px solid rgba(26, 22, 20, 0.08)', borderRadius: '6px' }}>
              <div>
                <h4 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {getRoleIcon(user.role)} {user.full_name || 'Unnamed User'}
                </h4>
                <p className="desc" style={{ margin: '5px 0 0 0', fontSize: '13px' }}>{user.id} • {user.email || 'No email stored in profile'}</p>
              </div>
              
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <span className="desc" style={{ fontSize: '13px' }}>Role:</span>
                <select 
                  className="form-select" 
                  value={user.role} 
                  onChange={(e) => updateRole(user.id, e.target.value)}
                  style={{ width: '150px', padding: '8px 12px' }}
                >
                  <option value="customer">Customer</option>
                  <option value="chef">Chef</option>
                  <option value="cart_staff">Cart Staff</option>
                </select>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}
