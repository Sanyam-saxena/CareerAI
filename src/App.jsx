import { useState, useEffect, useRef } from "react";
import { callGemini, extractJSON } from "./utils/gemini";
import { QUESTIONS } from "./utils/questions";
import { buildAnalysisPrompt, buildSimulatorPrompt, buildRoadmapPrompt } from "./utils/prompts";
import LandingPage from "./components/LandingPage";
import ChatPage from "./components/ChatPage";
import ResultsPage from "./components/ResultsPage";
import SimulatorPage from "./components/SimulatorPage";
import ActionRoadmapPage from "./components/ActionRoadmapPage";
import HistoryPage from "./components/HistoryPage";

export default function App() {
    const [page, setPage] = useState("landing");
    const [dark, setDark] = useState(false);
    const [chatMessages, setChatMessages] = useState([]);
    const [userAnswers, setUserAnswers] = useState({});
    const [currentQ, setCurrentQ] = useState(0);
    const [inputVal, setInputVal] = useState("");
    const [aiTyping, setAiTyping] = useState(false);
    const [results, setResults] = useState(null);
    const [error, setError] = useState(null);
    // Simulator state
    const [simData, setSimData] = useState(null);
    const [simLoading, setSimLoading] = useState(false);
    const [simError, setSimError] = useState(null);
    // Roadmap state
    const [roadmapData, setRoadmapData] = useState(null);
    const [roadmapLoading, setRoadmapLoading] = useState(false);
    const [roadmapError, setRoadmapError] = useState(null);
    const chatEndRef = useRef(null);

    useEffect(() => { document.body.className = dark ? "dark" : ""; }, [dark]);
    useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [chatMessages, aiTyping]);

    const startAssessment = () => {
        setPage("chat");
        setChatMessages([]);
        setUserAnswers({});
        setCurrentQ(0);
        setResults(null);
        setError(null);
        setSimData(null);
        setRoadmapData(null);
        setTimeout(() => {
            addAiMessage("Welcome! I'm your AI Career Guide. I'll ask you 12 detailed questions to deeply understand your profile and match you with ideal career paths in India.\n\nLet's begin! 🌟");
            setTimeout(() => addAiMessage(QUESTIONS[0].text), 800);
        }, 400);
    };

    const addAiMessage = (text) => setChatMessages((prev) => [...prev, { role: "ai", text }]);

    const handleSend = async () => {
        if (!inputVal.trim()) return;
        const answer = inputVal.trim();
        setInputVal("");
        setChatMessages((prev) => [...prev, { role: "user", text: answer }]);
        const newAnswers = { ...userAnswers, [QUESTIONS[currentQ].id]: answer };
        setUserAnswers(newAnswers);
        const nextQ = currentQ + 1;

        if (nextQ < QUESTIONS.length) {
            setCurrentQ(nextQ);
            setAiTyping(true);
            await new Promise((r) => setTimeout(r, 700));
            setAiTyping(false);
            addAiMessage(QUESTIONS[nextQ].text);
        } else {
            setCurrentQ(nextQ);
            setAiTyping(true);
            addAiMessage("Excellent! Analyzing your profile now...");
            await analyzeCareer(newAnswers);
        }
    };

    const analyzeCareer = async (answers) => {
        try {
            setError(null);
            const raw = await callGemini(buildAnalysisPrompt(answers));
            const json = extractJSON(raw);
            if (!json?.career_suggestions?.length) throw new Error("Invalid response structure");
            setResults(json);
            setAiTyping(false);
            addAiMessage("Your personalized career analysis is ready! 🎯");
            // Save to localStorage
            const session = {
                id: Date.now(),
                date: new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
                answers, results: json,
                topCareer: json.career_suggestions[0]?.career || "Unknown",
                topScore: json.career_suggestions[0]?.fit_score || 0,
            };
            const history = JSON.parse(localStorage.getItem("careerAiHistory") || "[]");
            localStorage.setItem("careerAiHistory", JSON.stringify([session, ...history].slice(0, 20)));
            setTimeout(() => setPage("results"), 1200);
        } catch (e) {
            setAiTyping(false);
            setError(e.message);
            addAiMessage(`Sorry, something went wrong: ${e.message}. Click "Retry" below.`);
        }
    };

    const handleRetry = () => {
        setError(null);
        setAiTyping(true);
        addAiMessage("Retrying analysis...");
        analyzeCareer(userAnswers);
    };

    const loadSession = (session) => {
        setResults(session.results);
        setUserAnswers(session.answers || {});
        setSimData(null);
        setRoadmapData(null);
        setPage("results");
    };

    const handleSimulate = async (career, fitScore) => {
        setSimData(null);
        setSimError(null);
        setSimLoading(true);
        setPage("simulator");
        try {
            const raw = await callGemini(buildSimulatorPrompt(career, fitScore, userAnswers));
            const json = extractJSON(raw);
            if (!json?.simulation) throw new Error("Invalid simulator response");
            setSimData(json.simulation);
        } catch (e) {
            setSimError(e.message);
        }
        setSimLoading(false);
    };

    const handleRoadmap = async (career) => {
        setRoadmapData(null);
        setRoadmapError(null);
        setRoadmapLoading(true);
        setPage("actionRoadmap");
        try {
            const raw = await callGemini(buildRoadmapPrompt(career, userAnswers));
            const json = extractJSON(raw);
            if (!json?.roadmap) throw new Error("Invalid roadmap response");
            setRoadmapData(json.roadmap);
        } catch (e) {
            setRoadmapError(e.message);
        }
        setRoadmapLoading(false);
    };

    return (
        <div style={{ minHeight: "100vh", background: "var(--bg)", color: "var(--text)", transition: "all 0.3s" }}>
            <div className="app-bg">
                <div className="bg-orb bg-orb-1" />
                <div className="bg-orb bg-orb-2" />
                <div className="bg-orb bg-orb-3" />
            </div>
            <div className="app-content">
                {/* Nav */}
                <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, borderBottom: "1px solid var(--border)", background: "var(--surface)", padding: "0 24px", height: "60px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <button onClick={() => setPage("landing")} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}>
                        <div style={{ width: 28, height: 28, borderRadius: 8, background: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <span style={{ color: "white", fontSize: 14, fontWeight: 700 }}>C</span>
                        </div>
                        <span className="font-display brand-text" style={{ fontSize: 16, fontWeight: 600, color: "var(--text)" }}>CareerAI</span>
                    </button>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        {(page === "landing" || page === "results") && (
                            <button className="btn-ghost" style={{ fontSize: 13, padding: "7px 14px" }} onClick={() => setPage("history")}>📋 History</button>
                        )}
                        {page === "results" && results && (
                            <button className="btn-ghost" style={{ fontSize: 13, padding: "7px 14px" }} onClick={startAssessment}>↺ New Assessment</button>
                        )}
                        {page === "history" && (
                            <button className="btn-ghost" style={{ fontSize: 13, padding: "7px 14px" }} onClick={() => setPage("landing")}>← Back</button>
                        )}
                        {(page === "simulator" || page === "actionRoadmap") && (
                            <button className="btn-ghost" style={{ fontSize: 13, padding: "7px 14px" }} onClick={() => setPage("results")}>← Back to Results</button>
                        )}
                        <button onClick={() => setDark(!dark)} style={{ background: "var(--bg3)", border: "1px solid var(--border)", borderRadius: 8, padding: "6px 10px", cursor: "pointer", fontSize: 16, color: "var(--text)" }} title="Toggle dark mode">
                            {dark ? "☀️" : "🌙"}
                        </button>
                    </div>
                </nav>

                <div style={{ paddingTop: 60 }}>
                    {page === "landing" && <LandingPage onStart={startAssessment} />}
                    {page === "history" && <HistoryPage onLoadSession={loadSession} onNewAssessment={startAssessment} />}
                    {page === "chat" && (
                        <ChatPage messages={chatMessages} typing={aiTyping} inputVal={inputVal} setInputVal={setInputVal}
                            onSend={handleSend} currentQ={currentQ} chatEndRef={chatEndRef} error={error} onRetry={handleRetry} />
                    )}
                    {page === "results" && results && (
                        <ResultsPage results={results} onSimulate={handleSimulate} onRoadmap={handleRoadmap} onRetake={startAssessment} />
                    )}
                    {page === "simulator" && (
                        <SimulatorPage loading={simLoading} data={simData} error={simError} onBack={() => setPage("results")} />
                    )}
                    {page === "actionRoadmap" && (
                        <ActionRoadmapPage loading={roadmapLoading} data={roadmapData} error={roadmapError} onBack={() => setPage("results")} />
                    )}
                </div>
            </div>
        </div>
    );
}
