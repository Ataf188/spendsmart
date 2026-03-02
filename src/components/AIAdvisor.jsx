import { useState, useEffect } from "react";

export default function AIAdvisor({ expenses, budgets, balance, totalIncome }) {
    const [tips, setTips] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        analyzeFinances();
    }, [expenses, budgets, balance]);

    const analyzeFinances = () => {
        setLoading(true);
        const newTips = [];
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        // 1. Budget Alerts
        Object.keys(budgets).forEach(cat => {
            const spent = expenses
                .filter(e => e.type === 'expense' && e.category === cat && new Date(e.date).getMonth() === currentMonth)
                .reduce((sum, e) => sum + e.amount, 0);

            const limit = budgets[cat];
            const percent = (spent / limit) * 100;

            if (percent >= 100) {
                newTips.push({
                    type: 'danger',
                    icon: '🚨',
                    text: `Aapne ${cat} ka budget cross kar liya hai! Rs.${spent.toLocaleString()} kharch ho chuke hain.`
                });
            } else if (percent >= 80) {
                newTips.push({
                    type: 'warning',
                    icon: '⚠️',
                    text: `${cat} budget 80% used ho gaya hai. Agle kuch din ihtiyat karein.`
                });
            }
        });

        // 2. Savings Advice
        if (totalIncome > 0) {
            const savingsRate = (balance / totalIncome) * 100;
            if (savingsRate < 10 && totalIncome > 0) {
                newTips.push({
                    type: 'info',
                    icon: '💡',
                    text: "Aapki savings rate 10% se kam hai. Koshish karein ke unnecessary kharche kam karein."
                });
            } else if (savingsRate > 30) {
                newTips.push({
                    type: 'success',
                    icon: '🌟',
                    text: "Zabardast! Aapki savings rate 30% se zyada hai. Aap behtreen financial track par hain."
                });
            }
        }

        // 3. Category Trends
        const categoryTotals = expenses
            .filter(e => e.type === 'expense' && new Date(e.date).getMonth() === currentMonth)
            .reduce((acc, e) => {
                acc[e.category] = (acc[e.category] || 0) + e.amount;
                return acc;
            }, {});

        const topCategory = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0];
        if (topCategory) {
            newTips.push({
                type: 'info',
                icon: '📊',
                text: `Is mahine aapka sabse zyada kharcha ${topCategory[0]} par ho raha hai (Rs.${topCategory[1].toLocaleString()}).`
            });
        }

        // Default tip if nothing else
        if (newTips.length === 0) {
            newTips.push({
                type: 'info',
                icon: '✨',
                text: "Abhi tak sab control mein hai. Apne kharche track karte rahein!"
            });
        }

        setTips(newTips.slice(0, 3)); // Top 3 tips
        setLoading(false);
    };

    return (
        <div style={{
            background: 'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(139,92,246,0.1))',
            border: '1px solid rgba(99,102,241,0.2)',
            borderRadius: '20px',
            padding: '20px',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Decorative Glow */}
            <div style={{
                position: 'absolute', top: '-20px', right: '-20px',
                width: '100px', height: '100px', background: '#6366f1',
                filter: 'blur(50px)', opacity: 0.2, pointerEvents: 'none'
            }} />

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                <div style={{
                    width: '32px', height: '32px', borderRadius: '10px',
                    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px'
                }}>
                    🤖
                </div>
                <div>
                    <h3 style={{ fontSize: '15px', fontWeight: '700', margin: 0 }}>Smart AI Advisor</h3>
                    <p style={{ fontSize: '11px', color: '#64748b', margin: 0 }}>Financial Insights & Guidance</p>
                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {loading ? (
                    <p style={{ fontSize: '13px', color: '#64748b' }}>Analyzing patterns...</p>
                ) : (
                    tips.map((tip, i) => (
                        <div key={i} style={{
                            display: 'flex', gap: '12px', padding: '12px',
                            background: 'rgba(255,255,255,0.03)', borderRadius: '12px',
                            border: '1px solid rgba(255,255,255,0.05)',
                            animation: 'fadeIn 0.5s ease-out'
                        }}>
                            <span style={{ fontSize: '16px' }}>{tip.icon}</span>
                            <p style={{ fontSize: '13px', margin: 0, lineHeight: 1.5, color: '#e2e8f0' }}>{tip.text}</p>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
