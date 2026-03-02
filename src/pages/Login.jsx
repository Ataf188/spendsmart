import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const { signIn } = useAuth()
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await signIn(email, password)

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      navigate('/dashboard')
    }
  }

  return (
    <div style={{
      minHeight: '100vh', background: '#0a0a0f',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'DM Sans', sans-serif", padding: '20px'
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .input { background: #0d0d14; border: 1px solid #1e1e2e; border-radius: 10px; padding: 12px 16px; color: #e2e8f0; font-size: 14px; width: 100%; outline: none; transition: border 0.2s; font-family: 'DM Sans', sans-serif; }
        .input:focus { border-color: #6366f1; }
        .btn { background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; border: none; border-radius: 10px; padding: 13px; cursor: pointer; font-weight: 600; font-size: 15px; width: 100%; transition: all 0.2s; font-family: 'DM Sans', sans-serif; }
        .btn:hover { opacity: 0.9; transform: translateY(-1px); }
        .btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
      `}</style>

      <div style={{
        background: '#13131a', border: '1px solid #1e1e2e',
        borderRadius: '20px', padding: '36px', width: '100%', maxWidth: '420px'
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#e2e8f0' }}>💸 SpendSmart</h1>
          <p style={{ color: '#64748b', fontSize: '14px', marginTop: '6px' }}>Welcome back!</p>
        </div>

        {/* Error Message */}
        {error && (
          <div style={{
            background: '#ef444420', border: '1px solid #ef4444',
            borderRadius: '10px', padding: '12px', marginBottom: '16px',
            color: '#ef4444', fontSize: '14px'
          }}>
            ⚠️ {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ color: '#94a3b8', fontSize: '13px', fontWeight: '500', marginBottom: '6px', display: 'block' }}>
              Email
            </label>
            <input
              className="input"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <label style={{ color: '#94a3b8', fontSize: '13px', fontWeight: '500' }}>Password</label>
              <Link to="/forgot-password" style={{ color: '#6366f1', fontSize: '13px', textDecoration: 'none' }}>
                Forgot password?
              </Link>
            </div>
            <input
              className="input"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>

          <button className="btn" type="submit" disabled={loading} style={{ marginTop: '4px' }}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p style={{ textAlign: 'center', color: '#64748b', fontSize: '14px', marginTop: '20px' }}>
          Don't have an account?{' '}
          <Link to="/signup" style={{ color: '#6366f1', textDecoration: 'none', fontWeight: '500' }}>
            Sign up free
          </Link>
        </p>
      </div>
    </div>
  )
}
