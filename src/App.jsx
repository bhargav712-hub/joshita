import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

// Import your new page components
import Home from './pages/Home'
import Dashboard from './pages/Dashboard'
import Account from './pages/Account'
import ArivaWebsite from './pages/ArivaWebsite'

// Admin Dashboard Components
import Overview from './pages/admin/Overview'
import Bookings from './pages/admin/Bookings'
import Customers from './pages/admin/Customers'
import MenuEditor from './pages/admin/MenuEditor'
import Kitchen from './pages/admin/Kitchen'
import Logistics from './pages/admin/Logistics'
import RecipeVault from './pages/admin/RecipeVault'
import Reports from './pages/admin/Reports'
import Settings from './pages/admin/Settings'
import Team from './pages/admin/Team'

function App() {
  return (
    <Router>
      <Routes>
        {/* Map your URLs to your specific components */}
        <Route path="/" element={<Home />} />
        
        <Route path="/dashboard" element={<Dashboard />}>
          <Route index element={<Overview />} />
          <Route path="bookings" element={<Bookings />} />
          <Route path="customers" element={<Customers />} />
          <Route path="menu" element={<MenuEditor />} />
          <Route path="kitchen" element={<Kitchen />} />
          <Route path="logistics" element={<Logistics />} />
          <Route path="vault" element={<RecipeVault />} />
          <Route path="reports" element={<Reports />} />
          <Route path="settings" element={<Settings />} />
          <Route path="team" element={<Team />} />
        </Route>

        <Route path="/account" element={<Account />} />
        <Route path="/ariva-website" element={<ArivaWebsite />} />
      </Routes>
    </Router>
  )
}

export default App
