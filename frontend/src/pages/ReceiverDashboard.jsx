

import { useState, useEffect } from 'react'

const mockUser = {
  username: 'demo_receiver',
}

const mockStats = {
  total_requests: 3,
  open_requests: 1,
  matched: 1,
}

const mockNotificationsInit = [
  {
    id: 1,
    message: 'A donor has committed to provide fresh food for your organization.',
  },
]

const mockAvailableDonations = [
  {
    id: 301,
    meal_description: 'Dal Bhat Tarkari',
    donor_username: 'john_donor',
    people_count: 20,
    donation_date: '2026-08-28',
    preparation_method: 'home_cooked',
  },
  {
    id: 302,
    meal_description: 'Chicken Momo',
    donor_username: 'ram_donor',
    people_count: 15,
    donation_date: '2026-08-30',
    preparation_method: 'restaurant',
  },
]

const mockIncomingDonations = [
  {
    id: 401,
    meal_description: 'Vegetable Khichdi',
    donor_username: 'sita_donor',
    people_count: 25,
    donation_date: '2026-08-27',
    preparation_method: 'home_cooked',
    pickup_status: 'pending',
    match_id: 501,
  },
]

const mockRequests = [
  {
    id: 601,
    meal_type: 'Lunch',
    people_count: 30,
    preferred_date: '2026-09-02',
    notes: 'Vegetarian food preferred.',
    status: 'open',
    matches: [],
  },
  {
    id: 602,
    meal_type: 'Dinner',
    people_count: 20,
    preferred_date: '2026-08-29',
    notes: 'Please include rice and dal.',
    status: 'matched',
    matches: [
      {
        donor_username: 'sita_donor',
        donation_date: '2026-08-29',
        preparation_method: 'home_cooked',
        pickup_status: 'pending',
      },
    ],
  },
  {
    id: 603,
    meal_type: 'Breakfast',
    people_count: 15,
    preferred_date: '2026-08-20',
    notes: '',
    status: 'closed',
    matches: [],
  },
]

function ReceiverDashboard() {
  const [notifications, setNotifications] = useState(mockNotificationsInit)
  const [availableDonations] = useState(mockAvailableDonations)
  const [incomingDonations] = useState(mockIncomingDonations)
  const [requests] = useState(mockRequests)

  const [activeModal, setActiveModal] = useState(null)

  const openModal = () => {
    setActiveModal('addRequest')
  }

  const closeModal = () => {
    setActiveModal(null)
  }

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

  const handleMarkRead = (id) => {
    console.log(
      'Mark notification read (not connected to Django yet):',
      id
    )

    setNotifications((prev) =>
      prev.filter((notification) => notification.id !== id)
    )
  }

  const handleClaimDonation = (donationId) => {
    console.log(
      'Claim donation (not connected to Django yet):',
      donationId
    )

    alert('Donation claimed successfully!')

  }

  const handleConfirmReceived = (matchId) => {
    console.log(
      'Confirm food received (not connected to Django yet):',
      matchId
    )

    alert('Food received successfully! Donation completed.')
  }

  const handleDeleteRequest = (requestId) => {
    const confirmed = window.confirm(
      'Delete this request?'
    )

    if (!confirmed) return

    console.log(
      'Delete request (not connected to Django yet):',
      requestId
    )
  }

  const handlePostRequest = (e) => {
    e.preventDefault()

    const data = Object.fromEntries(
      new FormData(e.target)
    )

    console.log(
      'Meal request submitted (not connected to Django yet):',
      data
    )

    closeModal()
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
            Welcome, <strong>{mockUser.username}</strong>!
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
      <div className="grid-3 mb-5">

        <div className="stat-card">
          <span className="stat-number color-green">
            {mockStats.total_requests}
          </span>

          <span className="stat-label">
            Total Requests
          </span>
        </div>

        <div className="stat-card">
          <span className="stat-number color-warning">
            {mockStats.open_requests}
          </span>

          <span className="stat-label">
            Open
          </span>
        </div>

        <div className="stat-card">
          <span className="stat-number color-primary">
            {mockStats.matched}
          </span>

          <span className="stat-label">
            Matched
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
                For {donation.people_count} people —
                {' '}
                {donation.donation_date}
              </p>

              <p className="small text-muted">
                {donation.preparation_method ===
                'home_cooked'
                  ? '🏠 Home Cooked'
                  : '🍽️ Restaurant Ordered'}
              </p>

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

                <p className="text-muted small mb-3">
                  {post.preparation_method ===
                  'home_cooked'
                    ? '🏠 Home Cooked'
                    : '🍽️ Restaurant Ordered'}
                </p>


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

                    {request.matches.map(
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
                      handleDeleteRequest(
                        request.id
                      )
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