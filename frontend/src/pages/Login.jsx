import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

const API_BASE = 'http://localhost:8000'

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

  const getCsrfToken = () => {
    const csrfCookie = document.cookie
      .split('; ')
      .find((row) => row.startsWith('csrftoken='))

    if (!csrfCookie) {
      return null
    }

    return csrfCookie
      .split('=')
      .slice(1)
      .join('=')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    setErrorMessage('')
    setLoading(true)

    try {
      // =====================================================
      // STEP 1: GET CSRF TOKEN
      // =====================================================

      const csrfResponse = await fetch(
        `${API_BASE}/api/csrf/`,
        {
          method: 'GET',
          credentials: 'include',
        }
      )

      if (!csrfResponse.ok) {
        throw new Error(
          'Could not get CSRF token from Django.'
        )
      }

      const csrfData = await csrfResponse.json()

      const csrfToken =
        csrfData.csrfToken || getCsrfToken()

      if (!csrfToken) {
        throw new Error(
          'Django did not provide a CSRF token.'
        )
      }

      // =====================================================
      // STEP 2: LOGIN
      // =====================================================

      const response = await fetch(
        `${API_BASE}/api/login/`,
        {
          method: 'POST',

          credentials: 'include',

          headers: {
            'Content-Type':
              'application/x-www-form-urlencoded',

            'X-CSRFToken': csrfToken,

            Accept: 'application/json',
          },

          body: new URLSearchParams({
            username: formData.username,
            password: formData.password,
          }),
        }
      )

      // =====================================================
      // STEP 3: CHECK RESPONSE
      // =====================================================

      const contentType =
        response.headers.get('content-type') || ''

      if (!contentType.includes('application/json')) {
        const text = await response.text()

        console.error(
          'Unexpected Django login response:',
          text
        )

        throw new Error(
          'Django returned an unexpected response.'
        )
      }

      const result = await response.json()

      console.log('Login response:', result)

      // =====================================================
      // STEP 4: LOGIN FAILED
      // =====================================================

      if (!response.ok || !result.success) {
        setErrorMessage(
          result.message ||
          'Invalid username or password.'
        )

        return
      }

      // =====================================================
      // STEP 5: LOGIN SUCCESS
      // =====================================================

      console.log('Login successful')
      console.log('Role:', result.role)

      // Give browser time to store session cookie
      await new Promise((resolve) =>
        setTimeout(resolve, 300)
      )

      // =====================================================
      // STEP 6: REDIRECT
      // =====================================================

      if (result.role === 'admin') {
        navigate('/admin-dashboard')
      }

      else if (result.role === 'donor') {
        navigate('/donor-dashboard')
      }

      else if (result.role === 'receiver') {
        navigate('/receiver-dashboard')
      }

      else {
        setErrorMessage(
          'User role not found. Please contact the administrator.'
        )
      }

    } catch (error) {
      console.error('LOGIN ERROR:', error)

      setErrorMessage(
        error.message ||
        'Could not connect to Django.'
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


          <div className="card-body">

            {errorMessage && (
              <div className="message message-error">
                {errorMessage}
              </div>
            )}


            <form onSubmit={handleSubmit}>

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