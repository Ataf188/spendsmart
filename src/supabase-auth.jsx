// ============================================
// STEP 1: Install karो
// npm install @supabase/supabase-js react-router-dom
// ============================================

// ============================================
// src/supabase.js - Supabase Client
// ============================================
// import { createClient } from '@supabase/supabase-js'
//
// const supabaseUrl = 'YOUR_SUPABASE_URL'        // Supabase dashboard se lo
// const supabaseKey = 'YOUR_SUPABASE_ANON_KEY'   // Supabase dashboard se lo
//
// export const supabase = createClient(supabaseUrl, supabaseKey)

// ============================================
// src/context/AuthContext.jsx
// ============================================
import { createContext, useContext, useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY
export const supabase = createClient(supabaseUrl, supabaseKey)

const AuthContext = createContext({})

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Current session check karo
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Auth changes listen karo
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signUp = async (email, password, fullName) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName }
      }
    })
    return { data, error }
  }

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    return { data, error }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  return (
    <AuthContext.Provider value={{ user, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)

// ============================================
// src/components/ProtectedRoute.jsx
// ============================================
// import { Navigate } from 'react-router-dom'
// import { useAuth } from '../context/AuthContext'
//
// export default function ProtectedRoute({ children }) {
//   const { user, loading } = useAuth()
//   if (loading) return <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100vh',background:'#0a0a0f',color:'white'}}>Loading...</div>
//   if (!user) return <Navigate to="/login" replace />
//   return children
// }

// ============================================
// src/pages/Login.jsx
// ============================================
import { useState } from 'react'
// import { useAuth } from '../context/AuthContext'
// import { useNavigate, Link } from 'react-router-dom'

export function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  // const { signIn } = useAuth()
  // const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // const { error } = await signIn(email, password)
    // if (error) {
    //   setError(error.message)
    // } else {
    //   navigate('/dashboard')
    // }
    
    // Demo ke liye:
    console.log('Login:', email, password)
    setLoading(false)
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
        .link { color: #6366f1; text-decoration: none; font-weight: 500; }
        .link:hover { text-decoration: underline; }
        .divider { display: flex; align-items: center; gap: 12px; margin: 20px 0; }
        .divider-line { flex: 1; height: 1px; background: #1e1e2e; }
        .google-btn { background: #13131a; border: 1px solid #1e1e2e; border-radius: 10px; padding: 12px; cursor: pointer; font-weight: 500; font-size: 14px; width: 100%; color: #e2e8f0; display: flex; align-items: center; justify-content: center; gap: 8px; transition: all 0.2s; font-family: 'DM Sans', sans-serif; }
        .google-btn:hover { border-color: #6366f1; }
      `}</style>

      <div style={{
        background: '#13131a', border: '1px solid #1e1e2e',
        borderRadius: '20px', padding: '36px', width: '100%', maxWidth: '420px'
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#e2e8f0' }}>💸 SpendSmart</h1>
          <p style={{ color: '#64748b', fontSize: '14px', marginTop: '6px' }}>Welcome back! Sign in to continue</p>
        </div>

        {/* Google Login */}
        <button className="google-btn">
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
        </button>

        <div className="divider">
          <div className="divider-line" />
          <span style={{ color: '#64748b', fontSize: '12px' }}>or</span>
          <div className="divider-line" />
        </div>

        {/* Error */}
        {error && (
          <div style={{ background: '#ef444420', border: '1px solid #ef4444', borderRadius: '10px', padding: '12px', marginBottom: '16px', color: '#ef4444', fontSize: '14px' }}>
            ⚠️ {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <label style={{ color: '#94a3b8', fontSize: '13px', fontWeight: '500', marginBottom: '6px', display: 'block' }}>Email</label>
            <input className="input" type="email" placeholder="you@example.com"
              value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <label style={{ color: '#94a3b8', fontSize: '13px', fontWeight: '500' }}>Password</label>
              <a href="/forgot-password" className="link" style={{ fontSize: '13px' }}>Forgot password?</a>
            </div>
            <input className="input" type="password" placeholder="••••••••"
              value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          <button className="btn" type="submit" disabled={loading} style={{ marginTop: '8px' }}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p style={{ textAlign: 'center', color: '#64748b', fontSize: '14px', marginTop: '20px' }}>
          Don't have an account? <a href="/signup" className="link">Sign up free</a>
        </p>
      </div>
    </div>
  )
}

// ============================================
// src/pages/Signup.jsx
// ============================================
export function Signup() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSignup = async (e) => {
    e.preventDefault()
    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }
    setLoading(true)
    setError('')

    // const { error } = await signUp(email, password, fullName)
    // if (error) {
    //   setError(error.message)
    // } else {
    //   setSuccess(true)
    // }

    // Demo ke liye:
    console.log('Signup:', fullName, email, password)
    setSuccess(true)
    setLoading(false)
  }

  if (success) {
    return (
      <div style={{ minHeight: '100vh', background: '#0a0a0f', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'DM Sans', sans-serif" }}>
        <div style={{ background: '#13131a', border: '1px solid #1e1e2e', borderRadius: '20px', padding: '36px', width: '100%', maxWidth: '420px', textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>✅</div>
          <h2 style={{ color: '#e2e8f0', fontSize: '22px', fontWeight: '700', marginBottom: '8px' }}>Check your email!</h2>
          <p style={{ color: '#64748b', fontSize: '14px' }}>We sent a confirmation link to <strong style={{ color: '#6366f1' }}>{email}</strong></p>
          <a href="/login" style={{ display: 'block', marginTop: '24px', color: '#6366f1', textDecoration: 'none', fontWeight: '500' }}>← Back to Login</a>
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
      <div style={{
        background: '#13131a', border: '1px solid #1e1e2e',
        borderRadius: '20px', padding: '36px', width: '100%', maxWidth: '420px'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#e2e8f0' }}>💸 SpendSmart</h1>
          <p style={{ color: '#64748b', fontSize: '14px', marginTop: '6px' }}>Create your free account</p>
        </div>

        {error && (
          <div style={{ background: '#ef444420', border: '1px solid #ef4444', borderRadius: '10px', padding: '12px', marginBottom: '16px', color: '#ef4444', fontSize: '14px' }}>
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <label style={{ color: '#94a3b8', fontSize: '13px', fontWeight: '500', marginBottom: '6px', display: 'block' }}>Full Name</label>
            <input style={{ background: '#0d0d14', border: '1px solid #1e1e2e', borderRadius: '10px', padding: '12px 16px', color: '#e2e8f0', fontSize: '14px', width: '100%', outline: 'none', fontFamily: "'DM Sans', sans-serif" }}
              type="text" placeholder="Atif Ali Hussain"
              value={fullName} onChange={e => setFullName(e.target.value)} required />
          </div>
          <div>
            <label style={{ color: '#94a3b8', fontSize: '13px', fontWeight: '500', marginBottom: '6px', display: 'block' }}>Email</label>
            <input style={{ background: '#0d0d14', border: '1px solid #1e1e2e', borderRadius: '10px', padding: '12px 16px', color: '#e2e8f0', fontSize: '14px', width: '100%', outline: 'none', fontFamily: "'DM Sans', sans-serif" }}
              type="email" placeholder="you@example.com"
              value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div>
            <label style={{ color: '#94a3b8', fontSize: '13px', fontWeight: '500', marginBottom: '6px', display: 'block' }}>Password</label>
            <input style={{ background: '#0d0d14', border: '1px solid #1e1e2e', borderRadius: '10px', padding: '12px 16px', color: '#e2e8f0', fontSize: '14px', width: '100%', outline: 'none', fontFamily: "'DM Sans', sans-serif" }}
              type="password" placeholder="Min 6 characters"
              value={password} onChange={e => setPassword(e.target.value)} required />
          </div>

          {/* Password strength */}
          {password && (
            <div style={{ display: 'flex', gap: '4px' }}>
              {[1,2,3,4].map(i => (
                <div key={i} style={{ flex: 1, height: '4px', borderRadius: '2px', background: password.length >= i * 2 ? (password.length >= 8 ? '#22c55e' : '#eab308') : '#1e1e2e', transition: 'background 0.2s' }} />
              ))}
            </div>
          )}

          <button style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: 'white', border: 'none', borderRadius: '10px', padding: '13px', cursor: 'pointer', fontWeight: '600', fontSize: '15px', marginTop: '8px', fontFamily: "'DM Sans', sans-serif", opacity: loading ? 0.6 : 1 }}
            type="submit" disabled={loading}>
            {loading ? 'Creating account...' : 'Create Free Account'}
          </button>
        </form>

        <p style={{ textAlign: 'center', color: '#64748b', fontSize: '13px', marginTop: '16px' }}>
          By signing up, you agree to our <a href="/terms" style={{ color: '#6366f1', textDecoration: 'none' }}>Terms</a> & <a href="/privacy" style={{ color: '#6366f1', textDecoration: 'none' }}>Privacy Policy</a>
        </p>

        <p style={{ textAlign: 'center', color: '#64748b', fontSize: '14px', marginTop: '16px' }}>
          Already have an account? <a href="/login" style={{ color: '#6366f1', textDecoration: 'none', fontWeight: '500' }}>Sign in</a>
        </p>
      </div>
    </div>
  )
}

// ============================================
// src/main.jsx - App Setup
// ============================================
// import { StrictMode } from 'react'
// import { createRoot } from 'react-dom/client'
// import { BrowserRouter, Routes, Route } from 'react-router-dom'
// import { AuthProvider } from './context/AuthContext'
// import { Login } from './pages/Login'
// import { Signup } from './pages/Signup'
// import ProtectedRoute from './components/ProtectedRoute'
// import ExpenseTracker from './ExpenseTracker'
//
// createRoot(document.getElementById('root')).render(
//   <StrictMode>
//     <BrowserRouter>
//       <AuthProvider>
//         <Routes>
//           <Route path="/login" element={<Login />} />
//           <Route path="/signup" element={<Signup />} />
//           <Route path="/dashboard" element={
//             <ProtectedRoute>
//               <ExpenseTracker />
//             </ProtectedRoute>
//           } />
//           <Route path="/" element={<Login />} />
//         </Routes>
//       </AuthProvider>
//     </BrowserRouter>
//   </StrictMode>
// )

// ============================================
// .env file (project root mein banao)
// ============================================
// VITE_SUPABASE_URL=your_supabase_project_url
// VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

// ============================================
// Supabase Database Table (SQL)
// Supabase dashboard > SQL Editor mein run karo
// ============================================
// CREATE TABLE expenses (
//   id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
//   user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
//   title TEXT NOT NULL,
//   amount DECIMAL NOT NULL,
//   category TEXT NOT NULL,
//   type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
//   date DATE NOT NULL,
//   created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
// );
//
// -- Har user sirf apna data dekhe
// ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
//
// CREATE POLICY "Users can only see their own expenses"
// ON expenses FOR ALL
// USING (auth.uid() = user_id);
