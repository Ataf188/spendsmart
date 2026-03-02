import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Signup() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const { signUp } = useAuth()
  const navigate = useNavigate()

  const handleSignup = async (e) => {
    e.preventDefault()
    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }
    setLoading(true)
    setError('')

    const { error } = await signUp(email, password, fullName)

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setSuccess(true)
    }
  }

  // Email confirm hone ke baad
  if (success) {
    return (
      <div style={{
        minHeight: '100vh', background: '#0a0a0f',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: "'DM Sans', sans-serif"
      }}>
        <div style={{
          background: '#13131a', border: '1px solid #1e1e2e',
          borderRadius: '20px', padding: '36px', width: '100%',
          maxWidth: '420px', textAlign: 'center'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>✅</div>
          <h2 style={{ color: '#e2e8f0', fontSize: '22px', fontWeight: '700', marginBottom: '8px' }}>
            Check your email!
          </h2>
          <p style={{ color: '#64748b', fontSize: '14px' }}>
            We sent a confirmation link to{' '}
            <strong style={{ color: '#6366f1' }}>{email}</strong>
          </p>
          <Link to="/login" style={{
            display: 'block', marginTop: '24px', color: '#6366f1',
            textDecoration: 'none', fontWeight: '500'
          }}>
            ← Back to Login
          </Link>
        </div>
      </div>
    )
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
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#e2e8f0' }}>💸 SpendSmart</h1>
          <p style={{ color: '#64748b', fontSize: '14px', marginTop: '6px' }}>Create your free account</p>
        </div>

        {error && (
          <div style={{
            background: '#ef444420', border: '1px solid #ef4444',
            borderRadius: '10px', padding: '12px', marginBottom: '16px',
            color: '#ef4444', fontSize: '14px'
          }}>
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ color: '#94a3b8', fontSize: '13px', fontWeight: '500', marginBottom: '6px', display: 'block' }}>
              Full Name
            </label>
            <input
              className="input"
              type="text"
              placeholder="Atif Ali Hussain"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              required
            />
          </div>

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
            <label style={{ color: '#94a3b8', fontSize: '13px', fontWeight: '500', marginBottom: '6px', display: 'block' }}>
              Password
            </label>
            <input
              className="input"
              type="password"
              placeholder="Min 6 characters"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
            {/* Password strength bar */}
            {password && (
              <div style={{ display: 'flex', gap: '4px', marginTop: '8px' }}>
                {[1, 2, 3, 4].map(i => (
                  <div key={i} style={{
                    flex: 1, height: '4px', borderRadius: '2px',
                    background: password.length >= i * 2
                      ? (password.length >= 8 ? '#22c55e' : '#eab308')
                      : '#1e1e2e',
                    transition: 'background 0.2s'
                  }} />
                ))}
              </div>
            )}
          </div>

          <button className="btn" type="submit" disabled={loading} style={{ marginTop: '4px' }}>
            {loading ? 'Creating account...' : 'Create Free Account'}
          </button>
        </form>

        <p style={{ textAlign: 'center', color: '#64748b', fontSize: '14px', marginTop: '20px' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#6366f1', textDecoration: 'none', fontWeight: '500' }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
