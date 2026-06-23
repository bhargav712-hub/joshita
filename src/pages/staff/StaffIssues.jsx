import React, { useState } from 'react'
import { AlertTriangle, MessageSquareWarning, PackageMinus, Activity } from 'lucide-react'

export default function StaffIssues() {
  const [submitting, setSubmitting] = useState(false)

  const handleReport = async (issueType) => {
    setSubmitting(true)
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800))
    
    setSubmitting(false)
    
    // In a real app, this would insert a row into an `issues` table 
    // and trigger a realtime Supabase subscription on the Admin dashboard.
    alert(`A High Priority [${issueType}] alert has been pinged directly to Joshi on the Admin Command Center!`)
  }

  return (
    <div className="space-y-6" style={{ marginTop: '20px' }}>
      <div className="dash-card" style={{ paddingBottom: '20px' }}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'red' }}>
          <AlertTriangle /> Critical Issue Reporting
        </h2>
        <p className="desc">
          Tap a button below to immediately ping the Admin Dashboard. Only use these for active emergencies during dispatch or service.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '15px' }}>
        
        <button 
          onClick={() => handleReport('Missing Equipment / Ingredients')}
          disabled={submitting}
          style={{ background: 'white', border: '2px solid rgba(255, 100, 0, 0.2)', padding: '20px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '15px', color: 'var(--ink)', cursor: 'pointer', textAlign: 'left' }}
        >
          <div style={{ background: 'rgba(255, 100, 0, 0.1)', padding: '15px', borderRadius: '50%' }}>
            <PackageMinus size={24} color="#ff6600" />
          </div>
          <div>
            <h4 style={{ margin: 0, fontSize: '16px' }}>Missing Items</h4>
            <p className="desc" style={{ margin: '5px 0 0 0', fontSize: '13px' }}>Forgot propane, ingredients, or serveware.</p>
          </div>
        </button>

        <button 
          onClick={() => handleReport('Broken Cart Equipment')}
          disabled={submitting}
          style={{ background: 'white', border: '2px solid rgba(255, 0, 0, 0.2)', padding: '20px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '15px', color: 'var(--ink)', cursor: 'pointer', textAlign: 'left' }}
        >
          <div style={{ background: 'rgba(255, 0, 0, 0.1)', padding: '15px', borderRadius: '50%' }}>
            <Activity size={24} color="#ff0000" />
          </div>
          <div>
            <h4 style={{ margin: 0, fontSize: '16px' }}>Broken Equipment</h4>
            <p className="desc" style={{ margin: '5px 0 0 0', fontSize: '13px' }}>Wok burner failure, cart wheel issue, etc.</p>
          </div>
        </button>

        <button 
          onClick={() => handleReport('Host Complaint / Escalation')}
          disabled={submitting}
          style={{ background: 'white', border: '2px solid rgba(150, 0, 255, 0.2)', padding: '20px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '15px', color: 'var(--ink)', cursor: 'pointer', textAlign: 'left' }}
        >
          <div style={{ background: 'rgba(150, 0, 255, 0.1)', padding: '15px', borderRadius: '50%' }}>
            <MessageSquareWarning size={24} color="#9900ff" />
          </div>
          <div>
            <h4 style={{ margin: 0, fontSize: '16px' }}>Host Escalation</h4>
            <p className="desc" style={{ margin: '5px 0 0 0', fontSize: '13px' }}>Host is unhappy, requires Joshi's immediate intervention.</p>
          </div>
        </button>

      </div>
    </div>
  )
}
