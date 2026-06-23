export default function Settings() {
  function handleSave(e) {
    e.preventDefault()
    alert('Configuration saved successfully!')
  }

  return (
    <div className="space-y-6" style={{ padding: '20px' }}>
      <div className="dash-card">
        <h2>Global Configuration</h2>
        <p className="desc" style={{ fontFamily: 'var(--sans)' }}>Manage base pricing tiers, cart operational hours, and system parameters.</p>
      </div>

      <div className="dash-card" style={{ maxWidth: '700px' }}>
        <form className="space-y-8" onSubmit={handleSave}>
          
          <div>
            <h3 style={{ fontSize: '16px', marginBottom: '20px', fontFamily: 'var(--sans)', fontWeight: 600 }}>Base Pricing Tiers</h3>
            <div className="dash-grid-2">
              <div>
                <label className="form-label" style={{ fontFamily: 'var(--sans)' }}>Intimate Package Base (₹)</label>
                <input type="number" className="form-input" defaultValue="15000" />
              </div>
              <div>
                <label className="form-label" style={{ fontFamily: 'var(--sans)' }}>Curated Package Base (₹)</label>
                <input type="number" className="form-input" defaultValue="25000" />
              </div>
            </div>
          </div>

          <div style={{ borderTop: '1px solid rgba(26,22,20,0.1)', paddingTop: '24px' }}>
            <h3 style={{ fontSize: '16px', marginBottom: '20px', fontFamily: 'var(--sans)', fontWeight: 600 }}>Operational Business Hours</h3>
            <div className="dash-grid-2">
              <div>
                <label className="form-label" style={{ fontFamily: 'var(--sans)' }}>Opening Time</label>
                <input type="time" className="form-input" defaultValue="09:00" />
              </div>
              <div>
                <label className="form-label" style={{ fontFamily: 'var(--sans)' }}>Closing Time</label>
                <input type="time" className="form-input" defaultValue="23:30" />
              </div>
            </div>
          </div>

          <div style={{ borderTop: '1px solid rgba(26,22,20,0.1)', paddingTop: '24px' }}>
            <button type="submit" className="submit-btn" style={{ width: 'auto', padding: '12px 32px', fontFamily: 'var(--sans)', letterSpacing: '1px' }}>
              Save Configuration
            </button>
          </div>

        </form>
      </div>
    </div>
  )
}
