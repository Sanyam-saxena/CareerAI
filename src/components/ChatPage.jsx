import { useRef, useEffect } from "react";
import { QUESTIONS } from "../utils/questions";
import { LoadingDots } from "./SharedUI";

export default function ChatPage({ messages, typing, inputVal, setInputVal, onSend, currentQ, chatEndRef, error, onRetry }) {
    const progress = Math.min((currentQ / QUESTIONS.length) * 100, 100);
    const handleKey = (e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); onSend(); } };
    const allAnswered = currentQ >= QUESTIONS.length;
    const textareaRef = useRef(null);

    useEffect(() => {
        if (!typing && !allAnswered && textareaRef.current) textareaRef.current.focus();
    }, [typing, currentQ, allAnswered, messages]);

    return (
        <div className="chat-container" style={{ maxWidth: 680, margin: "0 auto", padding: "32px 24px", display: "flex", flexDirection: "column", height: "calc(100vh - 60px)" }}>
            <div className="chat-progress" style={{ marginBottom: 24 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 13, color: "var(--text3)" }}>
                    <span>Career Assessment</span>
                    <span>Question {Math.min(currentQ + 1, QUESTIONS.length)} of {QUESTIONS.length}</span>
                </div>
                <div className="score-bar"><div className="score-fill" style={{ width: `${progress}%` }} /></div>
            </div>

            <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 16, paddingBottom: 16 }}>
                {messages.map((m, i) => (
                    <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: m.role === "user" ? "flex-end" : "flex-start" }}>
                        {m.role === "ai" && <div style={{ fontSize: 11, color: "var(--text3)", marginBottom: 4, marginLeft: 4 }}>CareerAI</div>}
                        <div className={m.role === "ai" ? "msg-ai" : "msg-user"} style={{ fontSize: 14, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{m.text}</div>
                    </div>
                ))}
                {typing && (
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
                        <div style={{ fontSize: 11, color: "var(--text3)", marginBottom: 4, marginLeft: 4 }}>CareerAI</div>
                        <LoadingDots />
                    </div>
                )}
                {error && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 10, alignItems: "flex-start" }}>
                        <div style={{ background: "var(--red-bg)", border: "1px solid rgba(186,26,26,0.2)", borderRadius: 12, padding: "12px 16px", color: "var(--red)", fontSize: 13 }}>⚠️ {error}</div>
                        <button className="btn-primary" style={{ fontSize: 13, padding: "8px 20px" }} onClick={onRetry}>↻ Retry Analysis</button>
                    </div>
                )}
                <div ref={chatEndRef} />
            </div>

            <div className="chat-input-container">
                <textarea ref={textareaRef} value={inputVal} onChange={(e) => setInputVal(e.target.value)} onKeyDown={handleKey}
                    placeholder={!allAnswered ? QUESTIONS[currentQ]?.placeholder : "Assessment complete..."}
                    disabled={typing || allAnswered} rows={1} autoFocus
                    style={{ flex: 1, background: "none", border: "none", outline: "none", resize: "none", font: "15px 'DM Sans', sans-serif", color: "var(--text)", lineHeight: 1.5, maxHeight: 120, overflow: "auto" }}
                    onInput={(e) => { e.target.style.height = "auto"; e.target.style.height = e.target.scrollHeight + "px"; }}
                />
                <button className="btn-primary" onClick={onSend} disabled={!inputVal.trim() || typing || allAnswered} style={{ padding: "8px 16px", fontSize: 14, flexShrink: 0 }}>Send →</button>
            </div>
            <div style={{ textAlign: "center", marginTop: 8, fontSize: 12, color: "var(--text3)" }}>Press Enter to send</div>
        </div>
    );
}
