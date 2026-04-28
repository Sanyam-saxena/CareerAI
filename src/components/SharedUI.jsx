export function LoadingDots() {
    return (
        <div className="msg-ai" style={{ display: "inline-flex", gap: "6px", alignItems: "center", padding: "14px 18px" }}>
            <span className="typing-dot" />
            <span className="typing-dot" />
            <span className="typing-dot" />
        </div>
    );
}

export function ScoreRing({ score, size = 80 }) {
    const r = (size - 10) / 2;
    const circ = 2 * Math.PI * r;
    const dash = (score / 100) * circ;
    const color = score >= 80 ? "var(--green)" : score >= 65 ? "var(--accent)" : "var(--text3)";
    return (
        <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
            <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--bg3)" strokeWidth="8" />
            <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth="8"
                strokeLinecap="round" strokeDasharray={`${dash} ${circ}`}
                style={{ transition: "stroke-dasharray 1.2s cubic-bezier(0.4,0,0.2,1)" }} />
            <text x={size / 2} y={size / 2} textAnchor="middle" dominantBaseline="middle"
                fill="var(--text)" fontSize="16" fontWeight="600"
                style={{ transform: `rotate(90deg) translate(0, -${size}px)`, transformOrigin: `${size / 2}px ${size / 2}px`, fontFamily: "'DM Sans', sans-serif" }}>
                {score}%
            </text>
        </svg>
    );
}

export function Spinner({ text = "Loading..." }) {
    return (
        <div style={{ maxWidth: 800, margin: "80px auto", padding: "0 24px", textAlign: "center" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
                <div className="spinner" />
                <div className="font-display" style={{ fontSize: 22 }}>{text}</div>
            </div>
        </div>
    );
}
