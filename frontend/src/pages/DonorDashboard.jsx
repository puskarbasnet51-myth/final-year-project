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

function DonorDashboard() {
  const [username, setUsername] = useState('')
  const [profileAddress, setProfileAddress] = useState('')

  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    matched: 0,
    completed: 0,
  })

  const [notifications, setNotifications] = useState([])
  const [openRequests, setOpenRequests] = useState([])
  const [posts, setPosts] = useState([])

  const [activeModal, setActiveModal] = useState(null)

  const [donationLocationChoice, setDonationLocationChoice] =
    useState('registered')

  const [customDonationLocation, setCustomDonationLocation] =
    useState('')

  const [responseLocationChoice, setResponseLocationChoice] =
    useState('registered')

  const [customResponseLocation, setCustomResponseLocation] =
    useState('')

  const [loading, setLoading] = useState(true)

  const openModal = (id) => setActiveModal(id)
  const closeModal = () => setActiveModal(null)

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

  async function loadDashboard() {
    try {
      setLoading(true)

      const response = await fetch(
        `${API_BASE}/api/donor-dashboard/`,
        {
          credentials: 'include',
        }
      )

      if (!response.ok) {
        throw new Error('Failed to load donor dashboard')
      }

      const data = await response.json()

      setUsername(data.username || '')
      setProfileAddress(data.profile_address || '')

      setStats(
        data.stats || {
          total: 0,
          pending: 0,
          matched: 0,
          completed: 0,
        }
      )

      setNotifications(data.notifications || [])
      setOpenRequests(data.open_requests || [])
      setPosts(data.my_posts || [])
    } catch (error) {
      console.error('Dashboard loading error:', error)
      alert('Could not load donor dashboard.')
    } finally {
      setLoading(false)
    }
  }

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      closeModal()
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
          prev.filter((notification) => notification.id !== id)
        )
      } else {
        alert(result.message || 'Could not mark notification as read.')
      }
    } catch (error) {
      console.error(error)
      alert('Something went wrong.')
    }
  }

  async function handleAddDonationSubmit(e) {
    e.preventDefault()

    const formData = new FormData(e.target)

    const data = {
      meal_description: formData.get('meal_description'),
      people_count: formData.get('people_count'),
      donation_date: formData.get('donation_date'),
      preparation_method: formData.get('preparation_method'),
      notes: formData.get('notes'),
      location_choice: donationLocationChoice,
      custom_location: customDonationLocation,
    }

    try {
      const result = await postToDjango('/api/donor/add/', data)

      if (result.success) {
        alert(result.message || 'Donation posted successfully.')

        e.target.reset()

        setDonationLocationChoice('registered')
        setCustomDonationLocation('')

        closeModal()

        await loadDashboard()
      } else {
        alert(result.message || 'Could not post donation.')
      }
    } catch (error) {
      console.error(error)
      alert('Something went wrong while posting the donation.')
    }
  }

  async function handleRespondSubmit(e, requestId) {
    e.preventDefault()

    const formData = new FormData(e.target)

    const data = {
      preparation_method: formData.get('preparation_method'),
      notes: formData.get('notes'),
      location_choice: responseLocationChoice,
      custom_location: customResponseLocation,
    }

    try {
      const result = await postToDjango(
        `/api/donor/respond/${requestId}/`,
        data
      )

      if (result.success) {
        alert(result.message || 'Donation response submitted.')

        setResponseLocationChoice('registered')
        setCustomResponseLocation('')

        closeModal()

        await loadDashboard()
      } else {
        alert(result.message || 'Could not respond to request.')
      }
    } catch (error) {
      console.error(error)
      alert('Something went wrong while responding.')
    }
  }

  async function handleDeleteSubmit(e, postId) {
    e.preventDefault()

    const confirmed = window.confirm(
      'Are you sure you want to delete this donation?'
    )

    if (!confirmed) {
      return
    }

    try {
      const result = await postToDjango(
        `/api/donor/delete/${postId}/`,
        {}
      )

      if (result.success) {
        alert(result.message || 'Donation deleted.')

        await loadDashboard()
      } else {
        alert(result.message || 'Could not delete donation.')
      }
    } catch (error) {
      console.error(error)
      alert('Something went wrong while deleting.')
    }
  }

  if (loading) {
    return (
      <div className="container">
        <div className="empty-state">
          <p>Loading donor dashboard...</p>
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
            <i className="fas fa-hand-holding-heart"></i>{' '}
            Donor Dashboard
          </h1>

          <p className="page-subtitle">
            Welcome, <strong>{username}</strong>!
          </p>
        </div>

        <button
          className="btn btn-green"
          onClick={() => openModal('add')}
        >
          <i className="fas fa-plus"></i> Post a Donation
        </button>
      </div>

      {/* Notifications */}
      {notifications.map((notif) => (
        <div className="notif-bar mb-2" key={notif.id}>
          <span>
            <i className="fas fa-bell"></i> {notif.message}
          </span>

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
          <span className="stat-number color-green">
            {stats.total}
          </span>

          <span className="stat-label">
            Total
          </span>
        </div>

        <div className="stat-card">
          <span className="stat-number color-warning">
            {stats.pending}
          </span>

          <span className="stat-label">
            Pending
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
            {stats.completed}
          </span>

          <span className="stat-label">
            Completed
          </span>
        </div>

      </div>

      {/* Organizations Waiting */}
      <h2
        className="page-title mb-1"
        style={{ fontSize: '1.4rem' }}
      >
        <i className="fas fa-building"></i>{' '}
        Organizations Waiting for Food
      </h2>

      <p className="text-muted mb-3">
        Click <strong>I Will Feed Them</strong> to respond.
      </p>

      {openRequests.length > 0 ? (

        <div className="grid-3 mb-5">

          {openRequests.map((req) => (

            <div key={req.id}>

              <div className="open-request-card">

                <span className="badge badge-success mb-2">
                  Open
                </span>

                <h5 className="fw-bold mb-1">
                  {req.meal_type}
                </h5>

                <p className="text-muted small mb-1">
                  <i className="fas fa-building"></i>{' '}
                  {req.receiver_username}
                </p>

                <p className="text-muted small mb-1">
                  <i className="fas fa-users"></i>{' '}
                  {req.people_count} people
                </p>

                <p className="text-muted small mb-1">
                  <i className="fas fa-calendar"></i>{' '}
                  {req.preferred_date}
                </p>

                {/* REQUEST LOCATION */}
                {req.request_location && (
                  <p className="text-muted small mb-3">
                    <i className="fas fa-map-marker-alt"></i>{' '}
                    <strong>Request Location:</strong>{' '}
                    {req.request_location}
                  </p>
                )}

                {req.notes && (
                  <p className="text-muted small mb-3">
                    {req.notes}
                  </p>
                )}

                <button
                  className="btn btn-green btn-full"
                  onClick={() =>
                    openModal(`feed-${req.id}`)
                  }
                >
                  <i className="fas fa-heart"></i>{' '}
                  I Will Feed Them!
                </button>

              </div>

              {/* Respond Modal */}
              <div
                className={`modal-overlay ${
                  activeModal === `feed-${req.id}`
                    ? 'active'
                    : ''
                }`}
                onClick={handleOverlayClick}
              >

                <div className="modal">

                  <div className="modal-header">

                    <h5>
                      <i className="fas fa-heart"></i>{' '}
                      Confirm Donation
                    </h5>

                    <button
                      className="modal-close"
                      onClick={closeModal}
                    >
                      ×
                    </button>

                  </div>

                  <div className="modal-body">

                    <div className="alert alert-success">

                      <strong>
                        Organization:
                      </strong>{' '}
                      {req.receiver_username}
                      <br />

                      <strong>Meal:</strong>{' '}
                      {req.meal_type}
                      <br />

                      <strong>People:</strong>{' '}
                      {req.people_count}
                      <br />

                      <strong>Date:</strong>{' '}
                      {req.preferred_date}
                      <br />

                      {req.request_location && (
                        <>
                          <strong>
                            Request Location:
                          </strong>{' '}
                          {req.request_location}
                        </>
                      )}

                    </div>

                    <form
                      onSubmit={(e) =>
                        handleRespondSubmit(e, req.id)
                      }
                    >

                      <div className="form-group">

                        <label className="form-label">
                          How will you prepare?
                        </label>

                        <select
                          name="preparation_method"
                          className="form-control"
                        >
                          <option value="home_cooked">
                            🏠 Cook at home
                          </option>

                          <option value="restaurant">
                            🍽️ Order from restaurant
                          </option>
                        </select>

                      </div>

                      {/* DONATION LOCATION */}
                      <div className="form-group">

                        <label className="form-label">
                          Donation Location *
                        </label>

                        <div>
                          <label>
                            <input
                              type="radio"
                              name="response_location_choice"
                              value="registered"
                              checked={
                                responseLocationChoice ===
                                'registered'
                              }
                              onChange={() => {
                                setResponseLocationChoice(
                                  'registered'
                                )
                                setCustomResponseLocation('')
                              }}
                            />{' '}
                            Use my registered address
                          </label>
                        </div>

                        <div style={{ marginTop: '8px' }}>
                          <label>
                            <input
                              type="radio"
                              name="response_location_choice"
                              value="custom"
                              checked={
                                responseLocationChoice ===
                                'custom'
                              }
                              onChange={() =>
                                setResponseLocationChoice(
                                  'custom'
                                )
                              }
                            />{' '}
                            Use a different location
                          </label>
                        </div>

                        {responseLocationChoice ===
                          'registered' && (
                          <p className="text-muted small mt-2">
                            <i className="fas fa-map-marker-alt"></i>{' '}
                            {profileAddress ||
                              'No registered address found.'}
                          </p>
                        )}

                        {responseLocationChoice ===
                          'custom' && (
                          <input
                            type="text"
                            className="form-control mt-2"
                            placeholder="Enter donation location"
                            value={customResponseLocation}
                            onChange={(e) =>
                              setCustomResponseLocation(
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
                          placeholder="Message for receiver..."
                        ></textarea>

                      </div>

                      <button
                        type="submit"
                        className="btn btn-green btn-full"
                      >
                        <i className="fas fa-check"></i>{' '}
                        Confirm — I Will Feed Them!
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

          <p>
            All requests matched. Check back soon!
          </p>

        </div>

      )}

      {/* My Donations */}
      <h2
        className="page-title mb-3"
        style={{ fontSize: '1.4rem' }}
      >
        <i className="fas fa-history"></i>{' '}
        My Donations
      </h2>

      {posts.length > 0 ? (

        <div className="grid-3">

          {posts.map((post) => (

            <div className="card" key={post.id}>

              <div className="card-body">

                <h5 className="fw-bold mb-1">
                  {post.meal_description}
                </h5>

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
                    : '🍽️ Restaurant'}
                </p>

                {/* DONATION LOCATION */}
                {post.donation_location && (
                  <p className="text-muted small mb-2">
                    <i className="fas fa-map-marker-alt"></i>{' '}
                    <strong>Donation Location:</strong>{' '}
                    {post.donation_location}
                  </p>
                )}

                {post.status === 'pending' && (
                  <span className="badge badge-warning">
                    Pending
                  </span>
                )}

                {post.status === 'matched' && (
                  <>
                    <span className="badge badge-primary">
                      Matched ✓
                    </span>

                    {post.matches &&
                      post.matches.map(
                        (match, idx) => (
                          <div
                            className="match-box"
                            key={idx}
                          >
                            <p>
                              <i className="fas fa-building"></i>{' '}
                              {match.receiver_username}
                            </p>
                          </div>
                        )
                      )}
                  </>
                )}

                {post.status === 'completed' && (
                  <span className="badge badge-success">
                    Completed ✓
                  </span>
                )}

                {post.status !== 'completed' && (
                  <form
                    style={{ marginTop: '12px' }}
                    onSubmit={(e) =>
                      handleDeleteSubmit(
                        e,
                        post.id
                      )
                    }
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

          <i className="fas fa-hand-holding-heart"></i>

          <p>
            No donations yet. Help an organization above!
          </p>

        </div>

      )}

      {/* Post Donation Modal */}
      <div
        className={`modal-overlay ${
          activeModal === 'add' ? 'active' : ''
        }`}
        onClick={handleOverlayClick}
      >

        <div className="modal">

          <div className="modal-header">

            <h5>
              <i className="fas fa-plus"></i>{' '}
              Post a Donation
            </h5>

            <button
              className="modal-close"
              onClick={closeModal}
            >
              ×
            </button>

          </div>

          <div className="modal-body">

            <form onSubmit={handleAddDonationSubmit}>

              <div className="form-group">

                <label className="form-label">
                  Meal Description *
                </label>

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

                  <label className="form-label">
                    People *
                  </label>

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

                  <label className="form-label">
                    Date *
                  </label>

                  <input
                    type="date"
                    name="donation_date"
                    className="form-control"
                    required
                  />

                </div>

              </div>

              <div className="form-group">

                <label className="form-label">
                  Preparation
                </label>

                <select
                  name="preparation_method"
                  className="form-control"
                >
                  <option value="home_cooked">
                    🏠 Cook at home
                  </option>

                  <option value="restaurant">
                    🍽️ Restaurant
                  </option>
                </select>

              </div>

              {/* DONATION LOCATION */}
              <div className="form-group">

                <label className="form-label">
                  Donation Location *
                </label>

                <div>

                  <label>
                    <input
                      type="radio"
                      name="donation_location_choice"
                      value="registered"
                      checked={
                        donationLocationChoice ===
                        'registered'
                      }
                      onChange={() => {
                        setDonationLocationChoice(
                          'registered'
                        )
                        setCustomDonationLocation('')
                      }}
                    />{' '}
                    Use my registered address
                  </label>

                </div>

                <div style={{ marginTop: '8px' }}>

                  <label>
                    <input
                      type="radio"
                      name="donation_location_choice"
                      value="custom"
                      checked={
                        donationLocationChoice ===
                        'custom'
                      }
                      onChange={() =>
                        setDonationLocationChoice(
                          'custom'
                        )
                      }
                    />{' '}
                    Use a different location
                  </label>

                </div>

                {donationLocationChoice ===
                  'registered' && (
                  <p className="text-muted small mt-2">
                    <i className="fas fa-map-marker-alt"></i>{' '}
                    {profileAddress ||
                      'No registered address found.'}
                  </p>
                )}

                {donationLocationChoice ===
                  'custom' && (
                  <input
                    type="text"
                    className="form-control mt-2"
                    placeholder="Enter donation location"
                    value={customDonationLocation}
                    onChange={(e) =>
                      setCustomDonationLocation(
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
                ></textarea>

              </div>

              <button
                type="submit"
                className="btn btn-green btn-full"
              >
                <i className="fas fa-paper-plane"></i>{' '}
                Post Donation
              </button>

            </form>

          </div>

        </div>

      </div>

    </div>
  )
}

export default DonorDashboard