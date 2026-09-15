


import { useState, useEffect } from 'react'

const API_BASE = 'http://localhost:8000'

async function postToDjango(url, data) {
  await fetch(`${API_BASE}/api/csrf/`, {
    method: 'GET',
    credentials: 'include',
  })

  const csrfToken = document.cookie
    .split('; ')
    .find((row) => row.startsWith('csrftoken='))
    ?.split('=')[1]

  const response = await fetch(`${API_BASE}${url}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'X-CSRFToken': csrfToken || '',
    },
    body: new URLSearchParams(data),
    credentials: 'include',
  })

  return response.json()
}

function ReceiverDashboard() {
  const [username, setUsername] = useState('')
  const [profileAddress, setProfileAddress] = useState('')

  const [stats, setStats] = useState({
    total_requests: 0,
    open_requests: 0,
    matched: 0,
    closed: 0,
  })

  const [notifications, setNotifications] = useState([])
  const [availableDonations, setAvailableDonations] = useState([])
  const [incomingDonations, setIncomingDonations] = useState([])
  const [requests, setRequests] = useState([])

  const [activeModal, setActiveModal] = useState(null)

  const [requestLocationChoice, setRequestLocationChoice] =
    useState('registered')

  const [customRequestLocation, setCustomRequestLocation] =
    useState('')

  const [loading, setLoading] = useState(true)

  const openModal = () => {
    setActiveModal('addRequest')
  }

  const closeModal = () => {
    setActiveModal(null)
  }

  useEffect(() => {
    loadDashboard()
  }, [])

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        closeModal()
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  useEffect(() => {
    document.body.style.overflow = activeModal ? 'hidden' : ''

    return () => {
      document.body.style.overflow = ''
    }
  }, [activeModal])

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      closeModal()
    }
  }

  async function loadDashboard() {
    try {
      setLoading(true)

      const response = await fetch(
        `${API_BASE}/api/receiver-dashboard/`,
        {
          credentials: 'include',
        }
      )

      if (!response.ok) {
        throw new Error('Failed to load receiver dashboard')
      }

      const data = await response.json()

      setUsername(data.username || '')
      setProfileAddress(data.profile_address || '')

      setStats(
        data.stats || {
          total_requests: 0,
          open_requests: 0,
          matched: 0,
          closed: 0,
        }
      )

      setNotifications(data.notifications || [])
      setAvailableDonations(data.available_donations || [])
      setIncomingDonations(data.incoming_donations || [])
      setRequests(data.requests || [])
    } catch (error) {
      console.error('Dashboard loading error:', error)
      alert('Could not load receiver dashboard.')
    } finally {
      setLoading(false)
    }
  }

  async function handleMarkRead(id) {
    try {
      const result = await postToDjango(
        `/api/notification/read/${id}/`,
        {}
      )

      if (result.success) {
        setNotifications((prev) =>
          prev.filter(
            (notification) => notification.id !== id
          )
        )
      } else {
        alert(
          result.message ||
            'Could not mark notification as read.'
        )
      }
    } catch (error) {
      console.error(error)
      alert('Something went wrong.')
    }
  }

  async function handleClaimDonation(donationId) {
    try {
      const result = await postToDjango(
        `/api/receiver/claim/${donationId}/`,
        {}
      )

      if (result.success) {
        alert(
          result.message ||
            'Donation claimed successfully!'
        )

        await loadDashboard()
      } else {
        alert(
          result.message ||
            'Could not claim donation.'
        )
      }
    } catch (error) {
      console.error(error)
      alert('Something went wrong while claiming.')
    }
  }

  async function handleConfirmReceived(matchId) {
    try {
      const result = await postToDjango(
        `/api/receiver/confirm/${matchId}/`,
        {}
      )

      if (result.success) {
        alert(
          result.message ||
            'Food received successfully! Donation completed.'
        )

        await loadDashboard()
      } else {
        alert(
          result.message ||
            'Could not confirm food received.'
        )
      }
    } catch (error) {
      console.error(error)
      alert('Something went wrong while confirming.')
    }
  }

  async function handleDeleteRequest(requestId) {
    const confirmed = window.confirm(
      'Are you sure you want to delete this request?'
    )

    if (!confirmed) {
      return
    }

    try {
      const result = await postToDjango(
        `/api/receiver/delete/${requestId}/`,
        {}
      )

      if (result.success) {
        alert(
          result.message ||
            'Request deleted successfully.'
        )

        await loadDashboard()
      } else {
        alert(
          result.message ||
            'Could not delete request.'
        )
      }
    } catch (error) {
      console.error(error)
      alert('Something went wrong while deleting.')
    }
  }

  async function handlePostRequest(e) {
    e.preventDefault()

    const formData = new FormData(e.target)

    const data = {
      meal_type: formData.get('meal_type'),
      people_count: formData.get('people_count'),
      preferred_date: formData.get('preferred_date'),
      notes: formData.get('notes'),
      location_choice: requestLocationChoice,
      custom_location: customRequestLocation,
    }

    try {
      const result = await postToDjango(
        '/api/receiver/request/',
        data
      )

      if (result.success) {
        alert(
          result.message ||
            'Meal request posted successfully.'
        )

        e.target.reset()

        setRequestLocationChoice('registered')
        setCustomRequestLocation('')

        closeModal()

        await loadDashboard()
      } else {
        alert(
          result.message ||
            'Could not post meal request.'
        )
      }
    } catch (error) {
      console.error(error)
      alert(
        'Something went wrong while posting the request.'
      )
    }
  }

  if (loading) {
    return (
      <div className="container">
        <div className="empty-state">
          <p>Loading receiver dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container">

      {/* Header */}
      <div className="page-header">

        <div>
          <h1 className="page-title">
            <i className="fas fa-users"></i>{' '}
            Receiver Dashboard
          </h1>

          <p className="page-subtitle">
            Welcome, <strong>{username}</strong>!
          </p>
        </div>

        <button
          className="btn btn-green"
          onClick={openModal}
        >
          <i className="fas fa-plus"></i>{' '}
          Post Meal Need
        </button>

      </div>

      {/* Notifications */}
      {notifications.map((notification) => (
        <div
          className="notif-bar mb-2"
          key={notification.id}
        >
          <span>
            <i className="fas fa-bell"></i>{' '}
            {notification.message}
          </span>

          <button
            className="btn btn-small btn-warning-outline"
            onClick={() =>
              handleMarkRead(notification.id)
            }
          >
            Mark Read
          </button>
        </div>
      ))}

      {/* Stats */}
      <div className="grid-4 mb-5">

        <div className="stat-card">
          <span className="stat-number color-green">
            {stats.total_requests}
          </span>

          <span className="stat-label">
            Total Requests
          </span>
        </div>

        <div className="stat-card">
          <span className="stat-number color-warning">
            {stats.open_requests}
          </span>

          <span className="stat-label">
            Open
          </span>
        </div>

        <div className="stat-card">
          <span className="stat-number color-primary">
            {stats.matched}
          </span>

          <span className="stat-label">
            Matched
          </span>
        </div>

        <div className="stat-card">
          <span className="stat-number color-green">
            {stats.closed || 0}
          </span>

          <span className="stat-label">
            Completed
          </span>
        </div>

      </div>

      {/* Incoming Donations */}
      <h2
        className="page-title mb-1"
        style={{ fontSize: '1.4rem' }}
      >
        <i className="fas fa-gift"></i>{' '}
        Incoming Donations
      </h2>

      <p className="text-muted mb-3">
        These donors have committed to bring fresh food
        for you.
      </p>

      {/* Available Donations */}
      <h3
        className="section-title"
        style={{
          fontSize: '1.3rem',
          textAlign: 'left',
        }}
      >
        Available Donations
      </h3>

      {availableDonations.length > 0 ? (

        <div className="grid-3">

          {availableDonations.map((donation) => (

            <div
              className="card open-request-card"
              key={donation.id}
            >

              <p className="fw-bold">
                {donation.meal_description}
              </p>

              <p className="small text-muted">
                By {donation.donor_username}
              </p>

              <p className="small">
                For {donation.people_count} people —{' '}
                {donation.donation_date}
              </p>

              <p className="small text-muted">
                {donation.preparation_method ===
                'home_cooked'
                  ? '🏠 Home Cooked'
                  : '🍽️ Restaurant Ordered'}
              </p>

              {/* DONATION LOCATION */}
              {donation.donation_location && (
                <p className="small text-muted">
                  <i className="fas fa-map-marker-alt"></i>{' '}
                  <strong>Donation Location:</strong>{' '}
                  {donation.donation_location}
                </p>
              )}

              <button
                className="btn btn-green btn-small mt-1"
                onClick={() =>
                  handleClaimDonation(donation.id)
                }
              >
                Claim This Donation
              </button>

            </div>

          ))}

        </div>

      ) : (

        <div className="empty-state">
          No available donations right now.
        </div>

      )}

      {/* Incoming Donations Already Matched */}
      {incomingDonations.length > 0 ? (

        <div className="grid-3 mb-5">

          {incomingDonations.map((post) => (

            <div
              className="card card-top-border"
              key={post.id}
            >

              <div className="card-body">

                <span className="badge badge-success mb-2">
                  Incoming ✓
                </span>

                <h5 className="fw-bold mb-1">
                  {post.meal_description}
                </h5>

                <p className="text-muted small mb-1">
                  <i className="fas fa-user"></i>{' '}
                  <strong>Donor:</strong>{' '}
                  {post.donor_username}
                </p>

                <p className="text-muted small mb-1">
                  <i className="fas fa-users"></i>{' '}
                  {post.people_count} people
                </p>

                <p className="text-muted small mb-1">
                  <i className="fas fa-calendar"></i>{' '}
                  {post.donation_date}
                </p>

                <p className="text-muted small mb-1">
                  {post.preparation_method ===
                  'home_cooked'
                    ? '🏠 Home Cooked'
                    : '🍽️ Restaurant Ordered'}
                </p>

                {/* DONATION LOCATION */}
                {post.donation_location && (
                  <p className="text-muted small mb-3">
                    <i className="fas fa-map-marker-alt"></i>{' '}
                    <strong>Donation Location:</strong>{' '}
                    {post.donation_location}
                  </p>
                )}

                {post.pickup_status !== 'completed' ? (

                  <button
                    className="btn btn-green btn-full btn-small"
                    onClick={() =>
                      handleConfirmReceived(
                        post.match_id
                      )
                    }
                  >
                    <i className="fas fa-check-circle"></i>{' '}
                    Confirm Food Received
                  </button>

                ) : (

                  <span
                    className="badge badge-success"
                    style={{
                      width: '100%',
                      textAlign: 'center',
                      display: 'block',
                      padding: '8px',
                    }}
                  >
                    ✅ Completed
                  </span>

                )}

              </div>

            </div>

          ))}

        </div>

      ) : (

        <div className="empty-state mb-5">

          <i className="fas fa-inbox"></i>

          <p>
            No incoming donations yet.
            Post a meal need so donors can see
            what you require!
          </p>

        </div>

      )}

      {/* My Meal Requests */}
      <h2
        className="page-title mb-3"
        style={{ fontSize: '1.4rem' }}
      >
        <i className="fas fa-clipboard-list"></i>{' '}
        My Meal Requests
      </h2>

      {requests.length > 0 ? (

        <div className="grid-3">

          {requests.map((request) => (

            <div
              className="card"
              key={request.id}
            >

              <div className="card-body">

                <h5 className="fw-bold mb-1">
                  {request.meal_type}
                </h5>

                <p className="text-muted small mb-1">
                  <i className="fas fa-users"></i>{' '}
                  {request.people_count} people
                </p>

                <p className="text-muted small mb-1">
                  <i className="fas fa-calendar"></i>{' '}
                  {request.preferred_date}
                </p>

                {/* REQUEST LOCATION */}
                {request.request_location && (
                  <p className="text-muted small mb-2">
                    <i className="fas fa-map-marker-alt"></i>{' '}
                    <strong>Request Location:</strong>{' '}
                    {request.request_location}
                  </p>
                )}

                {request.notes && (
                  <p className="text-muted small mb-2">
                    {request.notes}
                  </p>
                )}

                {/* Open */}
                {request.status === 'open' && (

                  <span className="badge badge-warning">
                    Waiting for Donor
                  </span>

                )}

                {/* Matched */}
                {request.status === 'matched' && (

                  <>
                    <span className="badge badge-primary mb-2">
                      Matched ✓
                    </span>

                    {request.matches &&
                      request.matches.map(
                        (match, index) => (

                          <div
                            className="match-box"
                            key={index}
                          >

                            <p className="small mb-1">
                              <strong>Donor:</strong>{' '}
                              {match.donor_username}
                            </p>

                            <p className="small mb-1">
                              <strong>Date:</strong>{' '}
                              {match.donation_date}
                            </p>

                            <p className="small mb-2">
                              <strong>Method:</strong>{' '}

                              {match.preparation_method ===
                              'home_cooked'
                                ? '🏠 Home Cooked'
                                : '🍽️ Restaurant'}
                            </p>

                            {match.pickup_status !==
                            'completed' ? (

                              <button
                                className="btn btn-green btn-full btn-small"
                                onClick={() =>
                                  handleConfirmReceived(
                                    request.id
                                  )
                                }
                              >
                                <i className="fas fa-check-circle"></i>{' '}
                                Confirm Received
                              </button>

                            ) : (

                              <span
                                className="badge badge-success"
                                style={{
                                  width: '100%',
                                  textAlign: 'center',
                                  display: 'block',
                                  padding: '8px',
                                }}
                              >
                                ✅ Completed
                              </span>

                            )}

                          </div>

                        )
                      )}

                  </>

                )}

                {/* Closed */}
                {request.status === 'closed' && (

                  <span className="badge badge-success">
                    Closed ✓
                  </span>

                )}

                {/* Delete */}
                {request.status !== 'closed' && (

                  <form
                    style={{ marginTop: '12px' }}
                    onSubmit={(e) => {
                      e.preventDefault()
                      handleDeleteRequest(request.id)
                    }}
                  >

                    <button
                      type="submit"
                      className="btn btn-danger-outline btn-full"
                    >
                      <i className="fas fa-trash-alt"></i>{' '}
                      Delete
                    </button>

                  </form>

                )}

              </div>

            </div>

          ))}

        </div>

      ) : (

        <div className="empty-state">

          <i className="fas fa-clipboard"></i>

          <p>
            No requests yet. Post a meal need above!
          </p>

        </div>

      )}

      {/* Post Meal Need Modal */}
      <div
        className={`modal-overlay ${
          activeModal === 'addRequest'
            ? 'active'
            : ''
        }`}
        onClick={handleOverlayClick}
      >

        <div className="modal">

          <div className="modal-header">

            <h5>
              <i className="fas fa-plus"></i>{' '}
              Post a Meal Need
            </h5>

            <button
              className="modal-close"
              onClick={closeModal}
            >
              ×
            </button>

          </div>

          <div className="modal-body">

            <form onSubmit={handlePostRequest}>

              <div className="form-group">

                <label className="form-label">
                  Meal Type *
                </label>

                <input
                  type="text"
                  name="meal_type"
                  className="form-control"
                  placeholder="e.g. Dal Bhat, Vegetarian"
                  required
                />

              </div>

              <div className="form-row">

                <div className="form-group">

                  <label className="form-label">
                    People *
                  </label>

                  <input
                    type="number"
                    name="people_count"
                    className="form-control"
                    min="1"
                    defaultValue="20"
                    required
                  />

                </div>

                <div className="form-group">

                  <label className="form-label">
                    Date *
                  </label>

                  <input
                    type="date"
                    name="preferred_date"
                    className="form-control"
                    required
                  />

                </div>

              </div>

              {/* REQUEST LOCATION */}
              <div className="form-group">

                <label className="form-label">
                  Request / Pickup Location *
                </label>

                <div>

                  <label>
                    <input
                      type="radio"
                      name="request_location_choice"
                      value="registered"
                      checked={
                        requestLocationChoice ===
                        'registered'
                      }
                      onChange={() => {
                        setRequestLocationChoice(
                          'registered'
                        )
                        setCustomRequestLocation('')
                      }}
                    />{' '}
                    Use my registered address
                  </label>

                </div>

                <div style={{ marginTop: '8px' }}>

                  <label>
                    <input
                      type="radio"
                      name="request_location_choice"
                      value="custom"
                      checked={
                        requestLocationChoice ===
                        'custom'
                      }
                      onChange={() =>
                        setRequestLocationChoice(
                          'custom'
                        )
                      }
                    />{' '}
                    Use a different location
                  </label>

                </div>

                {requestLocationChoice ===
                  'registered' && (

                  <p className="text-muted small mt-2">
                    <i className="fas fa-map-marker-alt"></i>{' '}
                    {profileAddress ||
                      'No registered address found.'}
                  </p>

                )}

                {requestLocationChoice ===
                  'custom' && (

                  <input
                    type="text"
                    className="form-control mt-2"
                    placeholder="Enter request/pickup location"
                    value={customRequestLocation}
                    onChange={(e) =>
                      setCustomRequestLocation(
                        e.target.value
                      )
                    }
                    required
                  />

                )}

              </div>

              <div className="form-group">

                <label className="form-label">
                  Notes (optional)
                </label>

                <textarea
                  name="notes"
                  className="form-control"
                  rows="2"
                  placeholder="Allergies, preferences..."
                ></textarea>

              </div>

              <button
                type="submit"
                className="btn btn-green btn-full"
              >
                <i className="fas fa-paper-plane"></i>{' '}
                Post Request
              </button>

            </form>

          </div>

        </div>

      </div>

    </div>
  )
}

export default ReceiverDashboard