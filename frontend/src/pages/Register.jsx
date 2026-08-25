
import { useState } from 'react'
import { Link } from 'react-router-dom'

function Register() {
  const [formData, setFormData] = useState({
    full_name: '',
    username: '',
    email: '',
    phone: '',
    role: '',
    organization: '',
    address: '',
    password1: '',
    password2: '',
  })

  const handleChange = (e) => {
    const { name, value } = e.target

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const getCsrfToken = async () => {
  const response = await fetch('http://localhost:8000/register/', {
    credentials: 'include',
  })

  const text = await response.text()

  const match = text.match(/name="csrfmiddlewaretoken" value="([^"]+)"/)

  if (!match) {
    throw new Error('CSRF token not found')
  }

  return match[1]
}

const handleSubmit = async (e) => {
  e.preventDefault()

  try {
    // Get CSRF cookie from Django
    await fetch('http://localhost:8000/register/', {
      method: 'GET',
      credentials: 'include',
    })

    const csrfToken = document.cookie
      .split('; ')
      .find(row => row.startsWith('csrftoken='))
      ?.split('=')[1]

    if (!csrfToken) {
      alert('CSRF token not found.')
      return
    }

    const response = await fetch('http://localhost:8000/register/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'X-CSRFToken': csrfToken,
      },
      body: new URLSearchParams(formData),
      credentials: 'include',
    })

    if (response.ok || response.redirected) {
      alert('Account created successfully!')
      window.location.href = 'http://localhost:8000/login/'
    } else {
      const text = await response.text()
      console.log('Registration failed:', response.status, text)
      alert('Registration failed. Check the terminal.')
    }

  } catch (error) {
    console.error('Registration error:', error)
    alert('Could not connect to Django.')
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
          maxWidth: '560px',
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
              <i className="fas fa-user-plus"></i>{' '}
              Create Account
            </h3>
          </div>

          <div className="card-body">

            <form onSubmit={handleSubmit}>

              <div className="form-group">
                <label className="form-label">
                  Full Name
                </label>

                <input
                  type="text"
                  name="full_name"
                  className="form-control"
                  placeholder="Your full name"
                  value={formData.full_name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  Username
                </label>

                <input
                  type="text"
                  name="username"
                  className="form-control"
                  placeholder="Choose a username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  Email
                </label>

                <input
                  type="email"
                  name="email"
                  className="form-control"
                  placeholder="Your email address"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-row">

                <div className="form-group">
                  <label className="form-label">
                    Phone
                  </label>

                  <input
                    type="text"
                    name="phone"
                    className="form-control"
                    placeholder="98XXXXXXXX"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    I want to
                  </label>

                  <select
                    name="role"
                    className="form-control"
                    value={formData.role}
                    onChange={handleChange}
                    required
                  >
                    <option value="">
                      -- Select Role --
                    </option>

                    <option value="donor">
                      Donate fresh food
                    </option>

                    <option value="receiver">
                      Receive food (NGO/Shelter)
                    </option>
                  </select>
                </div>

              </div>

              <div className="form-group">
                <label className="form-label">
                  Organization / Your Name
                </label>

                <input
                  type="text"
                  name="organization"
                  className="form-control"
                  placeholder="e.g. Bal Mandir, Your Name"
                  value={formData.organization}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  Address
                </label>

                <textarea
                  name="address"
                  className="form-control"
                  rows="2"
                  placeholder="Your location"
                  value={formData.address}
                  onChange={handleChange}
                  required
                ></textarea>
              </div>

              <div className="form-row">

                <div className="form-group">
                  <label className="form-label">
                    Password
                  </label>

                  <input
                    type="password"
                    name="password1"
                    className="form-control"
                    placeholder="Create password"
                    value={formData.password1}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Confirm Password
                  </label>

                  <input
                    type="password"
                    name="password2"
                    className="form-control"
                    placeholder="Repeat password"
                    value={formData.password2}
                    onChange={handleChange}
                    required
                  />
                </div>

              </div>

              <button
                type="submit"
                className="btn btn-green btn-full"
              >
                <i className="fas fa-user-plus"></i>{' '}
                Create Account
              </button>

            </form>

             <p className="text-center" style={{ marginTop: '20px' }}>
              Already have an account?{' '}
              <Link to="/login" style={{ color: 'var(--green-main)', fontWeight: 600 }}>
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