import { useState } from "react";

const initialExpenses = [
  { id: 1, title: "Grocery Shopping", amount: 2500, category: "Food", type: "expense", date: "2026-02-25" },
  { id: 2, title: "Freelance Payment", amount: 15000, category: "Income", type: "income", date: "2026-02-24" },
  { id: 3, title: "Electricity Bill", amount: 3200, category: "Utilities", type: "expense", date: "2026-02-23" },
  { id: 4, title: "Netflix", amount: 1200, category: "Entertainment", type: "expense", date: "2026-02-22" },
  { id: 5, title: "Salary", amount: 80000, category: "Income", type: "income", date: "2026-02-01" },
  { id: 6, title: "Petrol", amount: 4000, category: "Transport", type: "expense", date: "2026-02-20" },
];

const categoryColors = {
  Food: "#f97316",
  Income: "#22c55e",
  Utilities: "#3b82f6",
  Entertainment: "#a855f7",
  Transport: "#eab308",
  Shopping: "#ec4899",
  Health: "#14b8a6",
  Other: "#6b7280",
};

const categoryIcons = {
  Food: "🍔",
  Income: "💰",
  Utilities: "⚡",
  Entertainment: "🎬",
  Transport: "🚗",
  Shopping: "🛍️",
  Health: "❤️",
  Other: "📦",
};

export default function ExpenseTracker() {
  const [expenses, setExpenses] = useState(initialExpenses);
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [form, setForm] = useState({
    title: "",
    amount: "",
    category: "Food",
    type: "expense",
    date: new Date().toISOString().split("T")[0],
  });

  const totalIncome = expenses.filter(e => e.type === "income").reduce((s, e) => s + e.amount, 0);
  const totalExpense = expenses.filter(e => e.type === "expense").reduce((s, e) => s + e.amount, 0);
  const balance = totalIncome - totalExpense;

  const filtered = activeTab === "all" ? expenses : expenses.filter(e => e.type === activeTab);

  const handleAdd = () => {
    if (!form.title || !form.amount) return;
    setExpenses([{ ...form, id: Date.now(), amount: Number(form.amount) }, ...expenses]);
    setForm({ title: "", amount: "", category: "Food", type: "expense", date: new Date().toISOString().split("T")[0] });
    setShowModal(false);
  };

  const handleDelete = (id) => setExpenses(expenses.filter(e => e.id !== id));

  // Category breakdown
  const categoryBreakdown = expenses
    .filter(e => e.type === "expense")
    .reduce((acc, e) => {
      acc[e.category] = (acc[e.category] || 0) + e.amount;
      return acc;
    }, {});

  const maxCat = Math.max(...Object.values(categoryBreakdown), 1);

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0a0a0f",
      fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
      color: "#e2e8f0",
      padding: "24px",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .card { background: #13131a; border: 1px solid #1e1e2e; border-radius: 16px; }
        .btn-primary {
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          color: white; border: none; border-radius: 10px;
          padding: 10px 20px; cursor: pointer; font-weight: 600;
          font-size: 14px; transition: all 0.2s;
        }
        .btn-primary:hover { opacity: 0.9; transform: translateY(-1px); }
        .tab { background: transparent; border: none; color: #64748b; cursor: pointer; padding: 8px 16px; border-radius: 8px; font-size: 14px; font-weight: 500; transition: all 0.2s; }
        .tab.active { background: #1e1e2e; color: #e2e8f0; }
        .input { background: #0a0a0f; border: 1px solid #1e1e2e; border-radius: 10px; padding: 10px 14px; color: #e2e8f0; font-size: 14px; width: 100%; outline: none; }
        .input:focus { border-color: #6366f1; }
        .delete-btn { background: transparent; border: none; color: #ef4444; cursor: pointer; font-size: 16px; opacity: 0; transition: opacity 0.2s; }
        .expense-row:hover .delete-btn { opacity: 1; }
        .expense-row { transition: background 0.2s; border-radius: 12px; }
        .expense-row:hover { background: #1a1a24; }
        .overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.7); z-index: 50; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(4px); }
        .modal { background: #13131a; border: 1px solid #1e1e2e; border-radius: 20px; padding: 28px; width: 420px; max-width: 90vw; }
        .select { background: #0a0a0f; border: 1px solid #1e1e2e; border-radius: 10px; padding: 10px 14px; color: #e2e8f0; font-size: 14px; width: 100%; outline: none; }
        .bar { border-radius: 6px; transition: width 0.6s ease; }
      `}</style>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "28px" }}>
        <div>
          <h1 style={{ fontSize: "22px", fontWeight: "700", letterSpacing: "-0.5px" }}>
            💸 SpendSmart
          </h1>
          <p style={{ color: "#64748b", fontSize: "13px", marginTop: "2px" }}>February 2026</p>
        </div>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          + Add Transaction
        </button>
      </div>

      {/* Stats Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginBottom: "24px" }}>
        {[
          { label: "Balance", value: balance, color: balance >= 0 ? "#22c55e" : "#ef4444", icon: "💳" },
          { label: "Total Income", value: totalIncome, color: "#22c55e", icon: "📈" },
          { label: "Total Expenses", value: totalExpense, color: "#ef4444", icon: "📉" },
        ].map((stat) => (
          <div key={stat.label} className="card" style={{ padding: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <p style={{ color: "#64748b", fontSize: "12px", fontWeight: "500", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.5px" }}>{stat.label}</p>
                <p style={{ fontSize: "24px", fontWeight: "700", color: stat.color, fontFamily: "'DM Mono', monospace" }}>
                  ₨{stat.value.toLocaleString()}
                </p>
              </div>
              <span style={{ fontSize: "24px" }}>{stat.icon}</span>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: "20px" }}>
        {/* Transactions */}
        <div className="card" style={{ padding: "20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <h2 style={{ fontSize: "16px", fontWeight: "600" }}>Transactions</h2>
            <div style={{ display: "flex", gap: "4px", background: "#0a0a0f", padding: "4px", borderRadius: "10px" }}>
              {["all", "income", "expense"].map(t => (
                <button key={t} className={`tab ${activeTab === t ? "active" : ""}`} onClick={() => setActiveTab(t)}>
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            {filtered.length === 0 && (
              <p style={{ color: "#64748b", textAlign: "center", padding: "40px 0" }}>No transactions found</p>
            )}
            {filtered.map(exp => (
              <div key={exp.id} className="expense-row" style={{ display: "flex", alignItems: "center", padding: "12px", gap: "12px" }}>
                <div style={{
                  width: "42px", height: "42px", borderRadius: "12px",
                  background: `${categoryColors[exp.category]}15`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "20px", flexShrink: 0,
                }}>
                  {categoryIcons[exp.category] || "📦"}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: "500", fontSize: "14px" }}>{exp.title}</p>
                  <p style={{ color: "#64748b", fontSize: "12px", marginTop: "2px" }}>
                    {exp.category} • {exp.date}
                  </p>
                </div>
                <p style={{ fontWeight: "600", fontSize: "15px", fontFamily: "'DM Mono', monospace", color: exp.type === "income" ? "#22c55e" : "#ef4444" }}>
                  {exp.type === "income" ? "+" : "-"}₨{exp.amount.toLocaleString()}
                </p>
                <button className="delete-btn" onClick={() => handleDelete(exp.id)}>✕</button>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Savings Progress */}
          <div className="card" style={{ padding: "20px" }}>
            <h3 style={{ fontSize: "14px", fontWeight: "600", marginBottom: "16px" }}>Savings Rate</h3>
            <div style={{ position: "relative", width: "100%", aspectRatio: "1", maxWidth: "140px", margin: "0 auto 16px" }}>
              <svg viewBox="0 0 36 36" style={{ transform: "rotate(-90deg)", width: "100%", height: "100%" }}>
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="#1e1e2e" strokeWidth="3" />
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="#6366f1" strokeWidth="3"
                  strokeDasharray={`${Math.max(0, (balance / totalIncome) * 100)} 100`}
                  strokeLinecap="round" />
              </svg>
              <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontSize: "20px", fontWeight: "700", color: "#6366f1" }}>
                  {totalIncome > 0 ? Math.round((balance / totalIncome) * 100) : 0}%
                </span>
                <span style={{ fontSize: "10px", color: "#64748b" }}>saved</span>
              </div>
            </div>
          </div>

          {/* Category Breakdown */}
          <div className="card" style={{ padding: "20px" }}>
            <h3 style={{ fontSize: "14px", fontWeight: "600", marginBottom: "16px" }}>By Category</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {Object.entries(categoryBreakdown).map(([cat, amt]) => (
                <div key={cat}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                    <span style={{ fontSize: "12px", color: "#94a3b8" }}>{categoryIcons[cat]} {cat}</span>
                    <span style={{ fontSize: "12px", fontWeight: "600", fontFamily: "'DM Mono', monospace" }}>₨{amt.toLocaleString()}</span>
                  </div>
                  <div style={{ background: "#1e1e2e", borderRadius: "6px", height: "6px" }}>
                    <div className="bar" style={{ width: `${(amt / maxCat) * 100}%`, height: "100%", background: categoryColors[cat] || "#6366f1" }} />
                  </div>
                </div>
              ))}
              {Object.keys(categoryBreakdown).length === 0 && (
                <p style={{ color: "#64748b", fontSize: "12px" }}>No expenses yet</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
              <h2 style={{ fontSize: "18px", fontWeight: "700" }}>Add Transaction</h2>
              <button onClick={() => setShowModal(false)} style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer", fontSize: "20px" }}>✕</button>
            </div>

            {/* Type Toggle */}
            <div style={{ display: "flex", background: "#0a0a0f", borderRadius: "10px", padding: "4px", marginBottom: "16px" }}>
              {["expense", "income"].map(t => (
                <button key={t} onClick={() => setForm({ ...form, type: t })}
                  style={{
                    flex: 1, padding: "10px", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "600", fontSize: "14px",
                    background: form.type === t ? (t === "income" ? "#22c55e" : "#ef4444") : "transparent",
                    color: form.type === t ? "white" : "#64748b",
                    transition: "all 0.2s",
                  }}>
                  {t === "income" ? "💰 Income" : "💸 Expense"}
                </button>
              ))}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <input className="input" placeholder="Title (e.g. Grocery)" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
              <input className="input" placeholder="Amount (PKR)" type="number" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} />
              <select className="select" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                {["Food", "Transport", "Utilities", "Entertainment", "Shopping", "Health", "Other"].map(c => (
                  <option key={c}>{c}</option>
                ))}
              </select>
              <input className="input" type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
            </div>

            <button className="btn-primary" style={{ width: "100%", marginTop: "20px", padding: "14px" }} onClick={handleAdd}>
              Add Transaction
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
