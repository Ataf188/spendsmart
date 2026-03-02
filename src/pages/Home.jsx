import { useNavigate } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'

export default function Home() {
  const navigate = useNavigate()
  const observerRef = useRef(null)
  const [darkMode, setDarkMode] = useState(true)

  const bg = darkMode ? "#060608" : "#f1f5f9"
  const text = darkMode ? "#e8e8f0" : "#1e293b"
  const subtext = darkMode ? "#64748b" : "#94a3b8"
  const cardBg = darkMode ? "#0e0e14" : "#ffffff"
  const border = darkMode ? "#1a1a28" : "#e2e8f0"
  const navBg = darkMode ? "rgba(6,6,8,0.85)" : "rgba(241,245,249,0.85)"
  const inputBg = darkMode ? "#0a0a0f" : "#f8fafc"

  useEffect(() => {
    observerRef.current = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) entry.target.classList.add('visible')
      })
    }, { threshold: 0.1 })

    document.querySelectorAll('.fade-up').forEach(el => observerRef.current.observe(el))
    return () => observerRef.current?.disconnect()
  }, [])

  const features = [
    { icon: "📊", bg: "rgba(99,102,241,0.15)", title: "Beautiful Dashboard", desc: "See your full financial picture with charts, stats, and category breakdowns." },
    { icon: "💰", bg: "rgba(234,179,8,0.15)", title: "Budget Alerts", desc: "Set monthly limits per category. Get notified at 80% and 100% so you never overspend." },
    { icon: "📄", bg: "rgba(34,197,94,0.15)", title: "PDF & Excel Export", desc: "Download transactions as PDF reports or Excel sheets with 3 detailed summary tabs." },
    { icon: "🔍", bg: "rgba(168,85,247,0.15)", title: "Smart Search & Filter", desc: "Find any transaction instantly. Filter by date range, category, or income vs expense." },
    { icon: "🌙", bg: "rgba(99,102,241,0.15)", title: "Dark & Light Mode", desc: "Easy on the eyes at any time of day. Switch between themes instantly." },
    { icon: "🔒", bg: "rgba(239,68,68,0.15)", title: "Secure & Private", desc: "Your data is encrypted. Only you can see your financial information." },
  ]

  const testimonials = [
    { text: "Finally a finance app that doesn't feel like a spreadsheet! The budget alerts saved me from overspending.", name: "Ahmed K.", role: "Freelancer, Lahore", emoji: "👨‍💻", bg: "rgba(99,102,241,0.2)" },
    { text: "The PDF export is amazing. I use it every month to track where our money went. Highly recommend!", name: "Bilal R.", role: "Business Owner, Karachi", emoji: "👨‍💼", bg: "rgba(34,197,94,0.2)" },
    { text: "Super clean design and very easy to use. I can see all my expenses in one place!", name: "Sara M.", role: "Student, Islamabad", emoji: "👩‍🎓", bg: "rgba(168,85,247,0.2)" },
  ]

  const barHeights = [35, 20, 60, 15, 80, 40, 90, 55, 70, 45, 85, 95]

  return (
    <div style={{ background: bg, color: text, fontFamily: "'DM Sans', sans-serif", overflowX: "hidden", transition: "all 0.3s" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .orb { position: fixed; border-radius: 50%; filter: blur(120px); opacity: 0.1; pointer-events: none; z-index: 0; }
        .fade-up { opacity: 0; transform: translateY(24px); transition: opacity 0.6s ease, transform 0.6s ease; }
        .fade-up.visible { opacity: 1; transform: translateY(0); }
        .feature-card { transition: all 0.3s; cursor: default; }
        .feature-card:hover { border-color: #6366f1 !important; transform: translateY(-4px); box-shadow: 0 20px 40px rgba(99,102,241,0.1); }
        .nav-link { color: #64748b; text-decoration: none; font-size: 14px; transition: color 0.2s; }
        .nav-link:hover { color: #e8e8f0; }
        .btn-primary { background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; border: none; border-radius: 12px; padding: 14px 30px; font-size: 15px; font-weight: 600; cursor: pointer; font-family: 'DM Sans', sans-serif; transition: all 0.2s; }
        .btn-primary:hover { opacity: 0.9; transform: translateY(-2px); box-shadow: 0 20px 40px rgba(99,102,241,0.3); }
        .btn-secondary { background: transparent; color: #e8e8f0; border: 1px solid #1a1a28; border-radius: 12px; padding: 14px 30px; font-size: 15px; font-weight: 600; cursor: pointer; font-family: 'DM Sans', sans-serif; transition: all 0.2s; }
        .btn-secondary:hover { border-color: #6366f1; color: #6366f1; }
        .pricing-btn-free { width: 100%; padding: 13px; border-radius: 10px; font-size: 15px; font-weight: 600; cursor: pointer; font-family: 'DM Sans', sans-serif; background: transparent; border: 1px solid #1a1a28; color: #e8e8f0; transition: all 0.2s; }
        .pricing-btn-free:hover { border-color: #6366f1; }
        .pricing-btn-paid { width: 100%; padding: 13px; border-radius: 10px; font-size: 15px; font-weight: 600; cursor: pointer; font-family: 'DM Sans', sans-serif; background: linear-gradient(135deg, #6366f1, #8b5cf6); border: none; color: white; transition: all 0.2s; }
        .pricing-btn-paid:hover { opacity: 0.9; transform: translateY(-1px); }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
        .hero-badge { animation: fadeUp 0.6s ease both; }
        .hero-h1 { animation: fadeUp 0.6s ease 0.1s both; }
        .hero-p { animation: fadeUp 0.6s ease 0.2s both; }
        .hero-btns { animation: fadeUp 0.6s ease 0.3s both; }
        .hero-preview { animation: fadeUp 0.8s ease 0.4s both; }
        @media (max-width: 768px) {
          .nav-links-desktop { display: none !important; }
          .features-grid { grid-template-columns: 1fr !important; }
          .pricing-grid { grid-template-columns: 1fr !important; }
          .testimonials-grid { grid-template-columns: 1fr !important; }
          .stats-grid { gap: 20px !important; }
          .fake-stats { grid-template-columns: repeat(3, 1fr) !important; }
          .hero-btns-inner { flex-direction: column !important; align-items: center !important; }
        }
      `}</style>

      {/* Background Orbs */}
      <div className="orb" style={{ width: "600px", height: "600px", background: "#6366f1", top: "-200px", left: "-200px" }} />
      <div className="orb" style={{ width: "500px", height: "500px", background: "#22c55e", bottom: "10%", right: "-150px" }} />
      <div className="orb" style={{ width: "400px", height: "400px", background: "#8b5cf6", top: "40%", left: "30%" }} />

      {/* NAV */}
      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, padding: "16px 40px", display: "flex", justifyContent: "space-between", alignItems: "center", background: navBg, backdropFilter: "blur(20px)", borderBottom: `1px solid ${border}` }}>
        <div style={{ fontFamily: "'Syne', sans-serif", fontSize: "20px", fontWeight: 800, color: text }}>💸 SpendSmart</div>
        <div className="nav-links-desktop" style={{ display: "flex", gap: "32px" }}>
          <a href="#features" className="nav-link" style={{ color: subtext }}>Features</a>
          <a href="#pricing" className="nav-link" style={{ color: subtext }}>Pricing</a>
          <a href="#testimonials" className="nav-link" style={{ color: subtext }}>Reviews</a>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {/* Dark/Light Toggle */}
          <span style={{ fontSize: "14px" }}>☀️</span>
          <button onClick={() => setDarkMode(!darkMode)}
            style={{ width: "44px", height: "24px", borderRadius: "12px", border: "none", cursor: "pointer", position: "relative", background: darkMode ? "#6366f1" : "#cbd5e1", transition: "background 0.3s" }}>
            <div style={{ width: "18px", height: "18px", borderRadius: "50%", background: "white", position: "absolute", top: "3px", left: darkMode ? "23px" : "3px", transition: "left 0.3s" }} />
          </button>
          <span style={{ fontSize: "14px" }}>🌙</span>
          <button className="btn-primary" style={{ padding: "10px 22px", fontSize: "14px", borderRadius: "10px" }} onClick={() => navigate('/signup')}>
            Get Started Free →
          </button>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "120px 20px 80px", position: "relative", zIndex: 1 }}>
        <div style={{ maxWidth: "900px", width: "100%" }}>
          <div className="hero-badge" style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.3)", borderRadius: "100px", padding: "6px 16px", fontSize: "13px", color: "#a5b4fc", marginBottom: "28px" }}>
            ✨ Now with Budget Alerts & PDF Export
          </div>

          <h1 className="hero-h1" style={{ fontFamily: "'Syne', sans-serif", fontSize: "clamp(42px, 7vw, 76px)", fontWeight: 800, lineHeight: 1.1, letterSpacing: "-2px", marginBottom: "24px" }}>
            Take Control of<br />
            <span style={{ background: "linear-gradient(135deg, #6366f1, #22c55e)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>Your Money</span> Today
          </h1>

          <p className="hero-p" style={{ fontSize: "18px", color: "#64748b", maxWidth: "560px", margin: "0 auto 40px", lineHeight: 1.7 }}>
            SpendSmart helps you track expenses, set budgets, and understand your spending — all in one beautiful dashboard.
          </p>

          <div className="hero-btns">
            <div className="hero-btns-inner" style={{ display: "flex", gap: "14px", justifyContent: "center", flexWrap: "wrap" }}>
              <button className="btn-primary" onClick={() => navigate('/signup')}>
                Start for Free — No Credit Card
              </button>
              <button className="btn-secondary" onClick={() => navigate('/login')}>
                Sign In →
              </button>
            </div>
          </div>

          {/* Dashboard Preview */}
          <div className="hero-preview" style={{ marginTop: "70px", position: "relative" }}>
            <div style={{ position: "absolute", inset: "-40px", background: "radial-gradient(ellipse at center, rgba(99,102,241,0.12) 0%, transparent 70%)", pointerEvents: "none" }} />
            <div style={{ background: "#0e0e14", border: "1px solid #1a1a28", borderRadius: "20px", padding: "24px", maxWidth: "780px", margin: "0 auto", boxShadow: "0 40px 80px rgba(0,0,0,0.5)" }}>
              <div style={{ background: "#0a0a0f", borderRadius: "12px", padding: "20px", textAlign: "left" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                  <div style={{ fontFamily: "'Syne', sans-serif", fontSize: "16px", fontWeight: 700 }}>💸 SpendSmart</div>
                  <div style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)", color: "white", border: "none", borderRadius: "8px", padding: "6px 14px", fontSize: "12px", fontWeight: 600 }}>+ Add Transaction</div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "12px", marginBottom: "16px" }}>
                  {[["Balance", "₨84,100", "#22c55e"], ["Income", "₨95,000", "#22c55e"], ["Expenses", "₨10,900", "#ef4444"]].map(([label, value, color]) => (
                    <div key={label} style={{ background: "#13131a", border: "1px solid #1e1e2e", borderRadius: "10px", padding: "14px" }}>
                      <div style={{ fontSize: "10px", color: "#64748b", textTransform: "uppercase", marginBottom: "6px" }}>{label}</div>
                      <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "18px", fontWeight: 700, color }}>{value}</div>
                    </div>
                  ))}
                </div>
                <div style={{ background: "#13131a", border: "1px solid #1e1e2e", borderRadius: "10px", padding: "16px" }}>
                  <div style={{ fontSize: "11px", color: "#64748b", marginBottom: "12px" }}>Monthly Overview</div>
                  <div style={{ display: "flex", alignItems: "flex-end", gap: "6px", height: "60px" }}>
                    {barHeights.map((h, i) => (
                      <div key={i} style={{ flex: 1, display: "flex", gap: "2px", alignItems: "flex-end" }}>
                        <div style={{ flex: 1, height: `${h * 0.6}%`, background: "#22c55e", borderRadius: "3px 3px 0 0", opacity: 0.8 }} />
                        <div style={{ flex: 1, height: `${h * 0.3}%`, background: "#ef4444", borderRadius: "3px 3px 0 0", opacity: 0.8 }} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="fade-up" style={{ padding: "60px 40px", textAlign: "center", position: "relative", zIndex: 1 }}>
        <div className="stats-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "40px", maxWidth: "600px", margin: "0 auto" }}>
          {[["500+", "Active Users"], ["₨2M+", "Expenses Tracked"], ["4.9★", "User Rating"]].map(([val, label]) => (
            <div key={label}>
              <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: "44px", fontWeight: 800, background: "linear-gradient(135deg,#6366f1,#22c55e)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>{val}</h3>
              <p style={{ color: "#64748b", fontSize: "14px", marginTop: "4px" }}>{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" style={{ padding: "80px 40px", maxWidth: "1100px", margin: "0 auto", position: "relative", zIndex: 1 }}>
        <p className="fade-up" style={{ textAlign: "center", fontSize: "13px", color: "#6366f1", fontWeight: 600, letterSpacing: "2px", textTransform: "uppercase", marginBottom: "16px" }}>Features</p>
        <h2 className="fade-up" style={{ fontFamily: "'Syne', sans-serif", fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 800, textAlign: "center", marginBottom: "60px", letterSpacing: "-1px" }}>
          Everything You Need to<br />Manage Money Smarter
        </h2>
        <div className="features-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "20px" }}>
          {features.map(f => (
            <div key={f.title} className="feature-card fade-up" style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: "16px", padding: "28px" }}>
              <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: f.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px", marginBottom: "16px" }}>{f.icon}</div>
              <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: "17px", fontWeight: 700, marginBottom: "8px", color: text }}>{f.title}</h3>
              <p style={{ color: subtext, fontSize: "14px", lineHeight: 1.6 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" style={{ padding: "80px 40px", maxWidth: "860px", margin: "0 auto", textAlign: "center", position: "relative", zIndex: 1 }}>
        <p className="fade-up" style={{ fontSize: "13px", color: "#6366f1", fontWeight: 600, letterSpacing: "2px", textTransform: "uppercase", marginBottom: "16px" }}>Pricing</p>
        <h2 className="fade-up" style={{ fontFamily: "'Syne', sans-serif", fontSize: "clamp(28px,4vw,44px)", fontWeight: 800, letterSpacing: "-1px", marginBottom: "48px" }}>Simple, Honest Pricing</h2>
        <div className="pricing-grid fade-up" style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: "20px" }}>
          {/* Free */}
          <div style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: "20px", padding: "36px", textAlign: "left" }}>
            <div style={{ fontFamily: "'Syne',sans-serif", fontSize: "18px", fontWeight: 700, marginBottom: "8px", color: text }}>Free</div>
            <div style={{ fontFamily: "'DM Mono',monospace", fontSize: "42px", fontWeight: 500, margin: "16px 0 4px", color: text }}>$0 <span style={{ fontSize: "18px", color: subtext }}>/ forever</span></div>
            <div style={{ color: subtext, fontSize: "13px", marginBottom: "24px" }}>Perfect for getting started</div>
            <ul style={{ listStyle: "none", marginBottom: "28px" }}>
              {[["✓", "Up to 50 transactions/month"], ["✓", "Basic dashboard"], ["✓", "Dark & light mode"], ["✓", "Category tracking"], ["✗", "PDF & Excel export", true], ["✗", "Budget alerts", true]].map(([icon, text2, faded]) => (
                <li key={text2} style={{ padding: "8px 0", fontSize: "14px", color: faded ? subtext : "#94a3b8", borderBottom: `1px solid ${border}`, display: "flex", gap: "10px", alignItems: "center", opacity: faded ? 0.4 : 1 }}>
                  <span style={{ color: faded ? subtext : "#22c55e" }}>{icon}</span>{text2}
                </li>
              ))}
            </ul>
            <button className="pricing-btn-free" onClick={() => navigate('/signup')}>Get Started Free</button>
          </div>

          {/* Pro */}
          <div style={{ background: "linear-gradient(135deg,rgba(99,102,241,0.08),rgba(139,92,246,0.05))", border: "1px solid #6366f1", borderRadius: "20px", padding: "36px", textAlign: "left", position: "relative" }}>
            <div style={{ position: "absolute", top: "-12px", left: "50%", transform: "translateX(-50%)", background: "linear-gradient(135deg,#6366f1,#8b5cf6)", color: "white", fontSize: "11px", fontWeight: 700, padding: "4px 16px", borderRadius: "100px", whiteSpace: "nowrap" }}>⭐ Most Popular</div>
            <div style={{ fontFamily: "'Syne',sans-serif", fontSize: "18px", fontWeight: 700, marginBottom: "8px", color: text }}>Pro</div>
            <div style={{ fontFamily: "'DM Mono',monospace", fontSize: "42px", fontWeight: 500, margin: "16px 0 4px", color: text }}>$4.99 <span style={{ fontSize: "18px", color: subtext }}>/ month</span></div>
            <div style={{ color: subtext, fontSize: "13px", marginBottom: "24px" }}>For serious money managers</div>
            <ul style={{ listStyle: "none", marginBottom: "28px" }}>
              {["Unlimited transactions", "Full dashboard + charts", "PDF & Excel export", "Budget alerts", "Date range filters", "Priority support"].map(item => (
                <li key={item} style={{ padding: "8px 0", fontSize: "14px", color: "#94a3b8", borderBottom: `1px solid ${border}`, display: "flex", gap: "10px", alignItems: "center" }}>
                  <span style={{ color: "#22c55e" }}>✓</span>{item}
                </li>
              ))}
            </ul>
            <button className="pricing-btn-paid" onClick={() => navigate('/signup')}>Start Pro — $4.99/mo</button>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section id="testimonials" style={{ padding: "80px 40px", maxWidth: "1000px", margin: "0 auto", position: "relative", zIndex: 1 }}>
        <p className="fade-up" style={{ textAlign: "center", fontSize: "13px", color: "#6366f1", fontWeight: 600, letterSpacing: "2px", textTransform: "uppercase", marginBottom: "16px" }}>Reviews</p>
        <h2 className="fade-up" style={{ fontFamily: "'Syne',sans-serif", fontSize: "clamp(28px,4vw,44px)", fontWeight: 800, textAlign: "center", letterSpacing: "-1px", marginBottom: "48px" }}>People Love SpendSmart</h2>
        <div className="testimonials-grid fade-up" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "20px" }}>
          {testimonials.map(t => (
            <div key={t.name} style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: "16px", padding: "24px" }}>
              <div style={{ color: "#eab308", fontSize: "12px", marginBottom: "12px" }}>★★★★★</div>
              <p style={{ fontSize: "14px", color: subtext, lineHeight: 1.7, marginBottom: "20px", fontStyle: "italic" }}>"{t.text}"</p>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: t.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px" }}>{t.emoji}</div>
                <div>
                  <div style={{ fontSize: "14px", fontWeight: 600 }}>{t.name}</div>
                  <div style={{ fontSize: "12px", color: "#64748b" }}>{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="fade-up" style={{ padding: "80px 40px", textAlign: "center", position: "relative", zIndex: 1 }}>
        <div style={{ background: "linear-gradient(135deg,rgba(99,102,241,0.1),rgba(139,92,246,0.05))", border: "1px solid rgba(99,102,241,0.3)", borderRadius: "24px", padding: "60px 40px", maxWidth: "700px", margin: "0 auto" }}>
          <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: "clamp(28px,4vw,42px)", fontWeight: 800, letterSpacing: "-1px", marginBottom: "16px" }}>
            Ready to Take Control<br />of Your Money?
          </h2>
          <p style={{ color: "#64748b", fontSize: "16px", marginBottom: "32px" }}>Join hundreds of people already using SpendSmart to track expenses and save more.</p>
          <button className="btn-primary" style={{ fontSize: "16px", padding: "16px 36px" }} onClick={() => navigate('/signup')}>
            Start Free Today →
          </button>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ borderTop: `1px solid ${border}`, padding: "40px", display: "flex", justifyContent: "space-between", alignItems: "center", color: subtext, fontSize: "13px", flexWrap: "wrap", gap: "16px", position: "relative", zIndex: 1 }}>
        <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: "16px", color: text }}>💸 SpendSmart</div>
        <div>© 2026 SpendSmart. Made with ❤️ in Pakistan</div>
        <div style={{ display: "flex", gap: "20px" }}>
          {["Privacy", "Terms", "Contact"].map(link => (
            <a key={link} href="#" style={{ color: "#64748b", textDecoration: "none" }}>{link}</a>
          ))}
        </div>
      </footer>
    </div>
  )
}
