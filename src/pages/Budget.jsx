import { useState, useEffect } from 'react'
import { supabase } from '../supabase'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import toast, { Toaster } from 'react-hot-toast'

const categoryIcons = {
  Food: "🍔", Utilities: "⚡", Entertainment: "🎬",
  Transport: "🚗", Shopping: "🛍️", Health: "❤️", Other: "📦",
}

const categoryColors = {
  Food: "#f97316", Utilities: "#3b82f6", Entertainment: "#a855f7",
  Transport: "#eab308", Shopping: "#ec4899", Health: "#14b8a6", Other: "#6b7280",
}

const categories = ["Food", "Transport", "Utilities", "Entertainment", "Shopping", "Health", "Other"]

export default function Budget() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  const [expenses, setExpenses] = useState([])
  const [budgets, setBudgets] = useState({})
  const [loading, setLoading] = useState(true)
  const [darkMode, setDarkMode] = useState(true)
  const [editingCategory, setEditingCategory] = useState(null)
  const [inputValue, setInputValue] = useState('')
  const [alertsShown, setAlertsShown] = useState(false)

  const bg = darkMode ? "#0a0a0f" : "#f1f5f9"
  const cardBg = darkMode ? "#13131a" : "#ffffff"
  const border = darkMode ? "#1e1e2e" : "#e2e8f0"
  const text = darkMode ? "#e2e8f0" : "#1e293b"
  const subtext = darkMode ? "#64748b" : "#94a3b8"
  const inputBg = darkMode ? "#0d0d14" : "#f8fafc"

  // Fetch expenses + budgets
  useEffect(() => {
    if (user) {
      fetchAll()
    }
  }, [user])

  const fetchAll = async () => {
    setLoading(true)
    await Promise.all([fetchExpenses(), fetchBudgets()])
    setLoading(false)
  }

  const fetchExpenses = async () => {
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .eq('user_id', user.id)

    if (!error && data) setExpenses(data)
  }

  const fetchBudgets = async () => {
    const { data, error } = await supabase
      .from('budgets')
      .select('*')
      .eq('user_id', user.id)

    if (!error && data) {
      const budgetMap = {}
      data.forEach(b => { budgetMap[b.category] = b.amount })
      setBudgets(budgetMap)
    }
  }

  // Save budget
  const saveBudget = async (category, amount) => {
    if (!amount || isNaN(amount)) return

    const { error } = await supabase
      .from('budgets')
      .upsert({
        user_id: user.id,
        category,
        amount: Number(amount),
      }, { onConflict: 'user_id,category' })

    if (!error) {
      setBudgets(prev => ({ ...prev, [category]: Number(amount) }))
      toast.success(`✅ Budget set for ${category}!`, {
        style: { background: cardBg, color: text, border: `1px solid ${border}` }
      })
    }
    setEditingCategory(null)
    setInputValue('')
  }

  // Delete budget
  const deleteBudget = async (category) => {
    const { error } = await supabase
      .from('budgets')
      .delete()
      .eq('user_id', user.id)
      .eq('category', category)

    if (!error) {
      setBudgets(prev => {
        const updated = { ...prev }
        delete updated[category]
        return updated
      })
      toast.success(`Budget removed for ${category}`)
    }
  }

  // Current month spending
  const getCurrentMonthSpending = (category) => {
    const now = new Date()
    return expenses
      .filter(e =>
        e.type === 'expense' &&
        e.category === category &&
        new Date(e.date).getMonth() === now.getMonth() &&
        new Date(e.date).getFullYear() === now.getFullYear()
      )
      .reduce((sum, e) => sum + Number(e.amount), 0)
  }

  // Show alerts once data loaded
  useEffect(() => {
    if (!loading && !alertsShown && Object.keys(budgets).length > 0) {
      setAlertsShown(true)
      categories.forEach(cat => {
        if (budgets[cat]) {
          const spent = getCurrentMonthSpending(cat)
          const percentage = (spent / budgets[cat]) * 100
          if (percentage >= 100) {
            toast.error(`🚨 ${cat} budget exceeded! Spent ₨${spent.toLocaleString()}`, {
              duration: 5000,
              style: { background: cardBg, color: text, border: '1px solid #ef4444' }
            })
          } else if (percentage >= 80) {
            toast(`⚠️ ${cat} at ${Math.round(percentage)}% - ₨${(budgets[cat] - spent).toLocaleString()} left`, {
              duration: 4000,
              style: { background: cardBg, color: text, border: '1px solid #eab308' }
            })
          }
        }
      })
    }
  }, [loading, budgets, expenses])

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "#0a0a0f", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "16px" }}>
        <div style={{ fontSize: "32px" }}>💰</div>
        <p style={{ color: "#64748b", fontFamily: "'DM Sans', sans-serif" }}>Loading budgets...</p>
      </div>
    )
  }

  return (
    <div style={{ minHeight: "100vh", background: bg, fontFamily: "'DM Sans', sans-serif", color: text, transition: "all 0.3s" }}>
      <Toaster position="top-right" />

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 24px", borderBottom: `1px solid ${border}`, background: cardBg }}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <button onClick={() => navigate('/dashboard')}
            style={{ background: "transparent", border: `1px solid ${border}`, borderRadius: "8px", padding: "8px 12px", color: subtext, cursor: "pointer", fontSize: "13px" }}>
            ← Dashboard
          </button>
          <div>
            <h1 style={{ fontSize: "18px", fontWeight: "700" }}>💰 Budget Manager</h1>
            <p style={{ color: subtext, fontSize: "12px" }}>Set monthly spending limits</p>
          </div>
        </div>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <span style={{ fontSize: "16px" }}>☀️</span>
          <button onClick={() => setDarkMode(!darkMode)}
            style={{ width: "44px", height: "24px", borderRadius: "12px", border: "none", cursor: "pointer", position: "relative", background: darkMode ? "#6366f1" : "#cbd5e1", transition: "background 0.3s" }}>
            <div style={{ width: "18px", height: "18px", borderRadius: "50%", background: "white", position: "absolute", top: "3px", left: darkMode ? "23px" : "3px", transition: "left 0.3s" }} />
          </button>
          <span style={{ fontSize: "16px" }}>🌙</span>
          <button onClick={signOut}
            style={{ background: "transparent", border: `1px solid ${border}`, borderRadius: "8px", padding: "8px 14px", color: subtext, cursor: "pointer", fontSize: "13px" }}>
            Sign Out
          </button>
        </div>
      </div>

      {/* Summary Bar */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", padding: "20px 24px" }}>
        {[
          { label: "Categories Set", value: Object.keys(budgets).length, suffix: `/ ${categories.length}`, color: "#6366f1" },
          { label: "Over Budget", value: categories.filter(c => budgets[c] && getCurrentMonthSpending(c) > budgets[c]).length, suffix: "categories", color: "#ef4444" },
          { label: "On Track", value: categories.filter(c => budgets[c] && getCurrentMonthSpending(c) <= budgets[c] * 0.8).length, suffix: "categories", color: "#22c55e" },
        ].map(stat => (
          <div key={stat.label} style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: "14px", padding: "16px" }}>
            <p style={{ color: subtext, fontSize: "12px", marginBottom: "6px" }}>{stat.label}</p>
            <p style={{ fontSize: "22px", fontWeight: "700", color: stat.color }}>
              {stat.value} <span style={{ fontSize: "13px", color: subtext, fontWeight: "400" }}>{stat.suffix}</span>
            </p>
          </div>
        ))}
      </div>

      {/* Budget Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px", padding: "0 24px 24px" }}>
        {categories.map(cat => {
          const spent = getCurrentMonthSpending(cat)
          const budget = budgets[cat]
          const percentage = budget ? Math.min((spent / budget) * 100, 100) : 0
          const isOver = budget && spent > budget
          const isWarning = budget && percentage >= 80 && !isOver

          return (
            <div key={cat} style={{
              background: cardBg,
              border: `1px solid ${isOver ? '#ef4444' : isWarning ? '#eab308' : border}`,
              borderRadius: "16px", padding: "20px", transition: "all 0.3s"
            }}>
              {/* Header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div style={{ width: "40px", height: "40px", borderRadius: "12px", background: `${categoryColors[cat]}20`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px" }}>
                    {categoryIcons[cat]}
                  </div>
                  <div>
                    <p style={{ fontWeight: "600", fontSize: "15px", color: text }}>{cat}</p>
                    <p style={{ fontSize: "11px", color: subtext }}>This month</p>
                  </div>
                </div>
                {budget && (
                  <button onClick={() => deleteBudget(cat)}
                    style={{ background: "transparent", border: "none", color: subtext, cursor: "pointer", fontSize: "18px" }}>
                    ✕
                  </button>
                )}
              </div>

              {/* Amounts */}
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                <span style={{ fontSize: "13px", color: subtext }}>Spent</span>
                <span style={{ fontSize: "13px", fontWeight: "600", color: isOver ? "#ef4444" : text }}>
                  ₨{spent.toLocaleString()}
                  {budget ? ` / ₨${Number(budget).toLocaleString()}` : ''}
                </span>
              </div>

              {/* Progress Bar */}
              {budget && (
                <>
                  <div style={{ background: border, borderRadius: "6px", height: "8px", marginBottom: "8px" }}>
                    <div style={{
                      width: `${percentage}%`, height: "100%", borderRadius: "6px",
                      background: isOver ? "#ef4444" : isWarning ? "#eab308" : categoryColors[cat],
                      transition: "width 0.6s ease"
                    }} />
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                    <span style={{ fontSize: "11px", color: isOver ? "#ef4444" : isWarning ? "#eab308" : subtext }}>
                      {isOver ? "🚨 Over budget!" : isWarning ? "⚠️ Almost there!" : `${Math.round(percentage)}% used`}
                    </span>
                    {!isOver && budget && (
                      <span style={{ fontSize: "11px", color: "#22c55e" }}>
                        ₨{(Number(budget) - spent).toLocaleString()} left
                      </span>
                    )}
                  </div>
                </>
              )}

              {/* Edit Input */}
              {editingCategory === cat ? (
                <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
                  <input
                    type="number"
                    placeholder="Budget in PKR"
                    value={inputValue}
                    onChange={e => setInputValue(e.target.value)}
                    autoFocus
                    onKeyDown={e => e.key === 'Enter' && saveBudget(cat, inputValue)}
                    style={{ flex: 1, background: inputBg, border: `1px solid #6366f1`, borderRadius: "8px", padding: "8px 12px", color: text, fontSize: "13px", outline: "none" }}
                  />
                  <button onClick={() => saveBudget(cat, inputValue)}
                    style={{ background: "#6366f1", color: "white", border: "none", borderRadius: "8px", padding: "8px 14px", cursor: "pointer", fontWeight: "600", fontSize: "13px" }}>
                    Save
                  </button>
                  <button onClick={() => { setEditingCategory(null); setInputValue('') }}
                    style={{ background: inputBg, color: subtext, border: `1px solid ${border}`, borderRadius: "8px", padding: "8px 10px", cursor: "pointer", fontSize: "13px" }}>
                    ✕
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => { setEditingCategory(cat); setInputValue(budget ? String(budget) : '') }}
                  style={{ marginTop: "12px", width: "100%", background: "transparent", border: `1px dashed ${border}`, borderRadius: "8px", padding: "8px", color: subtext, cursor: "pointer", fontSize: "13px", transition: "all 0.2s", fontFamily: "'DM Sans', sans-serif" }}>
                  {budget ? "✏️ Edit Budget" : "+ Set Budget"}
                </button>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
