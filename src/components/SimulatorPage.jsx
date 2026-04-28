import { Spinner } from "./SharedUI";

export default function SimulatorPage({ loading, data, error, onBack }) {
    if (loading) return <Spinner text="Simulating career trajectory..." />;
    if (error) return (
        <div style={{ maxWidth: 600, margin: "80px auto", padding: "0 24px", textAlign: "center" }}>
            <div style={{ background: "var(--red-bg)", border: "1px solid rgba(186,26,26,0.2)", borderRadius: 14, padding: 24, color: "var(--red)" }}>⚠️ {error}</div>
            <button className="btn-ghost" style={{ marginTop: 20 }} onClick={onBack}>← Back to Results</button>
        </div>
    );
    if (!data) return null;

    const sim = data;
    const diffClass = sim.difficulty_level?.toLowerCase() === "high" ? "high" : sim.difficulty_level?.toLowerCase() === "low" ? "low" : "medium";
    const salaryLevels = [
        { key: "entry", label: "Entry Level", width: 35 },
        { key: "mid", label: "Mid Level", width: 60 },
        { key: "senior", label: "Senior Level", width: 82 },
        { key: "peak", label: "Peak Level", width: 100 },
    ];

    return (
        <div className="simulator-container" style={{ maxWidth: 860, margin: "0 auto", padding: "40px 24px 80px" }}>
            <div className="animate-fade-up simulator-header" style={{ marginBottom: 32 }}>
                <div style={{ fontSize: 13, color: "var(--accent)", fontWeight: 500, marginBottom: 8 }}>◉ Career Decision Simulator</div>
                <h2 className="font-display" style={{ fontSize: 36, fontWeight: 400, marginBottom: 8 }}>{sim.career}</h2>
                <p style={{ color: "var(--text2)", fontSize: 15 }}>Realistic career trajectory simulation for the Indian job market</p>
            </div>

            {/* Salary Progression */}
            <div className="card animate-fade-up animate-delay-1" style={{ padding: 28, marginBottom: 20 }}>
                <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 20 }}>💰 Salary Progression</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    {salaryLevels.map((level) => {
                        const s = sim.salary_progression?.[level.key];
                        if (!s) return null;
                        return (
                            <div key={level.key}>
                                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: 13 }}>
                                    <span style={{ fontWeight: 500 }}>{level.label} <span style={{ color: "var(--text3)", fontWeight: 400 }}>({s.years})</span></span>
                                    <span style={{ fontWeight: 600, color: "var(--accent)" }}>{s.range}</span>
                                </div>
                                <div style={{ background: "var(--bg3)", borderRadius: 8, overflow: "hidden" }}>
                                    <div className="sim-salary-bar" style={{ width: `${level.width}%` }}>
                                        <span style={{ fontSize: 11, opacity: 0.9 }}>{s.typical_role}</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Difficulty & Stability */}
            <div className="sim-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
                <div className="card animate-fade-up animate-delay-2" style={{ padding: 24 }}>
                    <h3 style={{ fontSize: 14, fontWeight: 600, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 14 }}>Difficulty Level</h3>
                    <div className={`sim-difficulty ${diffClass}`}>
                        {diffClass === "high" ? "🔴" : diffClass === "low" ? "🟢" : "🟡"} {sim.difficulty_level}
                    </div>
                    <p style={{ fontSize: 13, color: "var(--text2)", marginTop: 10, lineHeight: 1.6 }}>{sim.difficulty_reason}</p>
                </div>
                <div className="card animate-fade-up animate-delay-2" style={{ padding: 24 }}>
                    <h3 style={{ fontSize: 14, fontWeight: 600, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 14 }}>Time to Stability</h3>
                    <div style={{ fontSize: 28, fontWeight: 600, color: "var(--accent)", marginBottom: 6 }}>{sim.time_to_stability}</div>
                    <p style={{ fontSize: 13, color: "var(--text2)", lineHeight: 1.6 }}>{sim.stability_description}</p>
                </div>
            </div>

            {/* Risks */}
            <div className="card animate-fade-up animate-delay-3" style={{ padding: 28, marginBottom: 20 }}>
                <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>⚠️ Key Risks & Challenges</h3>
                {sim.risks?.map((r, i) => (
                    <div key={i} className="sim-risk-item">
                        <span className="sim-risk-severity" style={{
                            background: r.severity === "High" ? "var(--red-bg)" : r.severity === "Low" ? "var(--green-bg)" : "var(--accent-bg)",
                            color: r.severity === "High" ? "var(--red)" : r.severity === "Low" ? "var(--green)" : "var(--accent)"
                        }}>{r.severity}</span>
                        <div>
                            <div style={{ fontWeight: 500, fontSize: 14, marginBottom: 4 }}>{r.risk}</div>
                            <div style={{ fontSize: 13, color: "var(--text2)" }}>💡 {r.mitigation}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Suitability */}
            <div className="sim-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
                <div className="card animate-fade-up animate-delay-4" style={{ padding: 24 }}>
                    <h3 style={{ fontSize: 14, fontWeight: 600, color: "var(--green)", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 14 }}>✓ Best For</h3>
                    {sim.who_should_choose?.map((w, i) => (
                        <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8, fontSize: 14, color: "var(--text2)" }}>
                            <span style={{ color: "var(--green)", flexShrink: 0 }}>✓</span> {w}
                        </div>
                    ))}
                </div>
                <div className="card animate-fade-up animate-delay-4" style={{ padding: 24 }}>
                    <h3 style={{ fontSize: 14, fontWeight: 600, color: "var(--red)", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 14 }}>✗ Not Ideal For</h3>
                    {sim.who_should_not?.map((w, i) => (
                        <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8, fontSize: 14, color: "var(--text2)" }}>
                            <span style={{ color: "var(--red)", flexShrink: 0 }}>✗</span> {w}
                        </div>
                    ))}
                </div>
            </div>

            {/* Day in Life & Market Insight */}
            <div className="card animate-fade-up animate-delay-5" style={{ padding: 28, marginBottom: 20 }}>
                <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>🏢 A Day in the Life</h3>
                <p style={{ fontSize: 14, color: "var(--text2)", lineHeight: 1.7 }}>{sim.day_in_life}</p>
            </div>

            {sim.indian_market_insight && (
                <div style={{ background: "var(--accent-bg)", border: "1px solid var(--accent)", borderRadius: 14, padding: "20px 24px", marginBottom: 20 }} className="animate-fade-up animate-delay-5">
                    <div style={{ fontSize: 12, fontWeight: 600, color: "var(--accent)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>🇮🇳 Indian Market Insight</div>
                    <div style={{ fontSize: 14, color: "var(--text)", lineHeight: 1.6 }}>{sim.indian_market_insight}</div>
                </div>
            )}

            <div style={{ textAlign: "center", marginTop: 32 }}>
                <button className="btn-ghost" onClick={onBack}>← Back to Results</button>
            </div>
        </div>
    );
}
