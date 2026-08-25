import { Routes, Route, Link } from 'react-router-dom'
import Home from './pages/Home'
import Register from './pages/Register'
import Login from './pages/Login'
import DonorDashboard from './pages/DonorDashboard'

function App() {
  return (
    <>
      {/* Temporary Navbar */}
      <nav className="navbar">
        <div className="nav-container">
          <Link to="/" className="nav-brand">
            <i className="fas fa-leaf"></i> FeedForward
          </Link>

          <div className="nav-links">
            <Link to="/">Home</Link>
            <Link to="/login">Login</Link>
            <Link to="/register" className="btn-nav">
              Register
            </Link>
          </div>
        </div>
      </nav>

      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/donor-dashboard" element={<DonorDashboard />} />
        </Routes>
      </main>

      {/* Temporary Footer */}
      <footer className="footer">
        <div className="footer-container">
          <p>
            <i className="fas fa-leaf"></i>{' '}
            <strong>FeedForward</strong> — Fresh Individual Food Donation Platform
          </p>

          <p className="footer-sub">
            Texas College of Management & IT, Kathmandu | 2026
          </p>
        </div>
      </footer>
    </>
  )
}

export default App