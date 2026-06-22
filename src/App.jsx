import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

// Import your new page components
import Home from './pages/Home'
import Dashboard from './pages/Dashboard'
import Account from './pages/Account'
import ArivaWebsite from './pages/ArivaWebsite'

function App() {
  return (
    <Router>
      <Routes>
        {/* Map your URLs to your specific components */}
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/account" element={<Account />} />
        <Route path="/ariva-website" element={<ArivaWebsite />} />
      </Routes>
    </Router>
  )
}

export default App
