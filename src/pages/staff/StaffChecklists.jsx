import React, { useState } from 'react'
import { CheckSquare, Flame, CheckCircle, Package } from 'lucide-react'

export default function StaffChecklists() {
  const [activeTab, setActiveTab] = useState('pack')
  
  // Dummy data for checklists
  const [packList, setPackList] = useState([
    { id: 1, item: 'Live Wok Station (Burner + Stand)', checked: false },
    { id: 2, item: 'Propane Cylinders (x2)', checked: false },
    { id: 3, item: 'Prep Coolers (Proteins & Veg)', checked: false },
    { id: 4, item: 'Plating Kit (Tweezers, Squeeze Bottles)', checked: false },
    { id: 5, item: 'Signature Serveware (Plates, Bowls)', checked: false },
  ])

  const [setupList, setSetupList] = useState([
    { id: 6, item: 'Unload coolers directly to shaded area', checked: false },
    { id: 7, item: 'Assemble Wok Station (Min 10ft from flammable structures)', checked: false },
    { id: 8, item: 'Set up Plating Table with wipe-down sanitizer', checked: false },
    { id: 9, item: 'Test fire burner and check propane connection', checked: false },
  ])

  const toggleCheck = (id, listType) => {
    if (listType === 'pack') {
      setPackList(packList.map(item => item.id === id ? { ...item, checked: !item.checked } : item))
    } else {
      setSetupList(setupList.map(item => item.id === id ? { ...item, checked: !item.checked } : item))
    }
  }

  const allPacked = packList.every(i => i.checked)
  const allSetup = setupList.every(i => i.checked)

  return (
    <div className="space-y-6" style={{ marginTop: '20px' }}>
      <div className="dash-card" style={{ padding: '15px' }}>
        <div style={{ display: 'flex', background: 'var(--ink)', borderRadius: '8px', padding: '4px' }}>
          <button 
            onClick={() => setActiveTab('pack')}
            style={{ flex: 1, padding: '10px', border: 'none', borderRadius: '4px', background: activeTab === 'pack' ? 'var(--terracotta)' : 'transparent', color: activeTab === 'pack' ? 'white' : 'var(--ink-soft)', fontWeight: 'bold' }}
          >
            Dispatch Pack-Out
          </button>
          <button 
            onClick={() => setActiveTab('setup')}
            style={{ flex: 1, padding: '10px', border: 'none', borderRadius: '4px', background: activeTab === 'setup' ? 'var(--terracotta)' : 'transparent', color: activeTab === 'setup' ? 'white' : 'var(--ink-soft)', fontWeight: 'bold' }}
          >
            Venue Setup
          </button>
        </div>
      </div>

      <div className="dash-card">
        <h4 style={{ margin: '0 0 15px 0', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--ink)' }}>
          {activeTab === 'pack' ? <><Package size={18} color="var(--terracotta)"/> Loading Dock Checklist</> : <><Flame size={18} color="var(--terracotta)"/> Venue Setup Protocol</>}
        </h4>
        
        <div className="space-y-3">
          {(activeTab === 'pack' ? packList : setupList).map(item => (
            <div 
              key={item.id} 
              onClick={() => toggleCheck(item.id, activeTab)}
              style={{ display: 'flex', alignItems: 'flex-start', gap: '15px', padding: '15px', background: item.checked ? 'rgba(0, 200, 100, 0.05)' : 'rgba(26, 22, 20, 0.03)', border: item.checked ? '1px solid rgba(0, 200, 100, 0.2)' : '1px solid rgba(26, 22, 20, 0.08)', borderRadius: '6px', cursor: 'pointer', transition: 'all 0.2s' }}
            >
              {item.checked ? (
                <CheckCircle size={22} color="#00cc66" style={{ marginTop: '0px' }} />
              ) : (
                <div style={{ width: '22px', height: '22px', borderRadius: '50%', border: '2px solid var(--ink-soft)' }}></div>
              )}
              <div style={{ flex: 1 }}>
                <p style={{ margin: 0, fontSize: '15px', color: item.checked ? '#00aa55' : 'var(--ink)', textDecoration: item.checked ? 'line-through' : 'none' }}>
                  {item.item}
                </p>
              </div>
            </div>
          ))}
        </div>

        {activeTab === 'pack' && allPacked && (
          <button className="submit-btn" style={{ width: '100%', marginTop: '20px', background: '#00cc66' }}>
            Sign off & Dispatch Cart
          </button>
        )}

        {activeTab === 'setup' && allSetup && (
          <button className="submit-btn" style={{ width: '100%', marginTop: '20px', background: '#00cc66' }}>
            Setup Complete - Ready for Service
          </button>
        )}
      </div>
    </div>
  )
}
