


import { Link } from 'react-router-dom'

function Profile() {
  return (
    <div
      className="container"
      style={{
        paddingTop: '60px',
        paddingBottom: '60px',
      }}
    >
      <div style={{ maxWidth: '650px', margin: '0 auto' }}>
        <div className="card">

          <div className="card-header-green text-center">
            <h3 style={{ fontSize: '1.4rem', fontWeight: 700 }}>
              <i className="fas fa-user"></i>{' '}
              My Profile
            </h3>
          </div>

          <div className="card-body">

            <div className="form-group">
              <label className="form-label">
                Username
              </label>

              <input
                type="text"
                className="form-control"
                value="Logged in user"
                readOnly
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Email
              </label>

              <input
                type="email"
                className="form-control"
                value="User email"
                readOnly
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Role
              </label>

              <input
                type="text"
                className="form-control"
                value="Donor / Receiver"
                readOnly
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Organization
              </label>

              <input
                type="text"
                className="form-control"
                value="Organization"
                readOnly
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Phone
              </label>

              <input
                type="text"
                className="form-control"
                value="Phone number"
                readOnly
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Address
              </label>

              <textarea
                className="form-control"
                rows="3"
                value="Address"
                readOnly
              />
            </div>

            <div style={{ marginTop: '20px' }}>
              <Link
                to="/"
                className="btn btn-green"
              >
                <i className="fas fa-home"></i>{' '}
                Back to Home
              </Link>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile

