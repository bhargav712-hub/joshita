import { useState, useEffect } from 'react'
import { supabase } from '../../supabaseClient'
import { Truck, MapPin } from 'lucide-react'

export default function Logistics() {
  const [logistics, setLogistics] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLogistics()
  }, [])

  async function fetchLogistics() {
    try {
      const { data, error } = await supabase
        .from('cart_logistics')
        .select(`
          id,
          current_gps_lat,
          current_gps_lng,
          status,
          profiles ( role )
        `)
      
      if (error) throw error
      setLogistics(data || [])
    } catch (err) {
      console.error('Error fetching logistics:', err.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div style={{ padding: '20px' }}>Loading Logistics...</div>

  return (
    <div className="space-y-6" style={{ padding: '20px' }}>
      <div className="dash-card">
        <h2>Cart Logistics Tracker</h2>
        <p className="desc" style={{ fontFamily: 'var(--sans)' }}>Track real-time GPS coordinates and active dispatch statuses for the luxury fleet.</p>
      </div>

      <div className="dash-grid-2">
        {logistics.length === 0 ? (
          <p className="text-muted">No active carts found in the logistics fleet.</p>
        ) : (
          logistics.map((cart) => (
            <div className="dash-card" key={cart.id}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '20px' }}>
                <div style={{ background: 'var(--ink)', color: 'var(--bone)', padding: '14px', borderRadius: '50%' }}>
                  <Truck size={24} />
                </div>
                <div>
                  <h3 style={{ margin: '0 0 6px 0', fontFamily: 'var(--sans)', fontSize: '18px', fontWeight: 600 }}>Cart #{cart.id.split('-')[0]}</h3>
                  <span style={{ fontSize: '11px', background: cart.status === 'en_route' ? '#dcfce7' : '#f3f4f6', color: cart.status === 'en_route' ? '#166534' : '#374151', padding: '4px 10px', borderRadius: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>
                    {cart.status || 'PARKED'}
                  </span>
                </div>
              </div>

              <div style={{ background: 'rgba(26,22,20,0.03)', padding: '16px', borderRadius: '8px', fontSize: '13px', color: 'var(--ink-soft)', fontFamily: 'var(--sans)', border: '1px solid rgba(26,22,20,0.06)' }}>
                <p><strong>Driver Role Assigned:</strong> {cart.profiles?.role || 'Unassigned'}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '12px', paddingTop: '12px', borderTop: '1px solid rgba(26,22,20,0.1)' }}>
                  <MapPin size={16} color="var(--terracotta)" />
                  <p><strong>Live GPS:</strong> {cart.current_gps_lat || '0.00'}, {cart.current_gps_lng || '0.00'}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
