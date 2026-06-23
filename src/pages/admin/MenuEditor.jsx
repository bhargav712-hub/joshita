import { useState, useEffect } from 'react'
import { supabase } from '../../supabaseClient'

export default function MenuEditor() {
  const [menuItems, setMenuItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMenu()
  }, [])

  async function fetchMenu() {
    try {
      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      setMenuItems(data || [])
    } catch (err) {
      console.error('Error fetching menu:', err.message)
    } finally {
      setLoading(false)
    }
  }

  async function toggleActive(id, currentStatus) {
    try {
      const { error } = await supabase
        .from('menu_items')
        .update({ is_active: !currentStatus })
        .eq('id', id)
      
      if (error) throw error
      
      // Optimistic update for snappy UI
      setMenuItems(menuItems.map(item => 
        item.id === id ? { ...item, is_active: !currentStatus } : item
      ))
    } catch (err) {
      console.error('Error toggling menu item:', err.message)
    }
  }

  if (loading) return <div style={{ padding: '20px' }}>Loading menu...</div>

  return (
    <div className="space-y-6" style={{ padding: '20px' }}>
      <div className="dash-card">
        <h2>Menu Editor</h2>
        <p className="desc" style={{ fontFamily: 'var(--sans)' }}>Manage live dishes, dynamic pricing, and cart availability.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
        {menuItems.length === 0 ? (
          <p className="text-muted" style={{ gridColumn: '1 / -1' }}>No menu items found. Please add records to the database.</p>
        ) : (
          menuItems.map((item) => (
            <div className="dash-card" key={item.id} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', opacity: item.is_active ? 1 : 0.6 }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontFamily: 'var(--sans)' }}>{item.name}</h3>
                  <span style={{ fontWeight: 600, color: 'var(--terracotta)', fontSize: '16px' }}>₹{item.price}</span>
                </div>
                <p style={{ fontSize: '13px', color: 'var(--ink-soft)', marginBottom: '16px', fontFamily: 'var(--sans)', lineHeight: 1.5 }}>
                  {item.description || 'No description provided.'}
                </p>
                
                {item.tags && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '16px' }}>
                    {item.tags.map(tag => (
                       <span key={tag} style={{ padding: '4px 10px', background: '#e0d8cc', borderRadius: '12px', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600, color: 'var(--ink)' }}>{tag}</span>
                    ))}
                  </div>
                )}
              </div>
              
              <div style={{ borderTop: '1px solid rgba(26,22,20,0.1)', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: item.is_active ? '#2b7a0b' : '#b5532d', fontFamily: 'var(--sans)' }}>
                  {item.is_active ? '● AVAILABLE' : '○ OFF MENU'}
                </span>
                <button 
                  onClick={() => toggleActive(item.id, item.is_active)}
                  style={{ padding: '8px 14px', background: item.is_active ? 'var(--ink-soft)' : 'var(--terracotta)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontFamily: 'var(--sans)', fontWeight: 500 }}
                >
                  {item.is_active ? 'Disable Item' : 'Enable Item'}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
