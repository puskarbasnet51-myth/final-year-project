


import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

function Login() {
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    username: '',
    password: '',
  })

  const [errorMessage, setErrorMessage] = useState('')

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorMessage('')

    try {
      // Get CSRF cookie from Django
      await fetch('http://localhost:8000/api/csrf/', {
        method: 'GET',
        credentials: 'include',
      })

      const csrfToken = document.cookie
        .split('; ')
        .find((row) => row.startsWith('csrftoken='))
        ?.split('=')[1]

      if (!csrfToken) {
        setErrorMessage(
          'Could not get a CSRF token from Django. Is the backend running?'
        )
        return
      }

      const response = await fetch('http://localhost:8000/api/login/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'X-CSRFToken': csrfToken,
        },
        body: new URLSearchParams(formData),
        credentials: 'include',
      })

      const result = await response.json()

     if (result.success) {
    if (result.role === 'donor') {
        navigate('/donor-dashboard')
    } else if (result.role === 'receiver') {
        navigate('/receiver-dashboard')
    } else if (result.role === 'admin') {
        navigate('/admin-dashboard')
    } else {
        setErrorMessage('User role not found.')
    }
} else {
    setErrorMessage(result.message)
}
    } catch (error) {
      console.error('Login error:', error)
      setErrorMessage('Could not connect to Django. Is the backend running?')
    }
  }

  return (
    <div
      className="container"
      style={{ paddingTop: '60px', paddingBottom: '60px' }}
    >
      <div style={{ maxWidth: '440px', margin: '0 auto' }}>
        <div className="card">
          <div className="card-header-green text-center">
            <h3 style={{ fontSize: '1.4rem', fontWeight: 700 }}>
              <i className="fas fa-sign-in-alt"></i> Login
            </h3>
          </div>

          <div className="card-body">
            {errorMessage && (
              <div className="message message-error">
                {errorMessage}
              </div>
            )}

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

            <p
              className="text-center mt-3"
              style={{ marginTop: '20px' }}
            >
              No account?{' '}
              <Link
                to="/register"
                style={{
                  color: 'var(--green-main)',
                  fontWeight: 600,
                }}
              >
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