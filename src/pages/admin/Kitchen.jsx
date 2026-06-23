import { useState, useEffect } from 'react'
import { supabase } from '../../supabaseClient'

export default function Kitchen() {
  const [inventory, setInventory] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchInventory()
  }, [])

  async function fetchInventory() {
    try {
      const { data, error } = await supabase
        .from('inventory')
        .select('*')
        .order('item_name')
      
      if (error) throw error
      setInventory(data || [])
    } catch (err) {
      console.error('Error fetching inventory:', err.message)
    } finally {
      setLoading(false)
    }
  }

  async function triggerOrderWebhook(item) {
    try {
      // Mock webhook URL for automation tools like Make/n8n
      const webhookUrl = 'https://hook.eu1.make.com/mock-ariva-webhook'
      
      console.log(`Firing webhook to ${webhookUrl}`, {
        item_name: item.item_name,
        current_stock: item.stock_level,
        supplier_whatsapp: item.supplier_whatsapp
      })
      
      alert(`Supplier order request triggered for ${item.item_name} via Webhook!`)
    } catch (err) {
      console.error('Webhook error:', err)
    }
  }

  if (loading) return <div style={{ padding: '20px' }}>Loading Kitchen...</div>

  return (
    <div className="space-y-6" style={{ padding: '20px' }}>
      <div className="dash-card">
        <h2>Central Kitchen & Stock</h2>
        <p className="desc" style={{ fontFamily: 'var(--sans)' }}>Monitor real-time inventory and trigger automated supplier orders via WhatsApp integrations.</p>
      </div>

      <div className="dash-grid-2">
        {inventory.length === 0 ? (
          <p className="text-muted">No inventory records found.</p>
        ) : (
          inventory.map((item) => {
            const isLow = item.stock_level < 10 // Arbitrary threshold for low stock
            return (
              <div className="dash-card" key={item.id} style={{ border: isLow ? '1px solid var(--terracotta)' : '1px solid transparent', background: isLow ? '#fff5f2' : 'white' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h3 style={{ margin: '0 0 4px 0', fontFamily: 'var(--sans)', fontSize: '16px', fontWeight: 600 }}>{item.item_name}</h3>
                    <p style={{ fontSize: '12px', color: 'var(--ink-soft)' }}>Expiry: {item.expiry_date || 'N/A'}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '20px', fontWeight: 700, color: isLow ? 'var(--terracotta)' : 'var(--ink)' }}>
                      {item.stock_level} kg
                    </span>
                    {isLow && <p style={{ color: 'var(--terracotta)', fontSize: '11px', fontWeight: 700, marginTop: '4px', letterSpacing: '1px' }}>LOW STOCK</p>}
                  </div>
                </div>

                <div style={{ marginTop: '20px', borderTop: '1px solid rgba(26,22,20,0.1)', paddingTop: '16px' }}>
                  <button 
                    onClick={() => triggerOrderWebhook(item)}
                    style={{ width: '100%', padding: '10px', background: 'var(--ink)', color: 'var(--bone)', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontFamily: 'var(--sans)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}
                  >
                    Auto-Order via Webhook
                  </button>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
