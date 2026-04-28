export default function LandingPage({ onStart }) {
    return (
        <div className="landing-container" role="main" style={{ maxWidth: 1100, margin: "0 auto", padding: "80px 24px 60px" }}>
            <div className="landing-hero" style={{ textAlign: "center", marginBottom: 80 }}>
                <div className="hero-badge animate-fade-up" role="status">AI-Powered Career Guidance for India</div>
                <h1 className="font-display animate-fade-up animate-delay-1" style={{ fontSize: "clamp(42px, 6vw, 72px)", lineHeight: 1.1, fontWeight: 400, marginBottom: 24, color: "var(--text)" }}>
                    Discover the career<br /><em style={{ color: "var(--accent)", fontStyle: "italic" }}>you were born for</em>
                </h1>
                <p className="animate-fade-up animate-delay-2" style={{ fontSize: 18, color: "var(--text2)", maxWidth: 560, margin: "0 auto 40px", lineHeight: 1.6 }}>
                    A 12-question AI assessment that maps your education, skills, and aspirations to your ideal career — then simulates outcomes and builds your action plan.
                </p>
                <div className="animate-fade-up animate-delay-3 cta-group" style={{ display: "flex", justifyContent: "center", gap: 12, flexWrap: "wrap" }}>
                    <button className="btn-primary" id="start-assessment-btn" style={{ fontSize: 16, padding: "14px 32px" }} onClick={onStart} aria-label="Start your free career assessment">
                        Start Free Assessment →
                    </button>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "14px 20px", color: "var(--text3)", fontSize: 14 }}>
                        <span aria-hidden="true">⏱</span> Takes ~5 minutes
                    </div>
                </div>
            </div>

            {/* SDG Impact Banner */}
            <div className="sdg-banner animate-fade-up" style={{ background: "var(--bg2)", borderRadius: 16, padding: "32px 28px", marginBottom: 60, textAlign: "center" }}>
                <p style={{ fontSize: 13, color: "var(--accent)", fontWeight: 600, marginBottom: 12, letterSpacing: "0.04em", textTransform: "uppercase" }}>
                    Aligned with UN Sustainable Development Goals
                </p>
                <div style={{ display: "flex", justifyContent: "center", gap: 24, flexWrap: "wrap", marginBottom: 16 }}>
                    {[
                        { num: 4, title: "Quality Education", color: "#C5192D" },
                        { num: 8, title: "Decent Work & Growth", color: "#A21942" },
                        { num: 10, title: "Reduced Inequalities", color: "#DD1367" },
                    ].map(sdg => (
                        <div key={sdg.num} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <div style={{ width: 38, height: 38, borderRadius: 8, background: sdg.color, display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 700, fontSize: 16 }}>
                                {sdg.num}
                            </div>
                            <span style={{ fontSize: 13, color: "var(--text2)", fontWeight: 500 }}>{sdg.title}</span>
                        </div>
                    ))}
                </div>
                <p style={{ fontSize: 13, color: "var(--text3)", maxWidth: 500, margin: "0 auto", lineHeight: 1.6 }}>
                    76% of Indian students lack professional career guidance. CareerAI bridges this gap for Tier-2 and Tier-3 city students using AI.
                </p>
            </div>

            <div className="feature-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20, marginBottom: 80 }}>
                {[
                    { icon: "◈", title: "Career Recommendation", desc: "AI analyses 12 data points to match you with 3 best-fit careers — with fit scores, salary data, and required skills." },
                    { icon: "◉", title: "Career Decision Simulator", desc: "Simulate real career trajectories: salary progression, difficulty level, risks, and who should (or shouldn't) choose this path." },
                    { icon: "◆", title: "Action Roadmap", desc: "Get a 4-week actionable plan with weekly goals, skills to learn, and free resources from NPTEL, Coursera, and YouTube." },
                ].map((f, i) => (
                    <div key={i} className={`card feature-card animate-fade-up animate-delay-${i + 1}`} style={{ padding: "28px 24px" }} role="article" aria-label={f.title}>
                        <div style={{ fontSize: 24, marginBottom: 16, color: "var(--accent)" }} aria-hidden="true">{f.icon}</div>
                        <div style={{ fontWeight: 600, marginBottom: 8, fontSize: 15 }}>{f.title}</div>
                        <div style={{ color: "var(--text2)", fontSize: 14, lineHeight: 1.6 }}>{f.desc}</div>
                    </div>
                ))}
            </div>

            <div style={{ textAlign: "center", marginBottom: 60 }}>
                <h2 className="font-display" style={{ fontSize: 32, fontWeight: 400, marginBottom: 40 }}>How it works</h2>
                <div className="how-it-works" role="list" style={{ display: "flex", justifyContent: "center", gap: 40, flexWrap: "wrap" }}>
                    {["Answer 12 questions", "AI analyses your profile", "Get 3 career matches", "Simulate & plan your path"].map((step, i) => (
                        <div key={i} role="listitem" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, maxWidth: 140 }}>
                            <div style={{ width: 44, height: 44, borderRadius: "50%", background: i === 0 ? "var(--accent)" : "var(--bg3)", border: "2px solid var(--border2)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 600, fontSize: 16, color: i === 0 ? "white" : "var(--text2)" }} aria-label={`Step ${i + 1}`}>
                                {i + 1}
                            </div>
                            <div style={{ fontSize: 13, color: "var(--text2)", textAlign: "center", lineHeight: 1.5 }}>{step}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Impact Stats */}
            <div className="animate-fade-up" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 16, marginBottom: 60, textAlign: "center" }}>
                {[
                    { stat: "76%", label: "Students lack career guidance" },
                    { stat: "12", label: "Assessment questions" },
                    { stat: "3", label: "AI-matched careers" },
                    { stat: "4 Weeks", label: "Action roadmap plan" },
                ].map((s, i) => (
                    <div key={i} className="card" style={{ padding: "24px 16px" }}>
                        <div className="font-display" style={{ fontSize: 28, fontWeight: 500, color: "var(--accent)", marginBottom: 4 }}>{s.stat}</div>
                        <div style={{ fontSize: 12, color: "var(--text3)", lineHeight: 1.4 }}>{s.label}</div>
                    </div>
                ))}
            </div>

            <div style={{ textAlign: "center" }}>
                <button className="btn-primary" id="begin-assessment-btn" style={{ fontSize: 15, padding: "13px 28px" }} onClick={onStart} aria-label="Begin your career assessment">
                    Begin Your Assessment →
                </button>
            </div>
        </div>
    );
}
