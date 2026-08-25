function Home() {
  return (
    <>
      {/* Hero */}
      <section className="hero">
        <div className="container">
          <h1>
            <i className="fas fa-leaf"></i> FeedForward
          </h1>

          <p>
            Donate fresh meals to orphanages, old age homes and shelters.
          </p>

          <p className="hero-sub">
            Cook at home or order from a restaurant —
            we connect you to those in need.
          </p>

          <div className="hero-buttons">
            <a
              href="http://localhost:8000/register/"
              className="btn btn-outline"
            >
              <i className="fas fa-hand-holding-heart"></i> Donate a Meal
            </a>

            <a
              href="http://localhost:8000/register/"
              className="btn btn-green"
            >
              <i className="fas fa-users"></i> I Need Food Support
            </a>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="section">
        <div className="container">
          <h2 className="section-title">How FeedForward Works</h2>

          <p className="section-sub">
            Simple steps to donate fresh food to those in need.
          </p>

          <div className="grid-3">

            <div className="card">
              <div className="card-body text-center">
                <i
                  className="fas fa-user-plus fa-3x color-green mb-3"
                  style={{
                    display: "block",
                    fontSize: "2.5rem",
                    marginBottom: "12px",
                  }}
                ></i>

                <h5 className="fw-bold mb-2">1. Register</h5>

                <p className="text-muted">
                  Sign up as a Donor or Receiver.
                  Takes less than a minute.
                </p>
              </div>
            </div>

            <div className="card">
              <div className="card-body text-center">
                <i
                  className="fas fa-utensils fa-3x color-green"
                  style={{
                    display: "block",
                    fontSize: "2.5rem",
                    marginBottom: "12px",
                  }}
                ></i>

                <h5 className="fw-bold mb-2">
                  2. Plan a Fresh Meal
                </h5>

                <p className="text-muted">
                  Donors cook at home or order from a restaurant.
                  Receivers post what they need.
                </p>
              </div>
            </div>

            <div className="card">
              <div className="card-body text-center">
                <i
                  className="fas fa-robot"
                  style={{
                    display: "block",
                    fontSize: "2.5rem",
                    color: "var(--green-main)",
                    marginBottom: "12px",
                  }}
                ></i>

                <h5 className="fw-bold mb-2">
                  3. Smart Match
                </h5>

                <p className="text-muted">
                  Our system connects donors with the
                  most suitable receiver.
                </p>
              </div>
            </div>

            <div className="card">
              <div className="card-body text-center">
                <i
                  className="fas fa-bell"
                  style={{
                    display: "block",
                    fontSize: "2.5rem",
                    color: "var(--green-main)",
                    marginBottom: "12px",
                  }}
                ></i>

                <h5 className="fw-bold mb-2">
                  4. Get Notified
                </h5>

                <p className="text-muted">
                  Both donor and receiver get instant
                  notifications when matched.
                </p>
              </div>
            </div>

            <div className="card">
              <div className="card-body text-center">
                <i
                  className="fas fa-check-circle"
                  style={{
                    display: "block",
                    fontSize: "2.5rem",
                    color: "var(--green-main)",
                    marginBottom: "12px",
                  }}
                ></i>

                <h5 className="fw-bold mb-2">
                  5. Deliver & Confirm
                </h5>

                <p className="text-muted">
                  Donor delivers the fresh meal.
                  Receiver confirms. Done!
                </p>
              </div>
            </div>

            <div className="card">
              <div className="card-body text-center">
                <i
                  className="fas fa-chart-bar"
                  style={{
                    display: "block",
                    fontSize: "2.5rem",
                    color: "var(--green-main)",
                    marginBottom: "12px",
                  }}
                ></i>

                <h5 className="fw-bold mb-2">
                  6. Track Impact
                </h5>

                <p className="text-muted">
                  See your donation history and
                  total meals served.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Why Fresh */}
      <section className="section section-green">
        <div className="container text-center">

          <h2 className="section-title">
            Why Fresh Food Only?
          </h2>

          <p className="section-sub">
            FeedForward is different. We don't deal with leftovers.
          </p>

          <div className="grid-3">

            <div>
              <i
                className="fas fa-heart"
                style={{
                  fontSize: "2rem",
                  color: "var(--green-main)",
                  marginBottom: "8px",
                  display: "block",
                }}
              ></i>

              <h6 className="fw-bold mb-1">
                Dignity
              </h6>

              <p className="text-muted small">
                Recipients receive fresh meals, not leftovers.
              </p>
            </div>

            <div>
              <i
                className="fas fa-shield-alt"
                style={{
                  fontSize: "2rem",
                  color: "var(--green-main)",
                  marginBottom: "8px",
                  display: "block",
                }}
              ></i>

              <h6 className="fw-bold mb-1">
                Quality
              </h6>

              <p className="text-muted small">
                Fresh food means better nutrition and safety.
              </p>
            </div>

            <div>
              <i
                className="fas fa-hands-helping"
                style={{
                  fontSize: "2rem",
                  color: "var(--green-main)",
                  marginBottom: "8px",
                  display: "block",
                }}
              ></i>

              <h6 className="fw-bold mb-1">
                Intentional Giving
              </h6>

              <p className="text-muted small">
                Every donation is planned specifically
                for those in need.
              </p>
            </div>

          </div>
        </div>
      </section>
    </>
  );
}

export default Home;