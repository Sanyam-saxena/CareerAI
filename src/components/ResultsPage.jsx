import { ScoreRing } from "./SharedUI";

export default function ResultsPage({ results, onSimulate, onRoadmap, onRetake }) {
    return (
        <div className="results-container" style={{ maxWidth: 900, margin: "0 auto", padding: "40px 24px 80px" }}>
            <div className="animate-fade-up results-header" style={{ marginBottom: 40 }}>
                <div style={{ fontSize: 13, color: "var(--accent)", fontWeight: 500, marginBottom: 8 }}>✦ Analysis Complete</div>
                <h2 className="font-display" style={{ fontSize: 36, fontWeight: 400, marginBottom: 12 }}>Your Career Matches</h2>
                <p style={{ color: "var(--text2)", fontSize: 15 }}>Based on your profile, here are your top 3 career recommendations for the Indian job market.</p>
            </div>

            {/* Summary Row */}
            <div className="results-summary-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 40 }}>
                {results.career_suggestions.map((c, i) => (
                    <div key={i} className={`card animate-fade-up animate-delay-${i + 1}`} style={{ padding: "20px", textAlign: "left" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                            <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.05em" }}>#{i + 1} Match</div>
                            <ScoreRing score={c.fit_score} size={56} />
                        </div>
                        <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 4 }}>{c.career}</div>
                        <div style={{ fontSize: 12, color: "var(--text3)" }}>{c.entry_salary}</div>
                    </div>
                ))}
            </div>

            {/* Detail Cards */}
            {results.career_suggestions.map((c, i) => (
                <div key={i} className={`card animate-fade-up animate-delay-${i + 2}`} style={{ marginBottom: 20, overflow: "hidden" }}>
                    <div className="card-detail-inner" style={{ padding: "28px 28px 24px" }}>
                        <div style={{ display: "flex", alignItems: "flex-start", gap: 20, marginBottom: 20, flexWrap: "wrap" }}>
                            <ScoreRing score={c.fit_score} size={72} />
                            <div style={{ flex: 1, minWidth: 200 }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6, flexWrap: "wrap" }}>
                                    <h3 style={{ fontSize: 22, fontWeight: 600 }}>{c.career}</h3>
                                    <span className={`tag ${c.fit_score >= 80 ? "tag-green" : "tag-accent"}`}>{c.fit_score >= 80 ? "Strong Match" : "Good Match"}</span>
                                    {c.growth_outlook && <span className="tag tag-blue">📈 {c.growth_outlook}</span>}
                                </div>
                                {c.exam_required && c.exam_required !== "None" && c.exam_required !== "None — skill-based hiring" && (
                                    <div style={{ fontSize: 12, color: "var(--blue)", marginBottom: 4 }}>📝 {c.exam_required}</div>
                                )}
                                <div style={{ fontSize: 13, color: "var(--text3)", fontStyle: "italic" }}>{c.personality_fit}</div>
                            </div>
                        </div>

                        {/* Reasoning */}
                        <div style={{ background: "var(--bg3)", borderRadius: 10, padding: "14px 16px", marginBottom: 16, fontSize: 14, lineHeight: 1.7, color: "var(--text2)" }}>
                            <span style={{ fontWeight: 600, color: "var(--text)" }}>Why this fits you: </span>{c.reasoning}
                        </div>

                        {/* Salary */}
                        <div className="salary-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12, marginBottom: 16 }}>
                            {[{ label: "Entry-Level", val: c.entry_salary }, { label: "Mid-Level", val: c.mid_salary }, { label: "Senior-Level", val: c.senior_salary }].filter(s => s.val).map((s, j) => (
                                <div key={j} style={{ background: "var(--bg3)", borderRadius: 8, padding: "10px 14px" }}>
                                    <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 4 }}>{s.label}</div>
                                    <div style={{ fontSize: 14, fontWeight: 500, color: "var(--text)" }}>{s.val}</div>
                                </div>
                            ))}
                        </div>

                        {/* Companies */}
                        {c.top_indian_companies?.length > 0 && (
                            <div style={{ marginBottom: 16 }}>
                                <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>Top Indian Companies</div>
                                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>{c.top_indian_companies.map((co, j) => <span key={j} className="tag">{co}</span>)}</div>
                            </div>
                        )}

                        {/* Skills */}
                        <div className="skills-row" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
                            <div>
                                <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 10 }}>Required Skills</div>
                                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>{c.required_skills?.map((s, j) => <span key={j} className="tag tag-green">{s}</span>)}</div>
                            </div>
                            <div>
                                <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 10 }}>Skill Gaps</div>
                                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>{c.skill_gap?.map((s, j) => <span key={j} className="tag tag-red">{s}</span>)}</div>
                            </div>
                        </div>

                        {/* CTA Buttons */}
                        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                            <button className="btn-simulate" onClick={() => onSimulate(c.career, c.fit_score)}>
                                ◉ Simulate Career
                            </button>
                            <button className="btn-ghost" style={{ fontSize: 13, padding: "10px 20px" }} onClick={() => onRoadmap(c.career)}>
                                ◆ Generate Roadmap
                            </button>
                        </div>
                    </div>
                </div>
            ))}

            <div style={{ textAlign: "center", marginTop: 40 }}>
                <button className="btn-ghost" onClick={onRetake}>↺ Retake Assessment</button>
            </div>
        </div>
    );
}
