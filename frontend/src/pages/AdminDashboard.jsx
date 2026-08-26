

import { useEffect, useState } from 'react'

function AdminDashboard() {
  const [data, setData] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('http://localhost:8000/api/admin-dashboard/', {
      credentials: 'include',
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Could not load admin dashboard')
        }
        return response.json()
      })
      .then((result) => {
        setData(result)
      })
      .catch((error) => {
        console.error(error)
        setError('Could not load admin dashboard from Django.')
      })
  }, [])

  if (error) {
    return (
      <div
        className="container"
        style={{
          paddingTop: '60px',
          paddingBottom: '60px',
        }}
      >
        <div className="message message-error">
          {error}
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div
        className="container"
        style={{
          paddingTop: '60px',
          paddingBottom: '60px',
          textAlign: 'center',
        }}
      >
        <h3>Loading Admin Dashboard...</h3>
      </div>
    )
  }

  return (
    <div
      className="container"
      style={{
        paddingTop: '50px',
        paddingBottom: '60px',
      }}
    >

      {/* Title */}
      <h2
        style={{
          fontWeight: 700,
          marginBottom: '30px',
          color: '#2e7d32',
        }}
      >
        <i className="fas fa-shield-alt"></i>{' '}
        Admin Dashboard
      </h2>

      {/* Statistics */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
          gap: '15px',
          marginBottom: '50px',
        }}
      >

        <div className="card">
          <div className="card-body text-center">
            <h3 style={{ color: '#2e7d32', fontWeight: 700 }}>
              {data.total_users}
            </h3>
            <p className="text-muted mb-0">
              Users
            </p>
          </div>
        </div>

        <div className="card">
          <div className="card-body text-center">
            <h3 style={{ color: '#f9a825', fontWeight: 700 }}>
              {data.total_posts}
            </h3>
            <p className="text-muted mb-0">
              Donations
            </p>
          </div>
        </div>

        <div className="card">
          <div className="card-body text-center">
            <h3 style={{ color: '#1976d2', fontWeight: 700 }}>
              {data.total_requests}
            </h3>
            <p className="text-muted mb-0">
              Requests
            </p>
          </div>
        </div>

        <div className="card">
          <div className="card-body text-center">
            <h3 style={{ color: '#0288d1', fontWeight: 700 }}>
              {data.total_matches}
            </h3>
            <p className="text-muted mb-0">
              Matches
            </p>
          </div>
        </div>

        <div className="card">
          <div className="card-body text-center">
            <h3 style={{ color: '#d32f2f', fontWeight: 700 }}>
              {data.total_meals}
            </h3>
            <p className="text-muted mb-0">
              Meals Served
            </p>
          </div>
        </div>

      </div>


      {/* Donation Posts */}
      <h4 style={{ fontWeight: 700, marginBottom: '15px' }}>
        All Donation Posts
      </h4>

      <div style={{ overflowX: 'auto', marginBottom: '50px' }}>
        <table className="table table-bordered table-hover">

          <thead style={{
            background: '#2e7d32',
            color: 'white'
          }}>
            <tr>
              <th>#</th>
              <th>Donor</th>
              <th>Meal</th>
              <th>People</th>
              <th>Date</th>
              <th>Method</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            {data.posts.length > 0 ? (
              data.posts.map((post, index) => (
                <tr key={post.id || index}>
                  <td>{index + 1}</td>
                  <td>{post.donor}</td>
                  <td>{post.meal_description}</td>
                  <td>{post.people_count}</td>
                  <td>{post.donation_date}</td>
                  <td>
                    {post.preparation_method === 'home_cooked'
                      ? '🏠 Home Cooked'
                      : '🍽️ Restaurant'}
                  </td>
                  <td>
                    <span className="badge">
                      {post.status}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="7"
                  className="text-center text-muted"
                >
                  No donations yet.
                </td>
              </tr>
            )}
          </tbody>

        </table>
      </div>


      {/* Meal Requests */}
      <h4 style={{ fontWeight: 700, marginBottom: '15px' }}>
        All Meal Requests
      </h4>

      <div style={{ overflowX: 'auto', marginBottom: '50px' }}>
        <table className="table table-bordered table-hover">

          <thead style={{
            background: '#2e7d32',
            color: 'white'
          }}>
            <tr>
              <th>#</th>
              <th>Receiver</th>
              <th>Meal Type</th>
              <th>People</th>
              <th>Preferred Date</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            {data.requests.length > 0 ? (
              data.requests.map((request, index) => (
                <tr key={request.id || index}>
                  <td>{index + 1}</td>
                  <td>{request.receiver}</td>
                  <td>{request.meal_type}</td>
                  <td>{request.people_count}</td>
                  <td>{request.preferred_date}</td>
                  <td>
                    <span className="badge">
                      {request.status}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="6"
                  className="text-center text-muted"
                >
                  No requests yet.
                </td>
              </tr>
            )}
          </tbody>

        </table>
      </div>


      {/* Matches */}
      <h4 style={{ fontWeight: 700, marginBottom: '15px' }}>
        All Matches
      </h4>

      <div style={{ overflowX: 'auto', marginBottom: '50px' }}>
        <table className="table table-bordered table-hover">

          <thead style={{
            background: '#2e7d32',
            color: 'white'
          }}>
            <tr>
              <th>#</th>
              <th>Donor</th>
              <th>Meal</th>
              <th>Receiver</th>
              <th>Date</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            {data.matches.length > 0 ? (
              data.matches.map((match, index) => (
                <tr key={match.id || index}>
                  <td>{index + 1}</td>
                  <td>{match.donor}</td>
                  <td>{match.meal}</td>
                  <td>{match.receiver}</td>
                  <td>{match.date}</td>
                  <td>
                    <span className="badge">
                      {match.status}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="6"
                  className="text-center text-muted"
                >
                  No matches yet.
                </td>
              </tr>
            )}
          </tbody>

        </table>
      </div>


      {/* Users */}
      <h4 style={{ fontWeight: 700, marginBottom: '15px' }}>
        All Users
      </h4>

      <div style={{ overflowX: 'auto' }}>
        <table className="table table-bordered table-hover">

          <thead style={{
            background: '#2e7d32',
            color: 'white'
          }}>
            <tr>
              <th>#</th>
              <th>Username</th>
              <th>Email</th>
              <th>Role</th>
              <th>Organization</th>
              <th>Phone</th>
            </tr>
          </thead>

          <tbody>
            {data.profiles.length > 0 ? (
              data.profiles.map((profile, index) => (
                <tr key={profile.id || index}>
                  <td>{index + 1}</td>
                  <td>{profile.username}</td>
                  <td>{profile.email}</td>
                  <td>{profile.role}</td>
                  <td>{profile.organization}</td>
                  <td>{profile.phone}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="6"
                  className="text-center text-muted"
                >
                  No users yet.
                </td>
              </tr>
            )}
          </tbody>

        </table>
      </div>

    </div>
  )
}

export default AdminDashboard

