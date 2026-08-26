

import { Link } from 'react-router-dom'

function About() {
  return (
    <>
      {/* Hero */}
      <section className="hero">
        <div className="container">
          <h1>
            <i className="fas fa-leaf"></i> About FeedForward
          </h1>
          <p>
            A platform built on the belief that anyone can make a
            difference — one fresh meal at a time.
          </p>
        </div>
      </section>

      {/* What is FeedForward */}
      <section className="section">
        <div className="container">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '40px',
              alignItems: 'center',
            }}
          >
            <div>
              <h2
                style={{
                  color: 'var(--green-main)',
                  fontSize: '1.8rem',
                  fontWeight: 700,
                  marginBottom: '16px',
                }}
              >
                What is FeedForward?
              </h2>

              <p className="text-muted" style={{ marginBottom: '16px' }}>
                FeedForward is a web-based Fresh Individual Food Donation
                Management Platform that connects individuals who wish to
                donate freshly prepared meals with NGOs, orphanages, and
                old age homes in need of regular food support.
              </p>

              <p className="text-muted">
                Unlike other platforms that deal with leftover or surplus
                food, FeedForward focuses exclusively on fresh,
                intentionally prepared meals — either home-cooked or
                ordered from a local restaurant.
              </p>
            </div>

            <div className="card">
              <div className="card-body">
                <h5
                  className="fw-bold mb-2"
                  style={{ color: 'var(--green-main)' }}
                >
                  <i className="fas fa-bullseye"></i> Our Mission
                </h5>

                <p className="text-muted mb-0">
                  To make food donation simple, dignified, and accessible
                  for every individual in Nepal — turning personal
                  celebrations, religious occasions, and everyday goodwill
                  into organized, trackable social impact.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What makes us different */}
      <section className="section section-green">
        <div className="container">
          <h2 className="section-title">
            What Makes FeedForward Different
          </h2>

          <div className="grid-3">
            <div className="card">
              <div className="card-body text-center">
                <i
                  className="fas fa-utensils"
                  style={{
                    fontSize: '2.5rem',
                    color: 'var(--green-main)',
                    display: 'block',
                    marginBottom: '12px',
                  }}
                ></i>

                <h5 className="fw-bold mb-2">Fresh Food Only</h5>

                <p className="text-muted">
                  Every meal is freshly prepared — home-cooked or
                  restaurant-ordered. No leftovers. No surplus.
                </p>
              </div>
            </div>

            <div className="card">
              <div className="card-body text-center">
                <i
                  className="fas fa-robot"
                  style={{
                    fontSize: '2.5rem',
                    color: 'var(--green-main)',
                    display: 'block',
                    marginBottom: '12px',
                  }}
                ></i>

                <h5 className="fw-bold mb-2">Smart Matching</h5>

                <p className="text-muted">
                  Our system automatically connects donors with the most
                  suitable receiving organization.
                </p>
              </div>
            </div>

            <div className="card">
              <div className="card-body text-center">
                <i
                  className="fas fa-heart"
                  style={{
                    fontSize: '2.5rem',
                    color: 'var(--green-main)',
                    display: 'block',
                    marginBottom: '12px',
                  }}
                ></i>

                <h5 className="fw-bold mb-2">Dignity in Giving</h5>

                <p className="text-muted">
                  Recipients receive fresh meals — not leftovers. A
                  genuine culture of care and respect.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Who can use */}
      <section className="section">
        <div className="container">
          <h2 className="section-title">
            Who Can Use FeedForward?
          </h2>

          <div className="grid-3">
            {/* Donors */}
            <div className="card card-top-border">
              <div className="card-body">
                <h5
                  className="fw-bold mb-2"
                  style={{ color: 'var(--green-main)' }}
                >
                  <i className="fas fa-hand-holding-heart"></i>{' '}
                  Individual Donors
                </h5>

                <p className="text-muted mb-3">
                  Anyone who wants to donate food — on a birthday,
                  festival, religious day, or simply out of goodwill.
                  Cook at home or order from a restaurant.
                </p>

                <Link to="/register" className="btn btn-green btn-small">
                  <i className="fas fa-user-plus"></i> Register as Donor
                </Link>
              </div>
            </div>

            {/* Receivers */}
            <div
              className="card"
              style={{ borderTop: '4px solid var(--primary)' }}
            >
              <div className="card-body">
                <h5
                  className="fw-bold mb-2"
                  style={{ color: 'var(--primary)' }}
                >
                  <i className="fas fa-users"></i> Receivers
                </h5>

                <p className="text-muted mb-3">
                  NGOs, orphanages, old age homes, and shelters that need
                  regular fresh food support.
                </p>

                <Link
                  to="/register"
                  className="btn btn-small"
                  style={{
                    background: 'var(--primary)',
                    color: 'white',
                    borderRadius: '8px',
                    padding: '8px 16px',
                    textDecoration: 'none',
                    fontWeight: 600,
                  }}
                >
                  Register as Receiver
                </Link>
              </div>
            </div>

            {/* Administrators */}
            <div
              className="card"
              style={{ borderTop: '4px solid var(--warning)' }}
            >
              <div className="card-body">
                <h5
                  className="fw-bold mb-2"
                  style={{ color: 'var(--warning)' }}
                >
                  <i className="fas fa-shield-alt"></i> Administrators
                </h5>

                <p className="text-muted mb-3">
                  Platform managers who verify users, monitor donations,
                  and generate impact reports.
                </p>

                <a
                  href="/admin/"
                  className="btn btn-small"
                  style={{
                    background: 'var(--warning)',
                    color: 'white',
                    borderRadius: '8px',
                    padding: '8px 16px',
                    textDecoration: 'none',
                    fontWeight: 600,
                  }}
                >
                  Admin Panel
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Developer information */}
      <section className="section section-green">
        <div className="container text-center">
          <h2 className="section-title">About the Developer</h2>

          <div
            className="card"
            style={{ maxWidth: '480px', margin: '0 auto' }}
          >
            <div className="card-body">
              <div className="avatar-circle">
                <i className="fas fa-user"></i>
              </div>

              <h4 className="fw-bold mb-1">Pushkar Basnet</h4>

              <p className="text-muted mb-1">
                BIT 7th Semester
              </p>

              <p className="text-muted mb-1">
                Texas College of Management &amp; IT, Kathmandu
              </p>

              <p className="text-muted mb-3">
                Lincoln University College, Malaysia
              </p>

              <div
                style={{
                  display: 'flex',
                  gap: '8px',
                  justifyContent: 'center',
                  flexWrap: 'wrap',
                }}
              >
                <span
                  className="badge badge-success"
                  style={{ padding: '8px 14px' }}
                >
                  Django
                </span>

                <span
                  className="badge badge-primary"
                  style={{ padding: '8px 14px' }}
                >
                  MySQL
                </span>

                <span
                  className="badge badge-success"
                  style={{ padding: '8px 14px' }}
                >
                  HTML / CSS / JS
                </span>

                <span
                  className="badge badge-warning"
                  style={{ padding: '8px 14px' }}
                >
                  AI / ML
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section
        className="hero"
        style={{ padding: '60px 20px' }}
      >
        <div className="container text-center">
          <h2
            style={{
              fontSize: '2rem',
              fontWeight: 700,
              marginBottom: '12px',
            }}
          >
            Ready to Make a Difference?
          </h2>

          <p
            style={{
              opacity: 0.85,
              marginBottom: '32px',
            }}
          >
            Join FeedForward today and help ensure no one goes to bed
            hungry.
          </p>

          <div className="hero-buttons">
            <Link to="/register" className="btn btn-outline">
              <i className="fas fa-user-plus"></i> Get Started
            </Link>

            <Link to="/" className="btn btn-green">
              <i className="fas fa-home"></i> Back to Home
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}

export default About