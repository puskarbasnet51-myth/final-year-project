import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

function Login() {
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    username: '',
    password: '',
  })

  const [errorMessage, setErrorMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    setErrorMessage('')
    setLoading(true)

    try {
      // 1. Get CSRF cookie from Django
      const csrfResponse = await fetch(
        'http://localhost:8000/api/csrf/',
        {
          method: 'GET',
          credentials: 'include',
        }
      )

      if (!csrfResponse.ok) {
        throw new Error('Could not get CSRF token')
      }

      // Get CSRF token from browser cookie
      const csrfToken = document.cookie
        .split('; ')
        .find((row) => row.startsWith('csrftoken='))
        ?.split('=')[1]

      if (!csrfToken) {
        setErrorMessage(
          'Could not get a CSRF token from Django. Is the backend running?'
        )
        setLoading(false)
        return
      }

      // 2. Send login request to Django
      const response = await fetch(
        'http://localhost:8000/api/login/',
        {
          method: 'POST',

          headers: {
            'Content-Type':
              'application/x-www-form-urlencoded',
            'X-CSRFToken': csrfToken,
          },

          body: new URLSearchParams({
            username: formData.username,
            password: formData.password,
          }),

          credentials: 'include',
        }
      )

      // 3. Read Django response
      const result = await response.json()

      // 4. Check login result
      if (result.success) {
        console.log('Login successful')
        console.log('User role:', result.role)

        // Admin
        if (result.role === 'admin') {
          navigate('/admin-dashboard')
        }

        // Donor
        else if (result.role === 'donor') {
          navigate('/donor-dashboard')
        }

        // Receiver
        else if (result.role === 'receiver') {
          navigate('/receiver-dashboard')
        }

        // Unknown role
        else {
          setErrorMessage(
            'User role not found. Please contact the administrator.'
          )
        }
      } else {
        setErrorMessage(
          result.message || 'Login failed.'
        )
      }
    } catch (error) {
      console.error('Login error:', error)

      setErrorMessage(
        'Could not connect to Django. Is the backend running?'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="container"
      style={{
        paddingTop: '60px',
        paddingBottom: '60px',
      }}
    >
      <div
        style={{
          maxWidth: '440px',
          margin: '0 auto',
        }}
      >
        <div className="card">

          {/* Header */}
          <div className="card-header-green text-center">
            <h3
              style={{
                fontSize: '1.4rem',
                fontWeight: 700,
              }}
            >
              <i className="fas fa-sign-in-alt"></i>{' '}
              Login
            </h3>
          </div>

          {/* Body */}
          <div className="card-body">

            {/* Error */}
            {errorMessage && (
              <div className="message message-error">
                {errorMessage}
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit}>

              {/* Username */}
              <div className="form-group">

                <label className="form-label">
                  Username
                </label>

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

              {/* Password */}
              <div className="form-group">

                <label className="form-label">
                  Password
                </label>

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

              {/* Login Button */}
              <button
                type="submit"
                className="btn btn-green btn-full"
                style={{
                  marginTop: '8px',
                }}
                disabled={loading}
              >
                <i className="fas fa-sign-in-alt"></i>{' '}

                {loading
                  ? 'Logging in...'
                  : 'Login'}
              </button>

            </form>

            {/* Register Link */}
            <p
              className="text-center"
              style={{
                marginTop: '20px',
              }}
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