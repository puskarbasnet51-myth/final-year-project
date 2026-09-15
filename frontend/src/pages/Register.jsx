import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

const API_BASE = 'http://localhost:8000'

function Register() {
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    role: 'donor',
    organization: '',
    phone: '',
    address: '',
  })

  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
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
    setSuccessMessage('')

    if (formData.password !== formData.confirmPassword) {
      setErrorMessage('Passwords do not match.')
      return
    }

    setLoading(true)

    try {
      // 1. Get CSRF token from Django
      const csrfResponse = await fetch(
        `${API_BASE}/api/csrf/`,
        {
          method: 'GET',
          credentials: 'include',
        }
      )

      if (!csrfResponse.ok) {
        throw new Error('Could not get CSRF token')
      }

      // 2. Read CSRF token from browser cookie
      const csrfToken = document.cookie
        .split('; ')
        .find((row) => row.startsWith('csrftoken='))
        ?.split('=')
        .slice(1)
        .join('=')

      if (!csrfToken) {
        setErrorMessage(
          'Could not get a CSRF token from Django. Is the backend running?'
        )
        setLoading(false)
        return
      }

      // 3. Send registration request to Django
      const response = await fetch(
        `${API_BASE}/api/register/`,
        {
          method: 'POST',
          headers: {
            'Content-Type':
              'application/x-www-form-urlencoded',
            'X-CSRFToken': csrfToken,
          },
          credentials: 'include',
          body: new URLSearchParams({
            username: formData.username,

            // IMPORTANT:
            // Django expects password1 and password2
            password1: formData.password,
            password2: formData.confirmPassword,

            role: formData.role,
            organization: formData.organization,
            phone: formData.phone,
            address: formData.address,
          }),
        }
      )

      const result = await response.json()

      if (result.success) {
        setSuccessMessage(
          'Registration successful! Redirecting to login...'
        )

        setTimeout(() => {
          navigate('/login')
        }, 1500)
      } else {
        setErrorMessage(
          result.message || 'Registration failed.'
        )
      }
    } catch (error) {
      console.error('Registration error:', error)

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
          maxWidth: '600px',
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
              <i className="fas fa-user-plus"></i>{' '}
              Create Account
            </h3>
          </div>

          {/* Body */}
          <div className="card-body">

            {/* Error message */}
            {errorMessage && (
              <div className="message message-error">
                {errorMessage}
              </div>
            )}

            {/* Success message */}
            {successMessage && (
              <div className="message message-success">
                {successMessage}
              </div>
            )}

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

              {/* Confirm Password */}
              <div className="form-group">
                <label className="form-label">
                  Confirm Password
                </label>

                <input
                  type="password"
                  name="confirmPassword"
                  className="form-control"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Role */}
              <div className="form-group">
                <label className="form-label">
                  Account Type
                </label>

                <select
                  name="role"
                  className="form-control"
                  value={formData.role}
                  onChange={handleChange}
                  required
                >
                  <option value="donor">
                    Donor
                  </option>

                  <option value="receiver">
                    Receiver
                  </option>
                </select>
              </div>

              {/* Organization */}
              <div className="form-group">
                <label className="form-label">
                  Organization
                </label>

                <input
                  type="text"
                  name="organization"
                  className="form-control"
                  placeholder="Enter organization name"
                  value={formData.organization}
                  onChange={handleChange}
                />
              </div>

              {/* Phone */}
              <div className="form-group">
                <label className="form-label">
                  Phone Number
                </label>

                <input
                  type="text"
                  name="phone"
                  className="form-control"
                  placeholder="Enter phone number"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>

              {/* Address */}
              <div className="form-group">
                <label className="form-label">
                  Registered Address
                </label>

                <textarea
                  name="address"
                  className="form-control"
                  placeholder="Enter your registered address"
                  value={formData.address}
                  onChange={handleChange}
                  rows="3"
                />
              </div>

              {/* Register button */}
              <button
                type="submit"
                className="btn btn-green btn-full"
                style={{
                  marginTop: '8px',
                }}
                disabled={loading}
              >
                <i className="fas fa-user-plus"></i>{' '}

                {loading
                  ? 'Creating account...'
                  : 'Create Account'}
              </button>

            </form>

            {/* Login link */}
            <p
              className="text-center"
              style={{
                marginTop: '20px',
              }}
            >
              Already have an account?{' '}

              <Link
                to="/login"
                style={{
                  color: 'var(--green-main)',
                  fontWeight: 600,
                }}
              >
                Login here
              </Link>
            </p>

          </div>
        </div>
      </div>
    </div>
  )
}

export default Register