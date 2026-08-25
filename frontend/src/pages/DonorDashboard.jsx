
import { useState, useEffect } from 'react'

// ── Placeholder mock data ───────────────────────────────────
// Shaped like the real Django objects (DonationPost, MealRequest,
// Notification). This will be replaced by real data fetched from
// a Django API endpoint in Phase 14. Nothing here is saved anywhere.

const mockUser = { username: 'demo_donor' }

const mockStats = { total: 3, pending: 1, matched: 1, completed: 1 }

const mockNotificationsInit = [
  { id: 1, message: 'Your donation "Chicken Momo" was matched with bal_mandir.' },
]

const mockOpenRequests = [
  {
    id: 101,
    meal_type: 'Lunch',
    receiver_username: 'bal_mandir',
    people_count: 25,
    preferred_date: '2026-09-02',
    notes: 'Please include rice and dal if possible.',
  },
  {
    id: 102,
    meal_type: 'Dinner',
    receiver_username: 'old_age_home_ktm',
    people_count: 15,
    preferred_date: '2026-09-05',
    notes: '',
  },
]

const mockMyPosts = [
  {
    id: 201,
    meal_description: 'Dal Bhat Tarkari',
    people_count: 20,
    donation_date: '2026-08-28',
    preparation_method: 'home_cooked',
    status: 'pending',
    matches: [],
  },
  {
    id: 202,
    meal_description: 'Chicken Momo',
    people_count: 30,
    donation_date: '2026-08-25',
    preparation_method: 'restaurant',
    status: 'matched',
    matches: [{ receiver_username: 'bal_mandir' }],
  },
  {
    id: 203,
    meal_description: 'Vegetable Khichdi',
    people_count: 10,
    donation_date: '2026-08-20',
    preparation_method: 'home_cooked',
    status: 'completed',
    matches: [],
  },
]

function DonorDashboard() {
  const [notifications, setNotifications] = useState(mockNotificationsInit)
  const [posts] = useState(mockMyPosts)
  const [openRequests] = useState(mockOpenRequests)

  // Tracks which modal is currently open: null, 'add', or `feed-${id}`
  const [activeModal, setActiveModal] = useState(null)

  const openModal = (id) => setActiveModal(id)
  const closeModal = () => setActiveModal(null)

  // Escape key closes whichever modal is open (matches main.js behavior)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') closeModal()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Body scroll lock while a modal is open (matches main.js behavior)
  useEffect(() => {
    document.body.style.overflow = activeModal ? 'hidden' : ''
  }, [activeModal])

  // Click on the overlay backdrop (not the modal itself) closes it
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) closeModal()
  }

  const handleMarkRead = (id) => {
    // Real backend call happens in Phase 14. For now, just remove
    // it locally so the UI behaves like the notification was read.
    console.log('Mark notification read (not yet connected to Django):', id)
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }

  const handleAddDonationSubmit = (e) => {
    e.preventDefault()
    const data = Object.fromEntries(new FormData(e.target))
    console.log('Post donation submitted (not yet connected to Django):', data)
    closeModal()
  }

  const handleRespondSubmit = (e, requestId) => {
    e.preventDefault()
    const data = Object.fromEntries(new FormData(e.target))
    console.log('Respond to request submitted (not yet connected to Django):', {
      requestId,
      ...data,
    })
    closeModal()
  }

  const handleDeleteSubmit = (e, postId) => {
    e.preventDefault()
    const confirmed = window.confirm('Delete this donation?')
    if (!confirmed) return
    console.log('Delete donation (not yet connected to Django):', postId)
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
            Welcome, <strong>{mockUser.username}</strong>!
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
          <span className="stat-number color-green">{mockStats.total}</span>
          <span className="stat-label">Total</span>
        </div>
        <div className="stat-card">
          <span className="stat-number color-warning">{mockStats.pending}</span>
          <span className="stat-label">Pending</span>
        </div>
        <div className="stat-card">
          <span className="stat-number color-primary">{mockStats.matched}</span>
          <span className="stat-label">Matched</span>
        </div>
        <div className="stat-card">
          <span className="stat-number color-green">{mockStats.completed}</span>
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
                <p className="text-muted small mb-3">
                  <i className="fas fa-calendar"></i> {req.preferred_date}
                </p>
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