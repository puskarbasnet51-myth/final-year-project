import { useState, useEffect } from 'react'

const API_BASE = 'http://localhost:8000'

// Shared helper: makes sure Django has set the csrftoken cookie,
// then POSTs form-encoded data with the CSRF header attached.
// Mirrors the exact pattern already used in Login.jsx.
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

function DonorDashboard() {
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  const [username, setUsername] = useState('')
  const [profileAddress, setProfileAddress] = useState('')
  const [stats, setStats] = useState({ total: 0, pending: 0, matched: 0, completed: 0 })
  const [notifications, setNotifications] = useState([])
  const [openRequests, setOpenRequests] = useState([])
  const [posts, setPosts] = useState([])

  // Tracks which modal is open: null, 'add', or `feed-${id}`
  const [activeModal, setActiveModal] = useState(null)

  // Location choice state for the "Post a Donation" modal
  const [addLocationChoice, setAddLocationChoice] = useState('registered')
  const [addCustomLocation, setAddCustomLocation] = useState('')

  // Location choice state for the "Respond" modal (keyed by request id)
  const [respondLocationChoice, setRespondLocationChoice] = useState('registered')
  const [respondCustomLocation, setRespondCustomLocation] = useState('')

  const loadDashboard = () => {
    setLoading(true)
    setLoadError('')
    fetch(`${API_BASE}/api/donor-dashboard/`, { credentials: 'include' })
      .then((res) => {
        if (!res.ok) throw new Error('Request failed')
        return res.json()
      })
      .then((data) => {
        setUsername(data.username)
        setProfileAddress(data.profile_address)
        setStats(data.stats)
        setNotifications(data.notifications)
        setOpenRequests(data.open_requests)
        setPosts(data.my_posts)
      })
      .catch(() => {
        setLoadError('Could not load your dashboard. Is Django running and are you logged in as a donor?')
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadDashboard()
  }, [])

  const openModal = (id) => {
    setActiveModal(id)
    setAddLocationChoice('registered')
    setAddCustomLocation('')
    setRespondLocationChoice('registered')
    setRespondCustomLocation('')
  }

  const closeModal = () => setActiveModal(null)

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') closeModal()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  useEffect(() => {
    document.body.style.overflow = activeModal ? 'hidden' : ''
  }, [activeModal])

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) closeModal()
  }

  const handleMarkRead = async (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
    await postToDjango(`/api/notification/read/${id}/`, {})
  }

  const handleAddDonationSubmit = async (e) => {
    e.preventDefault()
    const formValues = Object.fromEntries(new FormData(e.target))

    if (addLocationChoice === 'custom' && !addCustomLocation.trim()) {
      alert('Please enter a donation location.')
      return
    }

    const result = await postToDjango('/api/donor/add/', {
      ...formValues,
      location_choice: addLocationChoice,
      custom_location: addCustomLocation,
    })

    if (result.success) {
      closeModal()
      loadDashboard()
    } else {
      alert(result.message || 'Could not post donation.')
    }
  }

  const handleRespondSubmit = async (e, requestId) => {
    e.preventDefault()
    const formValues = Object.fromEntries(new FormData(e.target))

    if (respondLocationChoice === 'custom' && !respondCustomLocation.trim()) {
      alert('Please enter a donation location.')
      return
    }

    const result = await postToDjango(`/api/donor/respond/${requestId}/`, {
      ...formValues,
      location_choice: respondLocationChoice,
      custom_location: respondCustomLocation,
    })

    if (result.success) {
      closeModal()
      loadDashboard()
    } else {
      alert(result.message || 'Could not respond to request.')
    }
  }

  const handleMarkReady = async (matchId) => {
  const result = await postToDjango(
    `/api/donor/food-ready/${matchId}/`,
    {}
  )

  if (result.success) {
    loadDashboard()
  } else {
    alert(
      result.message ||
      'Could not mark food as ready.'
    )
  }
}

  if (loading) {
    return (
      <div className="container" style={{ paddingTop: '60px' }}>
        <p className="text-center text-muted">Loading your dashboard...</p>
      </div>
    )
  }

  if (loadError) {
    return (
      <div className="container" style={{ paddingTop: '60px' }}>
        <div className="message message-error">{loadError}</div>
      </div>
    )
  }

  return (
    <div className="container">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <i className="fas fa-hand-holding-heart"></i> Donor Dashboard
          </h1>
          <p className="page-subtitle">
            Welcome, <strong>{username}</strong>!
          </p>
        </div>
        <button className="btn btn-green" onClick={() => openModal('add')}>
          <i className="fas fa-plus"></i> Post a Donation
        </button>
      </div>

      {/* Notifications */}
      {notifications.map((notif) => (
        <div className="notif-bar mb-2" key={notif.id}>
          <span><i className="fas fa-bell"></i> {notif.message}</span>
          <button
            className="btn btn-small btn-warning-outline"
            onClick={() => handleMarkRead(notif.id)}
          >
            Mark Read
          </button>
        </div>
      ))}

      {/* Stats */}
      <div className="grid-4 mb-5">
        <div className="stat-card">
          <span className="stat-number color-green">{stats.total}</span>
          <span className="stat-label">Total</span>
        </div>
        <div className="stat-card">
          <span className="stat-number color-warning">{stats.pending}</span>
          <span className="stat-label">Pending</span>
        </div>
        <div className="stat-card">
          <span className="stat-number color-primary">{stats.matched}</span>
          <span className="stat-label">Matched</span>
        </div>
        <div className="stat-card">
          <span className="stat-number color-green">{stats.completed}</span>
          <span className="stat-label">Completed</span>
        </div>
      </div>

      {/* Organizations Waiting */}
      <h2 className="page-title mb-1" style={{ fontSize: '1.4rem' }}>
        <i className="fas fa-building"></i> Organizations Waiting for Food
      </h2>
      <p className="text-muted mb-3">
        Click <strong>I Will Feed Them</strong> to respond.
      </p>

      {openRequests.length > 0 ? (
        <div className="grid-3 mb-5">
          {openRequests.map((req) => (
            <div key={req.id}>
              <div className="open-request-card">
                <span className="badge badge-success mb-2">Open</span>
                <h5 className="fw-bold mb-1">{req.meal_type}</h5>
                <p className="text-muted small mb-1">
                  <i className="fas fa-building"></i> {req.receiver_username}
                </p>
                <p className="text-muted small mb-1">
                  <i className="fas fa-users"></i> {req.people_count} people
                </p>
                <p className="text-muted small mb-1">
                  <i className="fas fa-calendar"></i> {req.preferred_date}
                </p>
                {req.request_location && (
                  <p className="text-muted small mb-3">
                    <i className="fas fa-map-marker-alt"></i> {req.request_location}
                  </p>
                )}
                {req.notes && (
                  <p className="text-muted small mb-3">{req.notes}</p>
                )}
                <button
                  className="btn btn-green btn-full"
                  onClick={() => openModal(`feed-${req.id}`)}
                >
                  <i className="fas fa-heart"></i> I Will Feed Them!
                </button>
              </div>

              {/* Feed Modal */}
              <div
                className={`modal-overlay ${activeModal === `feed-${req.id}` ? 'active' : ''}`}
                onClick={handleOverlayClick}
              >
                <div className="modal">
                  <div className="modal-header">
                    <h5><i className="fas fa-heart"></i> Confirm Donation</h5>
                    <button className="modal-close" onClick={closeModal}>×</button>
                  </div>
                  <div className="modal-body">
                    <div className="alert alert-success">
                      <strong>Organization:</strong> {req.receiver_username}<br />
                      <strong>Meal:</strong> {req.meal_type}<br />
                      <strong>People:</strong> {req.people_count}<br />
                      <strong>Date:</strong> {req.preferred_date}
                    </div>
                    <form onSubmit={(e) => handleRespondSubmit(e, req.id)}>
                      <div className="form-group">
                        <label className="form-label">How will you prepare?</label>
                        <select name="preparation_method" className="form-control">
                          <option value="home_cooked">🏠 Cook at home</option>
                          <option value="restaurant">🍽️ Order from restaurant</option>
                        </select>
                      </div>

                      {/* Donation Location */}
                      <div className="form-group">
                        <label className="form-label">Donation Location</label>
                        <div className="mb-1">
                          <label style={{ display: 'block', fontWeight: 400 }}>
                            <input
                              type="radio"
                              name={`respond-location-${req.id}`}
                              checked={respondLocationChoice === 'registered'}
                              onChange={() => setRespondLocationChoice('registered')}
                            />{' '}
                            Use my registered address ({profileAddress || 'not set'})
                          </label>
                          <label style={{ display: 'block', fontWeight: 400 }}>
                            <input
                              type="radio"
                              name={`respond-location-${req.id}`}
                              checked={respondLocationChoice === 'custom'}
                              onChange={() => setRespondLocationChoice('custom')}
                            />{' '}
                            Use a different location
                          </label>
                        </div>
                        {respondLocationChoice === 'custom' && (
                          <input
                            type="text"
                            className="form-control"
                            placeholder="e.g. Thamel, Kathmandu"
                            value={respondCustomLocation}
                            onChange={(e) => setRespondCustomLocation(e.target.value)}
                          />
                        )}
                      </div>

                      <div className="form-group">
                        <label className="form-label">Notes (optional)</label>
                        <textarea
                          name="notes"
                          className="form-control"
                          rows="2"
                          placeholder="Message for receiver..."
                        ></textarea>
                      </div>
                      <button type="submit" className="btn btn-green btn-full">
                        <i className="fas fa-check"></i> Confirm — I Will Feed Them!
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state mb-5">
          <i className="fas fa-check-circle"></i>
          <p>All requests matched. Check back soon!</p>
        </div>
      )}

      {/* My Donations */}
      <h2 className="page-title mb-3" style={{ fontSize: '1.4rem' }}>
        <i className="fas fa-history"></i> My Donations
      </h2>

      {posts.length > 0 ? (
        <div className="grid-3">
          {posts.map((post) => (
            <div className="card" key={post.id}>
              <div className="card-body">
                <h5 className="fw-bold mb-1">{post.meal_description}</h5>
                <p className="text-muted small mb-1">
                  <i className="fas fa-users"></i> {post.people_count} people
                </p>
                <p className="text-muted small mb-1">
                  <i className="fas fa-calendar"></i> {post.donation_date}
                </p>
                {post.donation_location && (
                  <p className="text-muted small mb-1">
                    <i className="fas fa-map-marker-alt"></i> {post.donation_location}
                  </p>
                )}
                <p className="text-muted small mb-2">
                  {post.preparation_method === 'home_cooked'
                    ? '🏠 Home Cooked'
                    : '🍽️ Restaurant'}
                </p>

                {post.status === 'pending' && (
                  <span className="badge badge-warning">Pending</span>
                )}
                {post.status === 'matched' && (
  <>
    <span className="badge badge-primary">Matched ✓</span>

    {post.matches.map((match, idx) => (
      <div className="match-box" key={idx}>
        <p>
          <i className="fas fa-building"></i> {match.receiver_username}
        </p>

        {match.pickup_status === 'pending' && (
          <p className="text-muted small">
            Awaiting receiver's decision...
          </p>
        )}

        {match.pickup_status === 'confirmed' && (
  <>
    <p className="text-muted small">
      <strong>✓ Accepted!</strong> Please prepare and deliver the food.
    </p>

    <button
      type="button"
      className="btn btn-green btn-full"
      style={{ marginTop: '8px' }}
      onClick={() =>
        handleMarkReady(match.match_id)
      }
    >
      ✓ Food is Ready
    </button>
  </>
)}

{match.pickup_status === 'ready' && (
  <p className="text-muted small">
    <strong>✓ Marked Ready.</strong> Waiting for the receiver to confirm pickup.
  </p>
)}
      </div>
    ))}
  </>
)}
                {post.status === 'completed' && (
                  <span className="badge badge-success">Completed ✓</span>
                )}

                {post.status !== 'completed' && (
                  <form
                    style={{ marginTop: '12px' }}
                    onSubmit={(e) => handleDeleteSubmit(e, post.id)}
                  >
                    <button type="submit" className="btn btn-danger-outline btn-full">
                      <i className="fas fa-trash-alt"></i> Delete
                    </button>
                  </form>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <i className="fas fa-hand-holding-heart"></i>
          <p>No donations yet. Help an organization above!</p>
        </div>
      )}

      {/* Post Donation Modal */}
      <div
        className={`modal-overlay ${activeModal === 'add' ? 'active' : ''}`}
        onClick={handleOverlayClick}
      >
        <div className="modal">
          <div className="modal-header">
            <h5><i className="fas fa-plus"></i> Post a Donation</h5>
            <button className="modal-close" onClick={closeModal}>×</button>
          </div>
          <div className="modal-body">
            <form onSubmit={handleAddDonationSubmit}>
              <div className="form-group">
                <label className="form-label">Meal Description *</label>
                <input
                  type="text"
                  name="meal_description"
                  className="form-control"
                  placeholder="e.g. Dal Bhat, Momo"
                  required
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">People *</label>
                  <input
                    type="number"
                    name="people_count"
                    className="form-control"
                    min="1"
                    defaultValue="10"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Date *</label>
                  <input type="date" name="donation_date" className="form-control" required />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Preparation</label>
                <select name="preparation_method" className="form-control">
                  <option value="home_cooked">🏠 Cook at home</option>
                  <option value="restaurant">🍽️ Restaurant</option>
                </select>
              </div>

              {/* Donation Location */}
              <div className="form-group">
                <label className="form-label">Donation Location</label>
                <div className="mb-1">
                  <label style={{ display: 'block', fontWeight: 400 }}>
                    <input
                      type="radio"
                      name="add-location"
                      checked={addLocationChoice === 'registered'}
                      onChange={() => setAddLocationChoice('registered')}
                    />{' '}
                    Use my registered address ({profileAddress || 'not set'})
                  </label>
                  <label style={{ display: 'block', fontWeight: 400 }}>
                    <input
                      type="radio"
                      name="add-location"
                      checked={addLocationChoice === 'custom'}
                      onChange={() => setAddLocationChoice('custom')}
                    />{' '}
                    Use a different location
                  </label>
                </div>
                {addLocationChoice === 'custom' && (
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Thamel, Kathmandu"
                    value={addCustomLocation}
                    onChange={(e) => setAddCustomLocation(e.target.value)}
                  />
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Notes (optional)</label>
                <textarea name="notes" className="form-control" rows="2"></textarea>
              </div>
              <button type="submit" className="btn btn-green btn-full">
                <i className="fas fa-paper-plane"></i> Post Donation
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DonorDashboard