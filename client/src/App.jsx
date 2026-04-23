import { Navigate, Route, Routes, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { getHome, getMe, logOut, signIn, signUp } from './lib/api'

const globalZones = [
  'Africa',
  'Europe',
  'North America',
  'South America',
  'Middle East',
  'South Asia',
  'Southeast Asia',
  'East Asia',
  'Central Asia',
  'Oceania',
  'Antarctica',
]

function Shell({ title, subtitle, children }) {
  return (
    <div className="app-shell">
      <div className="backdrop backdrop-a" />
      <div className="backdrop backdrop-b" />
      <header className="topbar">
        <a className="brand" href="/">
          <span className="brand-mark">W</span>
          <span>
            <strong>WeatherDash</strong>
            <small>Climate intelligence across every zone</small>
          </span>
        </a>
        <nav className="topnav">
          <a href="/">Landing</a>
          <a href="/signin">Sign in</a>
          <a href="/signup">Sign up</a>
        </nav>
      </header>
      <main className="page-frame">
        <section className="hero-card">
          <p className="eyebrow">WeatherDash</p>
          <h1>{title}</h1>
          <p className="hero-copy">{subtitle}</p>
          {children}
        </section>
      </main>
    </div>
  )
}

function LandingPage() {
  return (
    <div className="landing-page">
      <div className="backdrop backdrop-a" />
      <div className="backdrop backdrop-b" />
      <header className="topbar">
        <a className="brand" href="/">
          <span className="brand-mark">W</span>
          <span>
            <strong>WeatherDash</strong>
            <small>Modern weather intelligence</small>
          </span>
        </a>
        <nav className="topnav">
          <a href="#features">Features</a>
          <a href="#global-zones">Global zones</a>
          <a href="#support">Support</a>
        </nav>
      </header>
      <main className="landing-grid">
        <section className="hero-copy-block">
          <p className="eyebrow">Global monitoring</p>
          <h1>Weather intelligence across every zone.</h1>
          <p>
            Track climate conditions with a dashboard shaped around continental
            zones, seasonal shifts, and high-signal alerts.
          </p>
          <div className="hero-actions">
            <a className="primary-button" href="/signup">Get started</a>
            <a className="secondary-button" href="/signin">Sign in</a>
          </div>
          <div className="hero-stats">
            <article><strong>11</strong><span>Zones covered</span></article>
            <article><strong>24/7</strong><span>Monitoring</span></article>
            <article><strong>Real-time</strong><span>Auth-backed sessions</span></article>
          </div>
        </section>

        <aside className="feature-stack" id="features">
          <article>
            <h3>Comprehensive forecasts</h3>
            <p>Short and long-range planning with a cleaner, React-driven interface.</p>
          </article>
          <article>
            <h3>Zone-based analytics</h3>
            <p>Aggregated climate data organized by the regions already modeled in WeatherDash.</p>
          </article>
          <article>
            <h3>Historical data</h3>
            <p>Keep the original WeatherDash focus while moving the UI into a proper frontend app.</p>
          </article>
        </aside>
      </main>

      <section className="zones-panel" id="global-zones">
        <h2>Coverage by global zone</h2>
        <div className="zone-grid">
          {globalZones.map((zone) => (
            <div key={zone} className="zone-pill">{zone}</div>
          ))}
        </div>
      </section>

      <section className="support-panel" id="support">
        <h2>Support</h2>
        <p>Move the forms into React and keep Django focused on the backend.</p>
      </section>
    </div>
  )
}

function SignInPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ username: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setLoading(true)
    setError('')

    try {
      await signIn(form)
      navigate('/home')
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Shell
      title="Login Form"
      subtitle="Authenticate against the Django backend from a React UI."
    >
      <form className="auth-form" onSubmit={handleSubmit}>
        <label>
          Email or username
          <input
            value={form.username}
            onChange={(event) => setForm({ ...form, username: event.target.value })}
            autoComplete="username"
          />
        </label>
        <label>
          Password
          <input
            type="password"
            value={form.password}
            onChange={(event) => setForm({ ...form, password: event.target.value })}
            autoComplete="current-password"
          />
        </label>
        {error ? <p className="form-error">{error}</p> : null}
        <button className="primary-button" type="submit" disabled={loading}>
          {loading ? 'Signing in...' : 'Login now'}
        </button>
        <p className="form-footnote">
          Don&apos;t have an account? <a href="/signup">Sign up</a>
        </p>
      </form>
    </Shell>
  )
}

function SignUpPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    username: '',
    email: '',
    password1: '',
    password2: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setLoading(true)
    setError('')

    try {
      await signUp(form)
      navigate('/signin')
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Shell
      title="Registration Form"
      subtitle="Create a session-backed account on the Django backend."
    >
      <form className="auth-form auth-form-grid" onSubmit={handleSubmit}>
        <label>
          First name
          <input
            value={form.first_name}
            onChange={(event) => setForm({ ...form, first_name: event.target.value })}
            autoComplete="given-name"
          />
        </label>
        <label>
          Last name
          <input
            value={form.last_name}
            onChange={(event) => setForm({ ...form, last_name: event.target.value })}
            autoComplete="family-name"
          />
        </label>
        <label>
          Username
          <input
            value={form.username}
            onChange={(event) => setForm({ ...form, username: event.target.value })}
            autoComplete="username"
          />
        </label>
        <label>
          Email
          <input
            type="email"
            value={form.email}
            onChange={(event) => setForm({ ...form, email: event.target.value })}
            autoComplete="email"
          />
        </label>
        <label>
          Password
          <input
            type="password"
            value={form.password1}
            onChange={(event) => setForm({ ...form, password1: event.target.value })}
            autoComplete="new-password"
          />
        </label>
        <label>
          Confirm password
          <input
            type="password"
            value={form.password2}
            onChange={(event) => setForm({ ...form, password2: event.target.value })}
            autoComplete="new-password"
          />
        </label>
        {error ? <p className="form-error form-span-full">{error}</p> : null}
        <button className="primary-button form-span-full" type="submit" disabled={loading}>
          {loading ? 'Creating account...' : 'Register now'}
        </button>
        <p className="form-footnote form-span-full">
          Already have an account? <a href="/signin">Login</a>
        </p>
      </form>
    </Shell>
  )
}

function HomePage() {
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let ignore = false

    async function load() {
      try {
        const [me, home] = await Promise.all([getMe(), getHome()])
        if (!ignore) {
          setData({ me, home })
        }
      } catch (error) {
        if (!ignore) {
          setError(error.message)
          navigate('/signin')
        }
      }
    }

    load()
    return () => {
      ignore = true
    }
  }, [navigate])

  async function handleLogout() {
    await logOut()
    navigate('/')
  }

  if (error) {
    return null
  }

  if (!data) {
    return <Shell title="Loading dashboard" subtitle="Pulling session data from Django backend..." />
  }

  const { user } = data.home
  const zones = data.home.zones

  return (
    <div className="dashboard-page">
      <div className="backdrop backdrop-a" />
      <div className="backdrop backdrop-b" />
      <header className="topbar">
        <a className="brand" href="/">
          <span className="brand-mark">W</span>
          <span>
            <strong>WeatherDash</strong>
            <small>Dashboard</small>
          </span>
        </a>
        <button className="secondary-button" onClick={handleLogout}>Logout</button>
      </header>
      <main className="dashboard-grid">
        <section className="hero-card dashboard-hero">
          <p className="eyebrow">Authenticated session</p>
          <h1>
            Welcome back, {user.first_name || data.me.user.username}.
          </h1>
          <p className="hero-copy">
            The backend is handling auth and dashboard data while React owns the UI.
          </p>
          <div className="hero-stats">
            <article><strong>{data.home.stats.zones}</strong><span>zones</span></article>
            <article><strong>{data.home.stats.alerts}</strong><span>alerts</span></article>
            <article><strong>{data.home.stats.coverage}</strong><span>coverage</span></article>
          </div>
        </section>

        <section className="zone-list-card">
          <h2>Global zones</h2>
          <div className="dashboard-zone-list">
            {zones.map((zone) => (
              <article key={zone.name} className="dashboard-zone-item">
                <div>
                  <h3>{zone.name}</h3>
                  <p>{zone.summary}</p>
                </div>
                <strong>{zone.metric}</strong>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/signin" element={<SignInPage />} />
      <Route path="/signup" element={<SignUpPage />} />
      <Route path="/home" element={<HomePage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}