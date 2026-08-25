
import { useState } from 'react'
import { Link } from 'react-router-dom'

function Login() {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e) => {
    // Real authentication is not wired up yet — that happens in
    // Phase 14 (Django API Integration) / Phase 15 (Authentication).
    e.preventDefault()
    console.log('Login form submitted (not yet connected to Django):', formData)
  }

  return (
    <div className="container" style={{ paddingTop: '60px', paddingBottom: '60px' }}>
      <div style={{ maxWidth: '440px', margin: '0 auto' }}>
        <div className="card">
          <div className="card-header-green text-center">
            <h3 style={{ fontSize: '1.4rem', fontWeight: 700 }}>
              <i className="fas fa-sign-in-alt"></i> Login
            </h3>
          </div>
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Username</label>
                <input
                  type="text"
                  name="username"
                  className="form-control"
                  placeholder="Enter your username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Password</label>
                <input
                  type="password"
                  name="password"
                  className="form-control"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>
              <button
                type="submit"
                className="btn btn-green btn-full"
                style={{ marginTop: '8px' }}
              >
                <i className="fas fa-sign-in-alt"></i> Login
              </button>
            </form>
            <p className="text-center mt-3" style={{ marginTop: '20px' }}>
              No account?{' '}
              <Link to="/register" style={{ color: 'var(--green-main)', fontWeight: 600 }}>
                Register here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login