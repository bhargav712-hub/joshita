import { useState, useEffect } from 'react'
import { supabase } from '../../supabaseClient'

export default function Bookings() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchBookings()
  }, [])

  async function fetchBookings() {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      setBookings(data || [])
    } catch (err) {
      console.error('Error fetching bookings:', err.message)
    } finally {
      setLoading(false)
    }
  }

  async function updateInvoiceStatus(id, newStatus) {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ invoice_status: newStatus })
        .eq('id', id)
      
      if (error) throw error
      fetchBookings() // refresh the board
    } catch (err) {
      console.error('Error updating invoice:', err.message)
    }
  }

  if (loading) return <div style={{ padding: '20px' }}>Loading bookings...</div>

  return (
    <div className="space-y-6" style={{ padding: '20px' }}>
      <div className="dash-card">
        <h2>Bookings & Inquiries</h2>
        <p className="desc" style={{ fontFamily: 'var(--sans)' }}>Manage incoming event requests, package tiers, and track invoice statuses.</p>
      </div>

      <div className="dash-grid-2">
        {bookings.length === 0 ? (
          <p className="text-muted">No bookings found.</p>
        ) : (
          bookings.map((b) => (
            <div className="admin-card" key={b.id}>
              <div className="card-top">
                <div>
                  <span className="card-id">ID: #{b.id.toString().substring(0,6)}</span>
                  <h4 style={{ fontFamily: 'var(--sans)', fontSize: '18px', fontWeight: 600 }}>Event: {b.event_date}</h4>
                  <p className="card-meta">Pincode: {b.venue_pincode} | Guests: {b.guest_count}</p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                  <span className="card-status">{b.status.replace(/_/g, ' ')}</span>
                  {b.byor_flag && <span style={{ background: '#e0d8cc', padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600 }}>BYOR 👨‍🍳</span>}
                </div>
              </div>
              
              <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid rgba(26,22,20,0.1)' }}>
                <p style={{ fontSize: '12px', fontWeight: 600, color: 'var(--ink-soft)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px', fontFamily: 'var(--sans)' }}>
                  Invoice Status: <span style={{ color: b.invoice_status === 'paid' ? 'green' : 'var(--terracotta)' }}>{b.invoice_status || 'pending'}</span>
                </p>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => updateInvoiceStatus(b.id, 'paid')} style={{ padding: '8px 14px', background: 'var(--terracotta)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontFamily: 'var(--sans)', fontWeight: 500 }}>Mark Paid</button>
                  <button onClick={() => updateInvoiceStatus(b.id, 'overdue')} style={{ padding: '8px 14px', background: 'transparent', color: 'red', border: '1px solid red', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontFamily: 'var(--sans)', fontWeight: 500 }}>Mark Overdue</button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
