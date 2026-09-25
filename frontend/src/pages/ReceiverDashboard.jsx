import { useEffect, useState } from 'react'

const API_BASE = 'http://localhost:8000'

function getCookie(name) {
  let cookieValue = null

  if (document.cookie && document.cookie !== '') {
    const cookies = document.cookie.split(';')

    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim()

      if (
        cookie.substring(0, name.length + 1) ===
        (name + '=')
      ) {
        cookieValue = decodeURIComponent(
          cookie.substring(name.length + 1)
        )

        break
      }
    }
  }

  return cookieValue
}

function ReceiverDashboard() {
  const [dashboard, setDashboard] = useState(null)

  const [loading, setLoading] = useState(true)
  const [posting, setPosting] = useState(false)

  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const [showRequestForm, setShowRequestForm] = useState(false)

  const [predictionLoading, setPredictionLoading] = useState({})
  const [predictions, setPredictions] = useState({})

  const [requestForm, setRequestForm] = useState({
  food_name: '',
  people_count: '',
  needed_date: '',
  location: '',
  notes: '',
})

const [requestLocationChoice, setRequestLocationChoice] = useState('registered')
const [requestCustomLocation, setRequestCustomLocation] = useState('')

  // ============================================================
  // LOAD RECEIVER DASHBOARD
  // ============================================================

  const loadDashboard = async () => {
    setLoading(true)
    setErrorMessage('')

    try {
      const response = await fetch(
        `${API_BASE}/api/receiver-dashboard/`,
        {
          method: 'GET',
          credentials: 'include',
          headers: {
            Accept: 'application/json',
          },
        }
      )

      const contentType =
        response.headers.get('content-type') || ''

      if (!contentType.includes('application/json')) {
        const text = await response.text()

        console.error(
          'Receiver dashboard returned non-JSON:',
          text
        )

        throw new Error(
          'Django returned an unexpected response.'
        )
      }

      const result = await response.json()

      console.log(
        'Receiver dashboard:',
        result
      )

      if (!response.ok || result.success === false) {
        throw new Error(
          result.message ||
          'Could not load receiver dashboard.'
        )
      }

      setDashboard(result)

    } catch (error) {
      console.error(
        'Receiver dashboard error:',
        error
      )

      setErrorMessage(
        error.message ||
        'Could not connect to Django.'
      )

    } finally {
      setLoading(false)
    }
  }

  // ============================================================
  // LOAD DASHBOARD ON PAGE OPEN
  // ============================================================

  useEffect(() => {
    loadDashboard()
  }, [])

  // ============================================================
  // FORM CHANGE
  // ============================================================

  const handleRequestChange = (e) => {
    const { name, value } = e.target

    setRequestForm((previous) => ({
      ...previous,
      [name]: value,
    }))
  }

  // ============================================================
  // POST MEAL REQUEST
  // ============================================================

  const handlePostRequest = async (e) => {
  e.preventDefault()

  if (requestLocationChoice === 'custom' && !requestCustomLocation.trim()) {
    setErrorMessage('Please enter a location.')
    return
  }

  setPosting(true)
  setErrorMessage('')
  setSuccessMessage('')

  try {
    const formData = new FormData()

    formData.append('meal_type', requestForm.food_name)
    formData.append('people_count', requestForm.people_count)
    formData.append('preferred_date', requestForm.needed_date)
    formData.append('location_choice', requestLocationChoice)
    formData.append('custom_location', requestCustomLocation)
    formData.append('notes', requestForm.notes)

    const response = await fetch(
        `${API_BASE}/api/receiver/request/`,
        {
          method: 'POST',
          credentials: 'include',

          headers: {
            Accept: 'application/json',
            'X-CSRFToken': getCookie('csrftoken'),
          },

          body: formData,
        }
      )

      const contentType =
        response.headers.get('content-type') || ''

      if (!contentType.includes('application/json')) {
        const text = await response.text()

        console.error(
          'Post request returned non-JSON:',
          text
        )

        throw new Error(
          'Django returned an unexpected response.'
        )
      }

      const result = await response.json()

      console.log(
        'Post request response:',
        result
      )

      if (!response.ok || result.success === false) {
        throw new Error(
          result.message ||
          'Could not post meal request.'
        )
      }

      setSuccessMessage(
        result.message ||
        'Meal request posted successfully.'
      )

      setRequestForm({
  food_name: '',
  people_count: '',
  needed_date: '',
  location: '',
  notes: '',
})

setRequestLocationChoice('registered')
setRequestCustomLocation('')

setShowRequestForm(false)

      await loadDashboard()

    } catch (error) {
      console.error(
        'Post meal request error:',
        error
      )

      setErrorMessage(
        error.message ||
        'Could not post meal request.'
      )

    } finally {
      setPosting(false)
    }
  }

  // ============================================================
  // AI DONATION PREDICTION
  // (unchanged - reused for both Available Donations and
  // My Meal Requests donor offers)
  // ============================================================

  const checkPrediction = async (donationId) => {

    console.log(
      'Checking AI prediction for donation:',
      donationId
    )

    // IMPORTANT:
    // Never allow undefined/null donation IDs.
    if (
      donationId === undefined ||
      donationId === null ||
      donationId === '' ||
      donationId === 'undefined'
    ) {
      console.error(
        'AI ERROR: Donation ID is missing:',
        donationId
      )

      setErrorMessage(
        'AI prediction could not start because the donation ID is missing.'
      )

      return
    }

    setPredictionLoading((previous) => ({
      ...previous,
      [donationId]: true,
    }))

    setPredictions((previous) => ({
      ...previous,
      [donationId]: null,
    }))

    try {

      const response = await fetch(
        `${API_BASE}/api/receiver/donation-prediction/${donationId}/`,
        {
          method: 'GET',

          credentials: 'include',

          headers: {
            Accept: 'application/json',
          },
        }
      )

      console.log(
        'AI HTTP status:',
        response.status
      )

      const contentType =
        response.headers.get('content-type') || ''

      if (!contentType.includes('application/json')) {

        const text = await response.text()

        console.error(
          'AI endpoint returned non-JSON:',
          text
        )

        throw new Error(
          'AI prediction endpoint returned an unexpected response.'
        )
      }

      const result = await response.json()

      console.log(
        'AI prediction result:',
        result
      )

      if (
        !response.ok ||
        result.success === false
      ) {
        throw new Error(
          result.message ||
          'Could not get AI prediction.'
        )
      }

      let probability =
        result.probability

      if (
        probability === undefined ||
        probability === null
      ) {
        probability =
          result.prediction_probability
      }

      if (
        probability === undefined ||
        probability === null
      ) {
        probability =
          result.probability_percent
      }

      if (
        probability === undefined ||
        probability === null
      ) {
        probability =
          result.score
      }

      if (
        probability !== undefined &&
        probability !== null
      ) {
        probability =
          parseFloat(probability)
      }

      // If backend gives 0.82,
      // display 82%.
      if (
        probability !== undefined &&
        probability !== null &&
        probability <= 1
      ) {
        probability =
          probability * 100
      }

      if (
        probability !== undefined &&
        probability !== null &&
        !Number.isNaN(probability)
      ) {
        probability =
          Math.round(probability)
      }

      setPredictions((previous) => ({
        ...previous,

        [donationId]: {
          probability:
            probability,

          prediction:
            result.likely_to_complete === true
              ? 'Likely to complete'
              : result.likely_to_complete === false
              ? 'Not likely to complete'
              : '',

          likely_to_complete:
            result.likely_to_complete,

          previous_completed_count:
            result.previous_completed_count,

          previous_total_count:
            result.previous_total_count,

          previous_completion_rate:
            result.previous_completion_rate,
        },
      }))

    } catch (error) {

      console.error(
        'AI prediction error:',
        error
      )

      setPredictions((previous) => ({
        ...previous,

        [donationId]: {
          error:
            error.message ||
            'Prediction unavailable.',
        },
      }))

    } finally {

      setPredictionLoading((previous) => ({
        ...previous,
        [donationId]: false,
      }))
    }
  }

  // ============================================================
  // CLAIM DONATION
  // ============================================================

  const handleClaimDonation = async (donationId) => {

    if (!donationId) {
      setErrorMessage(
        'Donation ID is missing.'
      )
      return
    }

    setErrorMessage('')
    setSuccessMessage('')

    try {

      const response = await fetch(
        `${API_BASE}/api/receiver/claim/${donationId}/`,
        {
          method: 'POST',

          credentials: 'include',

          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            'X-CSRFToken': getCookie('csrftoken'),
          },
        }
      )

      const contentType =
        response.headers.get('content-type') || ''

      if (!contentType.includes('application/json')) {
        const text = await response.text()

        console.error(
          'Claim response:',
          text
        )

        throw new Error(
          'Django returned an unexpected response.'
        )
      }

      const result = await response.json()

      if (!response.ok || result.success === false) {
        throw new Error(
          result.message ||
          'Could not claim donation.'
        )
      }

      setSuccessMessage(
        result.message ||
        'Donation claimed successfully.'
      )

      await loadDashboard()

    } catch (error) {

      console.error(
        'Claim donation error:',
        error
      )

      setErrorMessage(
        error.message ||
        'Could not claim donation.'
      )
    }
  }

  // ============================================================
  // ACCEPT DONOR OFFER
  // (CSRF header added - was missing before)
  // ============================================================

  const handleAccept = async (matchId) => {

    if (!matchId) {
      setErrorMessage(
        'Match ID is missing.'
      )
      return
    }

    setErrorMessage('')
    setSuccessMessage('')

    try {

      const response = await fetch(
        `${API_BASE}/api/receiver/accept/${matchId}/`,
        {
          method: 'POST',

          credentials: 'include',

          headers: {
            'Content-Type':
              'application/json',
            Accept: 'application/json',
            'X-CSRFToken': getCookie('csrftoken'),
          },
        }
      )

      const contentType =
        response.headers.get('content-type') || ''

      if (!contentType.includes('application/json')) {
        const text = await response.text()

        console.error(
          'Accept response:',
          text
        )

        throw new Error(
          'Django returned an unexpected response.'
        )
      }

      const result = await response.json()

      if (!response.ok || result.success === false) {
        throw new Error(
          result.message ||
          'Could not accept donation.'
        )
      }

      setSuccessMessage(
        result.message ||
        'Donation accepted successfully.'
      )

      await loadDashboard()

    } catch (error) {

      console.error(
        'Accept error:',
        error
      )

      setErrorMessage(
        error.message ||
        'Could not accept donation.'
      )
    }
  }

  // ============================================================
  // DECLINE DONOR OFFER
  // (CSRF header added - was missing before)
  // ============================================================

  const handleDecline = async (matchId) => {

    if (!matchId) {
      setErrorMessage(
        'Match ID is missing.'
      )
      return
    }

    setErrorMessage('')
    setSuccessMessage('')

    try {

      const response = await fetch(
        `${API_BASE}/api/receiver/decline/${matchId}/`,
        {
          method: 'POST',

          credentials: 'include',

          headers: {
            'Content-Type':
              'application/json',
            Accept: 'application/json',
            'X-CSRFToken': getCookie('csrftoken'),
          },
        }
      )

      const contentType =
        response.headers.get('content-type') || ''

      if (!contentType.includes('application/json')) {
        const text = await response.text()

        console.error(
          'Decline response:',
          text
        )

        throw new Error(
          'Django returned an unexpected response.'
        )
      }

      const result = await response.json()

      if (!response.ok || result.success === false) {
        throw new Error(
          result.message ||
          'Could not decline donation.'
        )
      }

      setSuccessMessage(
        result.message ||
        'Donor offer declined.'
      )

      await loadDashboard()

    } catch (error) {

      console.error(
        'Decline error:',
        error
      )

      setErrorMessage(
        error.message ||
        'Could not decline donation.'
      )
    }
  }

  // ============================================================
// CONFIRM FOOD RECEIVED
// (final step - completes the donation)
// ============================================================

const handleConfirmReceived = async (matchId) => {
  if (!matchId) {
    setErrorMessage(
      'Match ID is missing.'
    )
    return
  }

  setErrorMessage('')
  setSuccessMessage('')

  try {
    const response = await fetch(
      `${API_BASE}/api/receiver/confirm/${matchId}/`,
      {
        method: 'POST',
        credentials: 'include',

        headers: {
          'Content-Type':
            'application/json',
          Accept: 'application/json',
          'X-CSRFToken': getCookie('csrftoken'),
        },
      }
    )

    const contentType =
      response.headers.get('content-type') || ''

    if (!contentType.includes('application/json')) {
      const text = await response.text()

      console.error(
        'Confirm response:',
        text
      )

      throw new Error(
        'Django returned an unexpected response.'
      )
    }

    const result = await response.json()

    if (!response.ok || result.success === false) {
      throw new Error(
        result.message ||
        'Could not confirm pickup.'
      )
    }

    setSuccessMessage(
      result.message ||
      'Food receipt confirmed. Thank you!'
    )

    await loadDashboard()

  } catch (error) {
    console.error(
      'Confirm received error:',
      error
    )

    setErrorMessage(
      error.message ||
      'Could not confirm pickup.'
    )
  }
}

  // ============================================================
  // DELETE MEAL REQUEST
  // ============================================================

  const handleDeleteRequest = async (requestId) => {

    if (!requestId) {
      setErrorMessage(
        'Request ID is missing.'
      )
      return
    }

    const confirmed =
      window.confirm(
        'Are you sure you want to delete this meal request?'
      )

    if (!confirmed) {
      return
    }

    setErrorMessage('')
    setSuccessMessage('')

    try {

      const response = await fetch(
  `${API_BASE}/api/receiver/delete/${requestId}/`,
  {
    method: 'POST',
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      'X-CSRFToken': getCookie('csrftoken'),
    },
  }
)

      const contentType =
        response.headers.get('content-type') || ''

      if (!contentType.includes('application/json')) {
        const text = await response.text()

        console.error(
          'Delete response:',
          text
        )

        throw new Error(
          'Django returned an unexpected response.'
        )
      }

      const result = await response.json()

      if (!response.ok || result.success === false) {
        throw new Error(
          result.message ||
          'Could not delete meal request.'
        )
      }

      setSuccessMessage(
        result.message ||
        'Meal request deleted.'
      )

      await loadDashboard()

    } catch (error) {

      console.error(
        'Delete request error:',
        error
      )

      setErrorMessage(
        error.message ||
        'Could not delete meal request.'
      )
    }
  }

  // ============================================================
  // HELPER FUNCTIONS (all unchanged from before)
  // ============================================================

  const getDonationId = (donation) => {
    return (
      donation.id ??
      donation.donation_id ??
      donation.post_id
    )
  }

  const getRequestId = (request) => {
    return (
      request.id ??
      request.request_id
    )
  }

  const getMatchId = (item) => {
    return (
      item.match_id ??
      item.id
    )
  }

  const getDonorName = (donation) => {
    return (
      donation.donor_username ??
      donation.donor_name ??
      donation.username ??
      'Unknown donor'
    )
  }

  const getFoodName = (donation) => {
    return (
      donation.meal_description ??
      donation.food_name ??
      donation.food ??
      donation.title ??
      'Food donation'
    )
  }

  const getPeopleCount = (donation) => {
    return (
      donation.people_count ??
      donation.people ??
      0
    )
  }

  const getDate = (donation) => {
    return (
      donation.donation_date ??
      donation.date ??
      donation.needed_date ??
      'Not specified'
    )
  }

  const getLocation = (donation) => {
    return (
      donation.donation_location ??
      donation.location ??
      donation.address ??
      'Not specified'
    )
  }

  const getPreparation = (donation) => {
    return (
      donation.preparation_method ??
      donation.preparation ??
      'Not specified'
    )
  }
  const getNotes = (donation) => {
  return (
    donation.notes ??
    ''
  )
}

  // ============================================================
  // NEW HELPER
  // Cross-references a request's own "matches" list (which has
  // donor_username/date/preparation/pickup_status/match_id but
  // NOT a real donation id or location) against
  // dashboard.incoming_donations (which HAS the real donation id
  // and location, keyed by the same match_id) so each donor
  // offer nested inside a request card carries full, correct
  // data - without any backend change.
  // ============================================================

  const getRequestOffers = (request, incomingDonations) => {
    const rawMatches = request.matches ?? []

    return rawMatches.map((match) => {
      const enriched = incomingDonations.find(
        (incoming) =>
          incoming.match_id === match.match_id
      )

      return enriched
        ? { ...match, ...enriched }
        : match
    })
  }

  // ============================================================
  // LOADING SCREEN
  // ============================================================

  if (loading) {
    return (
      <div
        className="container"
        style={{
          paddingTop: '60px',
          paddingBottom: '60px',
        }}
      >
        <div
          className="card"
          style={{
            maxWidth: '700px',
            margin: '0 auto',
          }}
        >
          <div className="card-body text-center">
            <h3>
              Loading Receiver Dashboard...
            </h3>

            <p>
              Please wait.
            </p>
          </div>
        </div>
      </div>
    )
  }

  // ============================================================
  // MAIN DATA
  // ============================================================

  const availableDonations =
    dashboard?.available_donations ??
    dashboard?.donations ??
    dashboard?.available_food_donations ??
    []

  const mealRequests =
    dashboard?.meal_requests ??
    dashboard?.my_requests ??
    dashboard?.requests ??
    []

  // Used only as a lookup source for donor-offer enrichment now -
  // no longer rendered as its own standalone section.
  const incomingDonations =
    dashboard?.incoming_donations ??
    dashboard?.matches ??
    dashboard?.donor_offers ??
    []

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div
      className="container"
      style={{
        paddingTop: '35px',
        paddingBottom: '60px',
      }}
    >

      {/* ======================================================
          HEADER
      ====================================================== */}

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '20px',
          flexWrap: 'wrap',
          marginBottom: '25px',
        }}
      >

        <div>
          <h1
            style={{
              marginBottom: '5px',
            }}
          >
            Receiver Dashboard
          </h1>

          <p
  style={{
    margin: 0,
    opacity: 0.75,
  }}
>
  Welcome, <strong>{dashboard?.username}</strong>!
</p>
        </div>

        <button
          type="button"
          className="btn btn-green"
          onClick={() =>
            setShowRequestForm(
              (previous) => !previous
            )
          }
        >
          <i className="fas fa-plus"></i>{' '}
          {showRequestForm
            ? 'Close'
            : 'Post Meal Need'}
        </button>

      </div>

      {/* ======================================================
          MESSAGES
      ====================================================== */}

      {errorMessage && (
        <div
          className="message message-error"
          style={{
            marginBottom: '20px',
          }}
        >
          {errorMessage}
        </div>
      )}

      {successMessage && (
        <div
          className="message message-success"
          style={{
            marginBottom: '20px',
          }}
        >
          {successMessage}
        </div>
      )}

      {/* ======================================================
          POST MEAL REQUEST FORM
      ====================================================== */}

      {showRequestForm && (
        <div
          className="card"
          style={{
            marginBottom: '30px',
          }}
        >

          <div className="card-header-green">
            <h3>
              <i className="fas fa-utensils"></i>{' '}
              Post a Meal Need
            </h3>
          </div>

          <div className="card-body">

            <form
              onSubmit={
                handlePostRequest
              }
            >

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns:
                    'repeat(auto-fit, minmax(220px, 1fr))',
                  gap: '18px',
                }}
              >

                <div className="form-group">
                  <label className="form-label">
                    Food Name
                  </label>

                  <input
                    type="text"
                    name="food_name"
                    className="form-control"
                    placeholder="Example: Samosa"
                    value={
                      requestForm.food_name
                    }
                    onChange={
                      handleRequestChange
                    }
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Number of People
                  </label>

                  <input
                    type="number"
                    name="people_count"
                    className="form-control"
                    min="1"
                    placeholder="Example: 20"
                    value={
                      requestForm.people_count
                    }
                    onChange={
                      handleRequestChange
                    }
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Needed Date
                  </label>

                  <input
                    type="date"
                    name="needed_date"
                    className="form-control"
                    value={
                      requestForm.needed_date
                    }
                    onChange={
                      handleRequestChange
                    }
                    required
                  />
                </div>

                <div className="form-group">
  <label className="form-label">Location</label>

  <div className="mb-1">
    <label style={{ display: 'block', fontWeight: 400 }}>
      <input
        type="radio"
        name="request-location"
        checked={requestLocationChoice === 'registered'}
        onChange={() => setRequestLocationChoice('registered')}
      />{' '}
      Use my registered address ({dashboard?.profile_address || 'not set'})
    </label>

    <label style={{ display: 'block', fontWeight: 400 }}>
      <input
        type="radio"
        name="request-location"
        checked={requestLocationChoice === 'custom'}
        onChange={() => setRequestLocationChoice('custom')}
      />{' '}
      Use a different location
    </label>
  </div>

  {requestLocationChoice === 'custom' && (
    <input
      type="text"
      className="form-control"
      placeholder="e.g. Thamel, Kathmandu"
      value={requestCustomLocation}
      onChange={(e) => setRequestCustomLocation(e.target.value)}
    />
  )}
</div>

<div className="form-group">
  <label className="form-label">Notes (optional)</label>

  <textarea
    name="notes"
    className="form-control"
    rows="2"
    placeholder="Any additional details..."
    value={requestForm.notes}
    onChange={handleRequestChange}
  ></textarea>
</div>

              </div>

             

              <button
                type="submit"
                className="btn btn-green"
                disabled={posting}
              >
                <i className="fas fa-paper-plane"></i>{' '}

                {posting
                  ? 'Posting...'
                  : 'Post Meal Need'}
              </button>

            </form>

          </div>
        </div>
      )}

      {/* ======================================================
          AVAILABLE FOOD DONATIONS
      ====================================================== */}

      <div
        className="card"
        style={{
          marginBottom: '35px',
        }}
      >

        <div className="card-header-green">

          <h3>
            <i className="fas fa-utensils"></i>{' '}
            Available Food Donations
          </h3>

          <p
            style={{
              margin: '5px 0 0',
            }}
          >
            Food donations currently available
            from donors.
          </p>

        </div>

        <div className="card-body">

          {availableDonations.length === 0 ? (

            <div
              className="text-center"
              style={{
                padding: '30px 10px',
              }}
            >
              <h4>
                No food donations available
              </h4>

              <p>
                New donor donations will appear here.
              </p>
            </div>

          ) : (

            <div
              style={{
                display: 'grid',
                gridTemplateColumns:
                  'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '20px',
              }}
            >

              {availableDonations.map(
                (donation, index) => {

                  const donationId =
                    getDonationId(donation)

                  const prediction =
                    donationId
                      ? predictions[donationId]
                      : null

                  const isPredictionLoading =
                    donationId
                      ? predictionLoading[
                          donationId
                        ]
                      : false

                  return (
                    <div
                      className="card"
                      key={
                        donationId ??
                        `donation-${index}`
                      }
                      style={{
                        margin: 0,
                      }}
                    >

                      <div className="card-body">

                        <h3
                          style={{
                            marginBottom: '15px',
                          }}
                        >
                          {getFoodName(
                            donation
                          )}
                        </h3>

                        <p>
                          <strong>
                            Donor:
                          </strong>{' '}
                          {getDonorName(
                            donation
                          )}
                        </p>

                        <p>
                          <strong>
                            People:
                          </strong>{' '}
                          {getPeopleCount(
                            donation
                          )}
                        </p>

                        <p>
                          <strong>
                            Date:
                          </strong>{' '}
                          {getDate(
                            donation
                          )}
                        </p>

                        <p>
                          <strong>
                            Preparation:
                          </strong>{' '}
                          {getPreparation(
                            donation
                          )}
                        </p>

                        <p>
                          <strong>
                            Location:
                          </strong>{' '}
                          {getLocation(
                            donation
                          )}
                        </p>

                        {getNotes(donation) && (
  <p>
    <strong>
      Notes:
    </strong>{' '}
    {getNotes(donation)}
  </p>
)}

                        {/* AI BUTTON */}

                        <button
                          type="button"
                          className="btn"
                          style={{
                            width: '100%',
                            marginTop: '10px',
                            marginBottom: '10px',
                          }}
                          disabled={
                            !donationId ||
                            isPredictionLoading
                          }
                          onClick={() =>
                            checkPrediction(
                              donationId
                            )
                          }
                        >

                          {isPredictionLoading
                            ? '🤖 Checking AI...'
                            : '🤖 Check AI Prediction'}

                        </button>

                        {/* AI RESULT */}

                        {prediction && (
                          <div
                            style={{
                              padding: '15px',
                              marginTop: '10px',
                              border:
                                '1px solid #ddd',
                              borderRadius: '8px',
                            }}
                          >

                            {prediction.error ? (

                              <p
                                style={{
                                  margin: 0,
                                }}
                              >
                                ❌{' '}
                                {
                                  prediction.error
                                }
                              </p>

                            ) : (

                              <>
                                <h4>
                                  🤖 AI Donation Prediction
                                </h4>

                                <p>
                                  <strong>
                                    Probability:
                                  </strong>{' '}

                                  {prediction.probability !==
                                  undefined &&
                                  prediction.probability !==
                                  null
                                    ? `${prediction.probability}%`
                                    : 'Not available'}
                                </p>

                                <p>
                                  <strong>
                                    Prediction:
                                  </strong>{' '}

                                  {prediction.prediction ||
                                    'Not available'}
                                </p>

                                {prediction.likely_to_complete !==
                                  undefined && (
                                  <p>
                                    <strong>
                                      Likely to complete:
                                    </strong>{' '}

                                    {prediction.likely_to_complete
                                      ? 'Yes'
                                      : 'No'}
                                  </p>
                                )}

                                {prediction.previous_total_count !==
                                  undefined && (
                                  <p>
                                    <strong>
                                      Previous donations:
                                    </strong>{' '}

                                    {
                                      prediction.previous_total_count
                                    }
                                  </p>
                                )}

                                {prediction.previous_completed_count !==
                                  undefined && (
                                  <p>
                                    <strong>
                                      Previous completed:
                                    </strong>{' '}

                                    {
                                      prediction.previous_completed_count
                                    }
                                  </p>
                                )}

                              </>
                            )}

                          </div>
                        )}

                        {/* CLAIM BUTTON */}

                        <button
                          type="button"
                          className="btn btn-green"
                          style={{
                            width: '100%',
                            marginTop: '10px',
                          }}
                          disabled={!donationId}
                          onClick={() =>
                            handleClaimDonation(
                              donationId
                            )
                          }
                        >
                          <i className="fas fa-hand-holding-heart"></i>{' '}
                          Claim This Donation
                        </button>

                      </div>
                    </div>
                  )
                }
              )}

            </div>
          )}

        </div>
      </div>

      {/* ======================================================
          MY MEAL REQUESTS
          (AI prediction + nested Donor Offers now live here.
          The old standalone "Donor Offers / Matches" section
          has been removed per the new layout.)
      ====================================================== */}

      <div className="card">

        <div className="card-header-green">

          <h3>
            <i className="fas fa-clipboard-list"></i>{' '}
            My Meal Requests
          </h3>

          <p
            style={{
              margin: '5px 0 0',
            }}
          >
            Your food requests and their current
            status.
          </p>

        </div>

        <div className="card-body">

          {mealRequests.length === 0 ? (

            <div
              className="text-center"
              style={{
                padding: '30px 10px',
              }}
            >
              <h4>
                You have no meal requests yet.
              </h4>

              <p>
                Click "Post Meal Need" to request
                food from donors.
              </p>
            </div>

          ) : (

            <div
              style={{
                display: 'grid',
                gridTemplateColumns:
                  'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '20px',
              }}
            >

              {mealRequests.map(
                (request, index) => {

                  const requestId =
                    getRequestId(request)

                  const offers =
                    getRequestOffers(
                      request,
                      incomingDonations
                    )

                  // The top-level "Check AI Prediction" button on
                  // this request card uses the first donor
                  // offer's real donation id, since that is the
                  // only DonationPost this request is currently
                  // tied to. With no offer yet, there is no valid
                  // id, so the button stays disabled.
                  const primaryOffer =
                    offers.length > 0
                      ? offers[0]
                      : null

                  const primaryDonationId =
                    primaryOffer
                      ? getDonationId(primaryOffer)
                      : null

                  const prediction =
                    primaryDonationId
                      ? predictions[primaryDonationId]
                      : null

                  const isPredictionLoading =
                    primaryDonationId
                      ? predictionLoading[
                          primaryDonationId
                        ]
                      : false

                  return (
                    <div
                      className="card"
                      key={
                        requestId ??
                        `request-${index}`
                      }
                      style={{
                        margin: 0,
                      }}
                    >

                      <div className="card-body">

                        <h3>
                         {request.meal_type ||
                         request.food_name ||
                         request.food ||
                         request.title ||
                         'Meal Request'}
                        </h3>

                        <p>
                          <strong>
                            People:
                          </strong>{' '}

                          {request.people_count ||
                            request.people ||
                            0}
                        </p>

                        <p>
                          <strong>
                            Needed Date:
                          </strong>{' '}


                          {request.preferred_date ||
                          request.needed_date ||
                          request.date ||
                          'Not specified'}
                        </p>

                        <p>
                          <strong>
                            Location:
                          </strong>{' '}

                          {request.request_location ||
                          request.location ||
                          request.address ||
                          'Not specified'}
                        </p>

                        <p>
                          <strong>
                            Status:
                          </strong>{' '}

                          {request.status ||
                            'pending'}
                        </p>

                        {/* AI BUTTON (reused checkPrediction) */}

                        <button
                          type="button"
                          className="btn"
                          style={{
                            width: '100%',
                            marginTop: '10px',
                            marginBottom: '10px',
                          }}
                          disabled={
                            !primaryDonationId ||
                            isPredictionLoading
                          }
                          onClick={() =>
                            checkPrediction(
                              primaryDonationId
                            )
                          }
                        >

                          {isPredictionLoading
                            ? '🤖 Checking AI...'
                            : '🤖 Check AI Prediction'}

                        </button>

                        {!primaryDonationId && (
                          <p
                            style={{
                              fontSize: '0.85rem',
                              opacity: 0.7,
                              margin: '0 0 10px',
                            }}
                          >
                            AI prediction becomes
                            available once a donor
                            responds to this request.
                          </p>
                        )}

                        {/* AI RESULT */}

                        {prediction && (
                          <div
                            style={{
                              padding: '15px',
                              marginTop: '10px',
                              marginBottom: '10px',
                              border:
                                '1px solid #ddd',
                              borderRadius: '8px',
                            }}
                          >

                            {prediction.error ? (

                              <p
                                style={{
                                  margin: 0,
                                }}
                              >
                                ❌{' '}
                                {
                                  prediction.error
                                }
                              </p>

                            ) : (

                              <>
                                <h4>
                                  🤖 AI Donation Prediction
                                </h4>

                                <p>
                                  <strong>
                                    Probability:
                                  </strong>{' '}

                                  {prediction.probability !==
                                  undefined &&
                                  prediction.probability !==
                                  null
                                    ? `${prediction.probability}%`
                                    : 'Not available'}
                                </p>

                                <p>
                                  <strong>
                                    Prediction:
                                  </strong>{' '}

                                  {prediction.prediction ||
                                    'Not available'}
                                </p>

                                {prediction.likely_to_complete !==
                                  undefined && (
                                  <p>
                                    <strong>
                                      Likely to complete:
                                    </strong>{' '}

                                    {prediction.likely_to_complete
                                      ? 'Yes'
                                      : 'No'}
                                  </p>
                                )}

                                {prediction.previous_total_count !==
                                  undefined && (
                                  <p>
                                    <strong>
                                      Previous donations:
                                    </strong>{' '}

                                    {
                                      prediction.previous_total_count
                                    }
                                  </p>
                                )}

                                {prediction.previous_completed_count !==
                                  undefined && (
                                  <p>
                                    <strong>
                                      Previous completed:
                                    </strong>{' '}

                                    {
                                      prediction.previous_completed_count
                                    }
                                  </p>
                                )}

                              </>
                            )}

                          </div>
                        )}

                        {/* DONOR OFFERS - nested inside this
                            request card, not a separate section */}

                        {offers.length > 0 && (
                          <div
                            style={{
                              marginTop: '15px',
                              marginBottom: '10px',
                            }}
                          >

                            <h4
                              style={{
                                marginBottom: '10px',
                              }}
                            >
                              Donor Offers
                            </h4>

                            {offers.map(
                              (offer, offerIndex) => {

                                const matchId =
                                  getMatchId(offer)

                                const pickupStatus =
                                  offer.pickup_status ??
                                  offer.status ??
                                  'pending'

                                return (
                                  <div
                                    key={
                                      matchId ??
                                      `offer-${offerIndex}`
                                    }
                                    style={{
                                      padding: '12px',
                                      marginBottom: '10px',
                                      border:
                                        '1px solid #ddd',
                                      borderRadius: '8px',
                                    }}
                                  >

                                    <p>
                                      <strong>
                                        Donor:
                                      </strong>{' '}
                                      {getDonorName(
                                        offer
                                      )}
                                    </p>

                                    <p>
                                      <strong>
                                        Date:
                                      </strong>{' '}
                                      {getDate(
                                        offer
                                      )}
                                    </p>

                                    <p>
                                      <strong>
                                        Preparation:
                                      </strong>{' '}
                                      {getPreparation(
                                        offer
                                      )}
                                    </p>

                                    <p>
                                      <strong>
                                        Notes:
                                        </strong>{' '}
                                        {getNotes(
                                          offer
                                          )}
                                          </p>

                                    <p>
                                      <strong>
                                        Location:
                                      </strong>{' '}
                                      {getLocation(
                                        offer
                                      )}
                                    </p>

                                    {pickupStatus ===
  'pending' && (
  <div
    style={{
      display: 'flex',
      gap: '10px',
      marginTop: '10px',
    }}
  >

    <button
      type="button"
      className="btn btn-green"
      style={{
        flex: 1,
      }}
      onClick={() =>
        handleAccept(
          matchId
        )
      }
    >
      ✓ Accept
    </button>

    <button
      type="button"
      className="btn"
      style={{
        flex: 1,
      }}
      onClick={() =>
        handleDecline(
          matchId
        )
      }
    >
      ✕ Decline
    </button>

  </div>
)}

{pickupStatus ===
  'confirmed' && (
  <>
    <p
      style={{
        margin:
          '10px 0',
        fontStyle:
          'italic',
      }}
    >
      Status: confirmed —
      donor is preparing
      the food.
    </p>

    <button
      type="button"
      className="btn btn-green"
      style={{
        width: '100%',
      }}
      onClick={() =>
        handleConfirmReceived(
          matchId
        )
      }
    >
      ✓ Confirm Food Received
    </button>
  </>
)}

{pickupStatus === 'ready' && (
  <>
    <p
      style={{
        margin: '10px 0 0',
        fontStyle: 'italic',
      }}
    >
      ✓ Food is ready for pickup!
    </p>

    <button
      type="button"
      className="btn btn-green"
      style={{ width: '100%' }}
      onClick={() =>
        handleConfirmReceived(matchId)
      }
    >
      ✓ Confirm Food Received
    </button>
  </>
)}

{pickupStatus ===
  'completed' && (
  <p
    style={{
      margin:
        '10px 0 0',
      fontStyle:
        'italic',
    }}
  >
    Status: completed ✓
  </p>
)}

                                  </div>
                                )
                              }
                            )}

                          </div>
                        )}

                        <button
                          type="button"
                          className="btn"
                          style={{
                            marginTop: '10px',
                            width: '100%',
                          }}
                          onClick={() =>
                            handleDeleteRequest(
                              requestId
                            )
                          }
                          disabled={!requestId}
                        >
                          <i className="fas fa-trash"></i>{' '}
                          Delete Request
                        </button>

                      </div>

                    </div>
                  )
                }
              )}

            </div>

          )}

        </div>
      </div>

    </div>
  )
}

export default ReceiverDashboard
