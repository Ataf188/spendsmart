import { useState, useEffect } from "react";
import { supabase } from "./supabase";
import { useAuth } from "./context/AuthContext";
import { exportToPDF, exportToExcel } from './exportUtils'
import { useNavigate } from 'react-router-dom'
import toast, { Toaster } from 'react-hot-toast'
import AIAdvisor from "./components/AIAdvisor";


const categoryColors = {
  Food: "#f97316", Income: "#22c55e", Utilities: "#3b82f6",
  Entertainment: "#a855f7", Transport: "#eab308",
  Shopping: "#ec4899", Health: "#14b8a6", Other: "#6b7280",
};

const categoryIcons = {
  Food: "🍔", Income: "💰", Utilities: "⚡",
  Entertainment: "🎬", Transport: "🚗",
  Shopping: "🛍️", Health: "❤️", Other: "📦",
};

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export default function ExpenseTracker() {
  const navigate = useNavigate()
  const { user, signOut } = useAuth();

  const [expenses, setExpenses] = useState([]);
  const [budgets, setBudgets] = useState({});
  const [dbLoading, setDbLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [chartType, setChartType] = useState("bar");
  const [goals, setGoals] = useState([]);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [goalForm, setGoalForm] = useState({ title: "", target: "" });
  const [darkMode, setDarkMode] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [form, setForm] = useState({
    title: "", amount: "", category: "Food", type: "expense",
    date: new Date().toISOString().split("T")[0],
  });

  // ============================================
  // Supabase se data fetch karo
  // ============================================
  useEffect(() => {
    if (user) {
      fetchExpenses();
      fetchBudgets();
    }
  }, [user]);

  const fetchExpenses = async () => {
    setDbLoading(true);
    const { data, error } = await supabase
      .from("expenses")
      .select("*")
      .eq("user_id", user.id)
      .order("date", { ascending: false });

    if (error) console.error("Error fetching:", error.message);
    else setExpenses(data);
    setDbLoading(false);
  };

  const fetchBudgets = async () => {
    const { data, error } = await supabase
      .from("budgets")
      .select("*")
      .eq("user_id", user.id);

    if (!error && data) {
      const budgetMap = {};
      data.forEach(b => { budgetMap[b.category] = b.amount });
      setBudgets(budgetMap);
    }
  };

  // ============================================
  // Transaction add/update karo
  // ============================================
  const handleAdd = async () => {
    if (!form.title || !form.amount) return;

    const expenseData = {
      user_id: user.id,
      title: form.title,
      amount: Number(form.amount),
      category: form.category,
      type: form.type,
      date: form.date,
    };

    if (editingId) {
      const { data, error } = await supabase
        .from("expenses")
        .update(expenseData)
        .eq("id", editingId)
        .select();

      if (error) {
        toast.error("Update failed: " + error.message);
      } else {
        setExpenses(expenses.map(e => (e.id === editingId ? data[0] : e)));
        toast.success("Transaction updated!");
        resetForm();
      }
    } else {
      const { data, error } = await supabase
        .from("expenses")
        .insert([expenseData])
        .select();

      if (error) {
        toast.error("Add failed: " + error.message);
      } else {
        setExpenses([data[0], ...expenses]);
        toast.success("Transaction added!");
        resetForm();
      }
    }
  };

  const handleEdit = (exp) => {
    setForm({ title: exp.title, amount: exp.amount, category: exp.category, type: exp.type, date: exp.date });
    setEditingId(exp.id);
    setShowModal(true);
  };

  const resetForm = () => {
    setForm({
      title: "", amount: "", category: "Food", type: "expense",
      date: new Date().toISOString().split("T")[0],
    });
    setEditingId(null);
    setShowModal(false);
  };

  // ============================================
  // Goals logic (Local Storage for now)
  // ============================================
  useEffect(() => {
    const savedGoals = localStorage.getItem(`goals_${user?.id}`);
    if (savedGoals) setGoals(JSON.parse(savedGoals));
  }, [user]);

  useEffect(() => {
    if (user?.id) localStorage.setItem(`goals_${user.id}`, JSON.stringify(goals));
  }, [goals, user]);

  const handleAddGoal = () => {
    if (!goalForm.title || !goalForm.target) return;
    const newGoal = {
      id: Date.now(),
      title: goalForm.title,
      target: Number(goalForm.target),
      current: 0 // Will be compared against balance in UI
    };
    setGoals([...goals, newGoal]);
    setGoalForm({ title: "", target: "" });
    setShowGoalModal(false);
    toast.success("Goal set!");
  };

  const handleDeleteGoal = (id) => {
    setGoals(goals.filter(g => g.id !== id));
    toast.success("Goal removed");
  };
  const handleDelete = async (id) => {
    const { error } = await supabase
      .from("expenses")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error("Delete failed: " + error.message);
    } else {
      setExpenses(expenses.filter(e => e.id !== id));
      toast.success("Deleted!");
    }
  };

  // ============================================
  // Filter & Stats
  // ============================================
  const filtered = expenses.filter(e => {
    const matchTab = activeTab === "all" || e.type === activeTab;
    const matchSearch = e.title.toLowerCase().includes(search.toLowerCase()) ||
      e.category.toLowerCase().includes(search.toLowerCase());
    const matchFrom = !dateFrom || e.date >= dateFrom;
    const matchTo = !dateTo || e.date <= dateTo;
    return matchTab && matchSearch && matchFrom && matchTo;
  });

  const totalIncome = expenses.filter(e => e.type === "income").reduce((s, e) => s + Number(e.amount), 0);
  const totalExpense = expenses.filter(e => e.type === "expense").reduce((s, e) => s + Number(e.amount), 0);
  const balance = totalIncome - totalExpense;

  const totalBudget = Object.values(budgets).reduce((s, b) => s + b, 0);

  const monthlyData = months.map((m, i) => {
    const inc = expenses.filter(e => e.type === "income" && new Date(e.date).getMonth() === i).reduce((s, e) => s + Number(e.amount), 0);
    const exp = expenses.filter(e => e.type === "expense" && new Date(e.date).getMonth() === i).reduce((s, e) => s + Number(e.amount), 0);
    return { month: m, income: inc, expense: exp };
  });
  const maxMonthly = Math.max(...monthlyData.map(d => Math.max(d.income, d.expense)), 1);

  // Category Breakdown
  const categorySummary = expenses
    .filter(e => e.type === 'expense' && new Date(e.date).getMonth() === new Date().getMonth())
    .reduce((acc, e) => {
      acc[e.category] = (acc[e.category] || 0) + e.amount;
      return acc;
    }, {});

  const categoryBreakdown = expenses
    .filter(e => e.type === "expense")
    .reduce((acc, e) => { acc[e.category] = (acc[e.category] || 0) + Number(e.amount); return acc; }, {});
  const maxCat = Math.max(...Object.values(categoryBreakdown), 1);

  // Theme Colors
  const bg = darkMode ? "#0a0a0f" : "#f1f5f9";
  const cardBg = darkMode ? "#13131a" : "#ffffff";
  const border = darkMode ? "#1e1e2e" : "#e2e8f0";
  const text = darkMode ? "#e2e8f0" : "#1e293b";
  const subtext = darkMode ? "#64748b" : "#94a3b8";
  const inputBg = darkMode ? "#0d0d14" : "#f8fafc";

  // Loading Screen
  if (dbLoading) {
    return (
      <div style={{ minHeight: "100vh", background: "#0a0a0f", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "16px" }}>
        <div style={{ fontSize: "32px" }}>💸</div>
        <p style={{ color: "#64748b", fontFamily: "'DM Sans', sans-serif" }}>Loading your data...</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: bg, fontFamily: "'DM Sans','Segoe UI',sans-serif", color: text, padding: "24px", transition: "all 0.3s" }}>
      <Toaster position="top-right" />
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .btn-primary { background: linear-gradient(135deg,#6366f1,#8b5cf6); color: white; border: none; border-radius: 10px; padding: 10px 20px; cursor: pointer; font-weight: 600; font-size: 14px; transition: all 0.2s; }
        .btn-primary:hover { opacity: 0.9; transform: translateY(-1px); }
        .tab { background: transparent; border: none; color: #64748b; cursor: pointer; padding: 8px 16px; border-radius: 8px; font-size: 14px; font-weight: 500; transition: all 0.2s; }
        .edit-btn, .delete-btn { background: transparent; border: none; cursor: pointer; font-size: 16px; opacity: 0; transition: opacity 0.2s; padding: 4px 8px; }
        .edit-btn { color: #6366f1; }
        .delete-btn { color: #ef4444; }
        .expense-row:hover .delete-btn, .expense-row:hover .edit-btn { opacity: 1; }
        .expense-row { transition: all 0.2s ease; border-radius: 12px; animation: fadeIn 0.3s ease-out; }
        .expense-row:hover { background: rgba(99,102,241,0.05); transform: translateX(4px); }
        .overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.7); z-index: 100; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(4px); animation: fadeIn 0.2s ease; }
        .modal { background: #13131a; border: 1px solid #1e1e2e; border-radius: 20px; padding: 28px; width: 420px; max-width: 90vw; animation: scaleIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); }
        .chart-bar { border-radius: 4px 4px 0 0; transition: height 0.6s cubic-bezier(0.34, 1.56, 0.64, 1); cursor: pointer; }
        .chart-bar:hover { opacity: 0.8; }
        ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-track { background: transparent; } ::-webkit-scrollbar-thumb { background: #6366f1; border-radius: 2px; }
        .toggle { width: 44px; height: 24px; border-radius: 12px; border: none; cursor: pointer; position: relative; transition: background 0.3s; }
        .toggle-dot { width: 18px; height: 18px; border-radius: 50%; background: white; position: absolute; top: 3px; transition: left 0.3s; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes scaleIn { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
        .signout-btn { background: transparent; border: 1px solid #1e1e2e; border-radius: 8px; padding: 8px 14px; color: #64748b; cursor: pointer; font-size: 13px; transition: all 0.2s; }
        .signout-btn:hover { border-color: #ef4444; color: #ef4444; }
      `}</style>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "28px" }}>
        <div>
          <h1 style={{ fontSize: "22px", fontWeight: "700", letterSpacing: "-0.5px" }}>💸 SpendSmart</h1>
          <p style={{ color: subtext, fontSize: "13px", marginTop: "2px" }}>
            Welcome, {user?.user_metadata?.full_name || user?.email} 👋
          </p>
        </div>
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <span style={{ fontSize: "16px" }}>☀️</span>
          <button className="toggle" onClick={() => setDarkMode(!darkMode)}
            style={{ background: darkMode ? "#6366f1" : "#cbd5e1" }}>
            <div className="toggle-dot" style={{ left: darkMode ? "23px" : "3px" }} />
          </button>
          <span style={{ fontSize: "16px" }}>🌙</span>
          <button className="btn-primary" onClick={() => setShowModal(true)}>+ Add</button>
          <button onClick={() => exportToPDF(expenses, totalIncome, totalExpense, balance)}
            style={{ background: "#ef4444", color: "white", border: "none", borderRadius: "8px", padding: "8px 14px", cursor: "pointer", fontSize: "13px", fontWeight: "600" }}>
            📄 PDF
          </button>

          <button onClick={() => exportToExcel(expenses, totalIncome, totalExpense, balance)}
            style={{ background: "#22c55e", color: "white", border: "none", borderRadius: "8px", padding: "8px 14px", cursor: "pointer", fontSize: "13px", fontWeight: "600" }}>
            📊 Excel
          </button>
          <button onClick={() => navigate('/budget')}
            style={{ background: "#eab308", color: "white", border: "none", borderRadius: "8px", padding: "8px 14px", cursor: "pointer", fontSize: "13px", fontWeight: "600" }}>
            💰 Budgets
          </button>
          <button className="signout-btn" onClick={signOut}>Sign Out</button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "16px", marginBottom: "24px" }}>
        {[
          { label: "Balance", value: balance, color: balance >= 0 ? "#22c55e" : "#ef4444", icon: "💳" },
          { label: "Total Income", value: totalIncome, color: "#22c55e", icon: "📈" },
          { label: "Total Expenses", value: totalExpense, color: "#ef4444", icon: "📉" },
        ].map(stat => (
          <div key={stat.label} style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: "16px", padding: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <p style={{ color: subtext, fontSize: "12px", fontWeight: "500", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.5px" }}>{stat.label}</p>
                <p style={{ fontSize: "24px", fontWeight: "700", color: stat.color, fontFamily: "'DM Mono',monospace" }}>
                  ₨{stat.value.toLocaleString()}
                </p>
              </div>
              <span style={{ fontSize: "24px" }}>{stat.icon}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Monthly Chart */}
      {/* Monthly Overview */}
      <div style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: "16px", padding: "20px", marginBottom: "20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <h2 style={{ fontSize: "16px", fontWeight: "600" }}>Monthly Overview</h2>
          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            <div style={{ display: "flex", gap: "4px", background: inputBg, padding: "2px", borderRadius: "8px", border: `1px solid ${border}` }}>
              <button onClick={() => setChartType("bar")} style={{ padding: "4px 8px", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "11px", fontWeight: "600", background: chartType === "bar" ? "#6366f1" : "transparent", color: chartType === "bar" ? "white" : subtext }}>Bar</button>
              <button onClick={() => setChartType("line")} style={{ padding: "4px 8px", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "11px", fontWeight: "600", background: chartType === "line" ? "#6366f1" : "transparent", color: chartType === "line" ? "white" : subtext }}>Line</button>
            </div>
            <div style={{ display: "flex", gap: "12px" }}>
              {[["#22c55e", "Income"], ["#ef4444", "Expense"]].map(([color, label]) => (
                <div key={label} style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                  <div style={{ width: "10px", height: "10px", borderRadius: "2px", background: color }} />
                  <span style={{ fontSize: "12px", color: subtext }}>{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {chartType === "bar" ? (
          <div style={{ display: "flex", alignItems: "flex-end", gap: "8px", height: "120px" }}>
            {monthlyData.map((d, i) => (
              <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "2px", height: "100%" }}>
                <div style={{ flex: 1, display: "flex", alignItems: "flex-end", gap: "2px", width: "100%" }}>
                  <div className="chart-bar" title={`Income: ₨${d.income.toLocaleString()}`}
                    style={{ flex: 1, height: `${(d.income / maxMonthly) * 100}%`, minHeight: d.income > 0 ? "4px" : "0", background: "#22c55e", opacity: 0.8 }} />
                  <div className="chart-bar" title={`Expense: ₨${d.expense.toLocaleString()}`}
                    style={{ flex: 1, height: `${(d.expense / maxMonthly) * 100}%`, minHeight: d.expense > 0 ? "4px" : "0", background: "#ef4444", opacity: 0.8 }} />
                </div>
                <span style={{ fontSize: "10px", color: subtext }}>{d.month}</span>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ height: "140px", width: "100%", position: "relative" }}>
            <svg viewBox={`0 0 ${months.length * 40} 100`} preserveAspectRatio="none" style={{ width: "100%", height: "120px", display: "block" }}>
              <polyline fill="none" stroke="#22c55e" strokeWidth="2" strokeLinejoin="round" points={monthlyData.map((d, i) => `${i * 40 + 20},${100 - (d.income / maxMonthly) * 80 - 10}`).join(" ")} />
              <polyline fill="none" stroke="#ef4444" strokeWidth="2" strokeLinejoin="round" points={monthlyData.map((d, i) => `${i * 40 + 20},${100 - (d.expense / maxMonthly) * 80 - 10}`).join(" ")} />
              {monthlyData.map((d, i) => (
                <g key={i}>
                  <circle cx={i * 40 + 20} cy={100 - (d.income / maxMonthly) * 80 - 10} r="3" fill="#22c55e" />
                  <circle cx={i * 40 + 20} cy={100 - (d.expense / maxMonthly) * 80 - 10} r="3" fill="#ef4444" />
                </g>
              ))}
            </svg>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "4px", padding: "0 10px" }}>
              {months.map(m => <span key={m} style={{ fontSize: "10px", color: subtext }}>{m}</span>)}
            </div>
          </div>
        )}
      </div>

      {/* Category Breakdown (New Analytics Section) */}
      <div style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: "16px", padding: "20px", marginBottom: "20px" }}>
        <h2 style={{ fontSize: "16px", fontWeight: "600", marginBottom: "16px" }}>Category Breakdown (This Month)</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "16px" }}>
          {Object.entries(categorySummary).length === 0 && <p style={{ fontSize: "12px", color: subtext }}>No spending recorded this month.</p>}
          {Object.entries(categorySummary).map(([cat, amt]) => {
            const budget = budgets[cat] || 0;
            const percent = budget > 0 ? Math.min(100, (amt / budget) * 100) : 0;
            return (
              <div key={cat} style={{ background: inputBg, padding: "12px", borderRadius: "12px", border: `1px solid ${border}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                  <span style={{ fontSize: "13px", fontWeight: "600" }}>{cat}</span>
                  <span style={{ fontSize: "12px", color: subtext }}>₨{amt.toLocaleString()}</span>
                </div>
                {budget > 0 && (
                  <div style={{ background: border, height: "4px", borderRadius: "2px", overflow: "hidden" }}>
                    <div style={{ width: `${percent}%`, height: "100%", background: percent > 100 ? "#ef4444" : "#6366f1", borderRadius: "2px" }} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: "20px" }}>
        {/* Transactions */}
        <div style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: "16px", padding: "20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <h2 style={{ fontSize: "16px", fontWeight: "600" }}>Transactions</h2>
            <div style={{ display: "flex", gap: "4px", background: inputBg, padding: "4px", borderRadius: "10px", border: `1px solid ${border}` }}>
              {["all", "income", "expense"].map(t => (
                <button key={t} className="tab"
                  style={activeTab === t ? { background: "#6366f1", color: "white", borderRadius: "8px" } : { color: subtext }}
                  onClick={() => setActiveTab(t)}>
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="🔍 Search transactions..."
            style={{ background: inputBg, border: `1px solid ${border}`, borderRadius: "10px", padding: "10px 14px", color: text, fontSize: "14px", width: "100%", outline: "none", marginBottom: "12px" }} />

          <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
            <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
              style={{ background: inputBg, border: `1px solid ${border}`, borderRadius: "10px", padding: "8px 12px", color: text, fontSize: "12px", flex: 1, outline: "none" }} />
            <span style={{ color: subtext, alignSelf: "center" }}>to</span>
            <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
              style={{ background: inputBg, border: `1px solid ${border}`, borderRadius: "10px", padding: "8px 12px", color: text, fontSize: "12px", flex: 1, outline: "none" }} />
            {(dateFrom || dateTo) && (
              <button onClick={() => { setDateFrom(""); setDateTo(""); }}
                style={{ background: "#ef444420", border: "none", borderRadius: "8px", padding: "8px 12px", color: "#ef4444", cursor: "pointer", fontSize: "12px" }}>
                Clear
              </button>
            )}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "4px", maxHeight: "400px", overflowY: "auto" }}>
            {filtered.length === 0 && (
              <p style={{ color: subtext, textAlign: "center", padding: "40px 0" }}>
                {expenses.length === 0 ? "No transactions yet. Add your first one! 🎉" : "No transactions found"}
              </p>
            )}
            {filtered.map(exp => (
              <div key={exp.id} className="expense-row" style={{ display: "flex", alignItems: "center", padding: "12px", gap: "12px" }}>
                <div style={{ width: "42px", height: "42px", borderRadius: "12px", background: `${categoryColors[exp.category]}20`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", flexShrink: 0 }}>
                  {categoryIcons[exp.category] || "📦"}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: "500", fontSize: "14px" }}>{exp.title}</p>
                  <p style={{ color: subtext, fontSize: "12px", marginTop: "2px" }}>{exp.category} • {exp.date}</p>
                </div>
                <p style={{ fontWeight: "600", fontSize: "15px", fontFamily: "'DM Mono',monospace", color: exp.type === "income" ? "#22c55e" : "#ef4444" }}>
                  {exp.type === "income" ? "+" : "-"}₨{Number(exp.amount).toLocaleString()}
                </p>
                <div style={{ display: "flex", gap: "4px" }}>
                  <button className="edit-btn" onClick={() => handleEdit(exp)}>✏️</button>
                  <button className="delete-btn" onClick={() => handleDelete(exp.id)}>✕</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* AI Advisor */}
          <AIAdvisor
            expenses={expenses}
            budgets={budgets}
            balance={balance}
            totalIncome={totalIncome}
          />

          {/* Savings Goals */}
          <div style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: "16px", padding: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 style={{ fontSize: "14px", fontWeight: "600" }}>Savings Goals</h3>
              <button onClick={() => setShowGoalModal(true)} style={{ background: "transparent", border: "none", color: "#6366f1", cursor: "pointer", fontSize: "18px" }}>+</button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {goals.length === 0 && <p style={{ fontSize: "12px", color: subtext, textAlign: "center" }}>No goals set yet</p>}
              {goals.map(goal => {
                const progress = Math.min(100, Math.max(0, (balance / goal.target) * 100));
                return (
                  <div key={goal.id}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                      <span style={{ fontSize: "13px", color: text, fontWeight: "500" }}>{goal.title}</span>
                      <button onClick={() => handleDeleteGoal(goal.id)} style={{ background: "transparent", border: "none", color: subtext, cursor: "pointer", fontSize: "10px" }}>✕</button>
                    </div>
                    <div style={{ background: border, height: "6px", borderRadius: "3px", overflow: "hidden", marginBottom: "4px" }}>
                      <div style={{ width: `${progress}%`, height: "100%", background: "linear-gradient(90deg, #6366f1, #8b5cf6)", borderRadius: "3px", transition: "width 0.6s ease" }} />
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10px", color: subtext }}>
                      <span>₨{balance.toLocaleString()}</span>
                      <span>Target: ₨{goal.target.toLocaleString()}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: "16px", padding: "20px" }}>
            <h3 style={{ fontSize: "14px", fontWeight: "600", marginBottom: "16px" }}>Savings Rate</h3>
            <div style={{ position: "relative", width: "140px", height: "140px", margin: "0 auto 12px" }}>
              <svg viewBox="0 0 36 36" style={{ transform: "rotate(-90deg)", width: "100%", height: "100%" }}>
                <circle cx="18" cy="18" r="15.9" fill="none" stroke={border} strokeWidth="3" />
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="#6366f1" strokeWidth="3"
                  strokeDasharray={`${Math.max(0, Math.min(100, (balance / Math.max(totalIncome, 1)) * 100))} 100`}
                  strokeLinecap="round" style={{ transition: "stroke-dasharray 0.6s ease" }} />
              </svg>
              <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontSize: "22px", fontWeight: "700", color: "#6366f1" }}>
                  {totalIncome > 0 ? Math.round((balance / totalIncome) * 100) : 0}%
                </span>
                <span style={{ fontSize: "10px", color: subtext }}>saved</span>
              </div>
            </div>
            {totalBudget > 0 && (
              <div style={{ textAlign: "center", marginTop: "12px" }}>
                <p style={{ fontSize: "11px", color: subtext }}>Budget Goal</p>
                <p style={{ fontSize: "13px", fontWeight: "600", color: balance >= 0 ? "#22c55e" : "#ef4444" }}>
                  ₨{balance.toLocaleString()} remaining
                </p>
              </div>
            )}
          </div>

          <div style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: "16px", padding: "20px" }}>
            <h3 style={{ fontSize: "14px", fontWeight: "600", marginBottom: "16px" }}>By Category</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {Object.entries(categoryBreakdown).sort((a, b) => b[1] - a[1]).map(([cat, amt]) => (
                <div key={cat}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                    <span style={{ fontSize: "12px", color: subtext }}>{categoryIcons[cat]} {cat}</span>
                    <span style={{ fontSize: "12px", fontWeight: "600", fontFamily: "'DM Mono',monospace" }}>₨{amt.toLocaleString()}</span>
                  </div>
                  <div style={{ background: border, borderRadius: "6px", height: "6px" }}>
                    <div style={{ width: `${(amt / maxCat) * 100}%`, height: "100%", borderRadius: "6px", background: categoryColors[cat] || "#6366f1", transition: "width 0.6s ease" }} />
                  </div>
                </div>
              ))}
              {Object.keys(categoryBreakdown).length === 0 && (
                <p style={{ color: subtext, fontSize: "12px" }}>No expenses yet</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="overlay" onClick={() => setShowModal(false)}>
          <div onClick={e => e.stopPropagation()} style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: "20px", padding: "28px", width: "420px", maxWidth: "90vw" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
              <h2 style={{ fontSize: "18px", fontWeight: "700" }}>Add Transaction</h2>
              <button onClick={() => setShowModal(false)} style={{ background: "none", border: "none", color: subtext, cursor: "pointer", fontSize: "20px" }}>✕</button>
            </div>
            <div style={{ display: "flex", background: inputBg, borderRadius: "10px", padding: "4px", marginBottom: "16px", border: `1px solid ${border}` }}>
              {["expense", "income"].map(t => (
                <button key={t} onClick={() => setForm({ ...form, type: t })}
                  style={{ flex: 1, padding: "10px", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "600", fontSize: "14px", background: form.type === t ? (t === "income" ? "#22c55e" : "#ef4444") : "transparent", color: form.type === t ? "white" : subtext, transition: "all 0.2s" }}>
                  {t === "income" ? "💰 Income" : "💸 Expense"}
                </button>
              ))}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <input placeholder="Title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                style={{ background: inputBg, border: `1px solid ${border}`, borderRadius: "10px", padding: "10px 14px", color: text, fontSize: "14px", outline: "none" }} />
              <input placeholder="Amount (PKR)" type="number" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })}
                style={{ background: inputBg, border: `1px solid ${border}`, borderRadius: "10px", padding: "10px 14px", color: text, fontSize: "14px", outline: "none" }} />
              <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
                style={{ background: inputBg, border: `1px solid ${border}`, borderRadius: "10px", padding: "10px 14px", color: text, fontSize: "14px", outline: "none" }}>
                {["Food", "Transport", "Utilities", "Entertainment", "Shopping", "Health", "Other"].map(c => (
                  <option key={c}>{c}</option>
                ))}
              </select>
              <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })}
                style={{ background: inputBg, border: `1px solid ${border}`, borderRadius: "10px", padding: "10px 14px", color: text, fontSize: "14px", outline: "none" }} />
            </div>
            <button className="btn-primary" style={{ width: "100%", marginTop: "20px", padding: "14px" }} onClick={handleAdd}>
              {editingId ? "Update Transaction" : "Add Transaction"}
            </button>
          </div>
        </div>
      )}
      {/* Goal Modal */}
      {showGoalModal && (
        <div className="overlay" onClick={(e) => e.target === e.currentTarget && setShowGoalModal(false)}>
          <div className="modal">
            <h2 style={{ fontSize: "20px", fontWeight: "700", marginBottom: "20px" }}>Set Savings Goal</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "13px", color: subtext, marginBottom: "6px" }}>What are you saving for?</label>
                <input type="text" placeholder="e.g. New Laptop, Vacation" value={goalForm.title} onChange={e => setGoalForm({ ...goalForm, title: e.target.value })}
                  style={{ width: "100%", background: inputBg, border: `1px solid ${border}`, borderRadius: "10px", padding: "12px", color: text, outline: "none" }} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "13px", color: subtext, marginBottom: "6px" }}>Target Amount (₨)</label>
                <input type="number" placeholder="50,000" value={goalForm.target} onChange={e => setGoalForm({ ...goalForm, target: e.target.value })}
                  style={{ width: "100%", background: inputBg, border: `1px solid ${border}`, borderRadius: "10px", padding: "12px", color: text, outline: "none" }} />
              </div>
              <button className="btn-primary" style={{ marginTop: "10px" }} onClick={handleAddGoal}>Set Goal</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
