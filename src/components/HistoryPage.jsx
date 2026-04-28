import { useState, useEffect } from "react";
import { ScoreRing } from "./SharedUI";

export default function HistoryPage({ onLoadSession, onNewAssessment }) {
    const [sessions, setSessions] = useState([]);

    useEffect(() => {
        const stored = JSON.parse(localStorage.getItem("careerAiHistory") || "[]");
        setSessions(stored);
    }, []);

    const deleteSession = (id) => {
        const updated = sessions.filter(s => s.id !== id);
        setSessions(updated);
        localStorage.setItem("careerAiHistory", JSON.stringify(updated));
    };

    const clearAll = () => {
        setSessions([]);
        localStorage.removeItem("careerAiHistory");
    };

    if (sessions.length === 0) {
        return (
            <div style={{ maxWidth: 600, margin: "0 auto", padding: "80px 24px", textAlign: "center" }}>
                <div className="animate-fade-up" style={{ marginBottom: 32 }}>
                    <div style={{ fontSize: 48, marginBottom: 16 }}>📋</div>
                    <h2 className="font-display" style={{ fontSize: 28, fontWeight: 400, marginBottom: 12 }}>No History Yet</h2>
                    <p style={{ color: "var(--text2)", fontSize: 15, lineHeight: 1.6 }}>
                        Your past career assessments will appear here. Take your first assessment to get started!
                    </p>
                </div>
                <button className="btn-primary" onClick={onNewAssessment} style={{ fontSize: 15, padding: "13px 28px" }}>
                    Start Your First Assessment →
                </button>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: 800, margin: "0 auto", padding: "40px 24px 80px" }}>
            <div className="animate-fade-up" style={{ marginBottom: 32 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
                    <div>
                        <div style={{ fontSize: 13, color: "var(--accent)", fontWeight: 500, marginBottom: 8 }}>📋 Assessment History</div>
                        <h2 className="font-display" style={{ fontSize: 32, fontWeight: 400, marginBottom: 8 }}>Past Sessions</h2>
                        <p style={{ color: "var(--text2)", fontSize: 14 }}>
                            {sessions.length} assessment{sessions.length !== 1 ? "s" : ""} saved • Click to view results
                        </p>
                    </div>
                    <div style={{ display: "flex", gap: 10 }}>
                        <button className="btn-primary" onClick={onNewAssessment} style={{ fontSize: 13, padding: "9px 18px" }}>
                            + New Assessment
                        </button>
                        <button className="btn-ghost" onClick={clearAll} style={{ fontSize: 13, padding: "9px 18px", color: "var(--red)" }}>
                            Clear All
                        </button>
                    </div>
                </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {sessions.map((session, i) => (
                    <div key={session.id} className={`card history-card animate-fade-up animate-delay-${Math.min(i + 1, 5)}`}
                        style={{ padding: "20px 24px", display: "flex", alignItems: "center", gap: 20, cursor: "pointer", transition: "all 0.25s" }}
                        onClick={() => onLoadSession(session)}
                    >
                        <ScoreRing score={session.topScore} size={56} />

                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4, flexWrap: "wrap" }}>
                                <span style={{ fontWeight: 600, fontSize: 16 }}>{session.topCareer}</span>
                                <span className={`tag ${session.topScore >= 80 ? "tag-green" : "tag-accent"}`} style={{ fontSize: 11 }}>
                                    {session.topScore >= 80 ? "Strong Match" : "Good Match"}
                                </span>
                            </div>
                            <div style={{ fontSize: 13, color: "var(--text3)" }}>
                                {session.date}
                                {session.results?.career_suggestions?.length > 1 && (
                                    <span> • Also matched: {session.results.career_suggestions.slice(1).map(c => c.career).join(", ")}</span>
                                )}
                            </div>
                        </div>

                        <div className="history-card-actions" style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                            <button className="btn-primary" style={{ fontSize: 12, padding: "7px 14px" }}
                                onClick={(e) => { e.stopPropagation(); onLoadSession(session); }}>
                                View Results →
                            </button>
                            <button className="btn-ghost" style={{ fontSize: 12, padding: "7px 12px", color: "var(--red)", borderColor: "var(--red-bg)" }}
                                onClick={(e) => { e.stopPropagation(); deleteSession(session.id); }}
                                title="Delete this session">
                                ✕
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
