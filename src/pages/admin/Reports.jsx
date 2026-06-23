export default function Reports() {
  // Mock data for CSS bar charts
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
  const revenuePercentages = [40, 65, 55, 85, 95, 120] 

  return (
    <div className="space-y-6" style={{ padding: '20px' }}>
      <div className="dash-card">
        <h2>Analytics & Reports</h2>
        <p className="desc" style={{ fontFamily: 'var(--sans)' }}>Visualize cart performance, revenue trajectories, and booking volumes.</p>
      </div>

      <div className="dash-grid-2">
        <div className="dash-card">
          <h3 style={{ marginBottom: '32px', fontFamily: 'var(--sans)', fontSize: '16px', fontWeight: 600 }}>YTD Revenue Trajectory</h3>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '16px', height: '220px', paddingBottom: '20px', borderBottom: '2px solid rgba(26,22,20,0.05)' }}>
            {revenuePercentages.map((val, idx) => (
              <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '100%', maxWidth: '40px', background: val > 100 ? 'var(--terracotta)' : 'var(--ink)', height: `${Math.min(val, 100)}%`, borderRadius: '4px 4px 0 0', transition: 'height 0.5s ease' }}></div>
                <span style={{ fontSize: '12px', fontFamily: 'var(--sans)', color: 'var(--ink-soft)', fontWeight: 500 }}>{months[idx]}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="dash-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <h3 style={{ marginBottom: '24px', fontFamily: 'var(--sans)', fontSize: '16px', fontWeight: 600 }}>Key Performance Indicators</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ background: 'var(--bone)', padding: '20px', borderRadius: '8px' }}>
              <p style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--ink-soft)', marginBottom: '8px', fontFamily: 'var(--sans)' }}>Total Carts Dispatched</p>
              <h4 style={{ fontSize: '32px', margin: 0, color: 'var(--ink)' }}>142</h4>
            </div>
            <div style={{ background: 'var(--bone)', padding: '20px', borderRadius: '8px' }}>
              <p style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--ink-soft)', marginBottom: '8px', fontFamily: 'var(--sans)' }}>Avg. Guests per Event</p>
              <h4 style={{ fontSize: '32px', margin: 0, color: 'var(--ink)' }}>85</h4>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
