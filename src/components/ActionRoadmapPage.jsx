import { Spinner } from "./SharedUI";

export default function ActionRoadmapPage({ loading, data, error, onBack }) {
    if (loading) return <Spinner text="Generating your 4-week action plan..." />;
    if (error) return (
        <div style={{ maxWidth: 600, margin: "80px auto", padding: "0 24px", textAlign: "center" }}>
            <div style={{ background: "var(--red-bg)", border: "1px solid rgba(186,26,26,0.2)", borderRadius: 14, padding: 24, color: "var(--red)" }}>⚠️ {error}</div>
            <button className="btn-ghost" style={{ marginTop: 20 }} onClick={onBack}>← Back to Results</button>
        </div>
    );
    if (!data) return null;

    const rm = data;

    return (
        <div className="roadmap-container" style={{ maxWidth: 900, margin: "0 auto", padding: "40px 24px 80px" }}>
            <div className="animate-fade-up" style={{ marginBottom: 32 }}>
                <div style={{ fontSize: 13, color: "var(--accent)", fontWeight: 500, marginBottom: 8 }}>◆ Action Roadmap Generator</div>
                <h2 className="font-display" style={{ fontSize: 36, fontWeight: 400, marginBottom: 8 }}>{rm.career}</h2>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    <span className="tag tag-accent">4-Week Plan</span>
                    <span className="tag">{rm.hours_per_week} / week</span>
                </div>
            </div>

            {/* Week Cards */}
            <div className="week-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 32 }}>
                {rm.weeks?.map((week, i) => (
                    <div key={i} className={`week-card animate-fade-up animate-delay-${i + 1}`}>
                        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                            <div className="week-number">{week.week}</div>
                            <div>
                                <div style={{ fontWeight: 600, fontSize: 15 }}>{week.title}</div>
                                <div style={{ fontSize: 12, color: "var(--text3)" }}>Week {week.week}</div>
                            </div>
                        </div>

                        {/* Goal */}
                        <div style={{ background: "var(--accent-bg)", borderRadius: 8, padding: "10px 14px", marginBottom: 14 }}>
                            <div style={{ fontSize: 11, fontWeight: 600, color: "var(--accent)", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 4 }}>Goal</div>
                            <div style={{ fontSize: 13, color: "var(--text)", lineHeight: 1.5 }}>{week.goal}</div>
                        </div>

                        {/* Tasks */}
                        <div style={{ marginBottom: 14 }}>
                            <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 8 }}>Tasks</div>
                            {week.tasks?.map((task, j) => (
                                <div key={j} style={{ display: "flex", gap: 8, marginBottom: 6, fontSize: 13, color: "var(--text2)", lineHeight: 1.5 }}>
                                    <span style={{ color: "var(--accent)", flexShrink: 0 }}>○</span> {task}
                                </div>
                            ))}
                        </div>

                        {/* Skills */}
                        <div style={{ marginBottom: 14 }}>
                            <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 8 }}>Skills</div>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                                {week.skills?.map((s, j) => <span key={j} className="tag tag-green">{s}</span>)}
                            </div>
                        </div>

                        {/* Resources */}
                        <div>
                            <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 8 }}>Resources</div>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                                {week.resources?.map((r, j) => (
                                    <span key={j} className="resource-pill">
                                        {r.free && "🆓 "}{r.name} <span style={{ opacity: 0.7 }}>• {r.platform}</span>
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Next Steps */}
            {rm.next_steps && (
                <div style={{ background: "var(--accent-bg)", border: "1px solid var(--accent)", borderRadius: 14, padding: "20px 24px" }} className="animate-fade-up animate-delay-5">
                    <div style={{ fontSize: 12, fontWeight: 600, color: "var(--accent)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>🚀 After Week 4</div>
                    <div style={{ fontSize: 14, color: "var(--text)", lineHeight: 1.6 }}>{rm.next_steps}</div>
                </div>
            )}

            <div style={{ textAlign: "center", marginTop: 32 }}>
                <button className="btn-ghost" onClick={onBack}>← Back to Results</button>
            </div>
        </div>
    );
}
