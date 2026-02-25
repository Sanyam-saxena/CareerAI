import { useState, useEffect, useRef, useCallback } from "react";

// ─── Gemini API Config ────────────────────────────────────────────────────────
const GEMINI_API_KEY = "AIzaSyBRzAnZYL6Vok_vqY-7G_0ylWeacFwja4o";
const GEMINI_MODEL = "gemini-3.1-pro";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

async function callGemini(prompt) {
  const res = await fetch(GEMINI_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.7, maxOutputTokens: 4096 },
    }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err?.error?.message || "Gemini API error");
  }
  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
}

// ─── Assessment Questions ─────────────────────────────────────────────────────
const QUESTIONS = [
  {
    id: "interests",
    text: "What subjects or topics genuinely excite you? (e.g., technology, art, science, business, people)",
    placeholder: "I'm passionate about...",
    icon: "✦",
  },
  {
    id: "skills",
    text: "What are your strongest skills? What do people often come to you for help with?",
    placeholder: "My strengths include...",
    icon: "◈",
  },
  {
    id: "work_style",
    text: "How do you prefer to work? (Solo vs team, creative vs structured, fast-paced vs deliberate)",
    placeholder: "I work best when...",
    icon: "◉",
  },
  {
    id: "people_data_systems",
    text: "Do you prefer working with people, data/numbers, or building systems/products?",
    placeholder: "I enjoy working with...",
    icon: "◎",
  },
  {
    id: "values",
    text: "What matters most to you in a career? (Impact, income, flexibility, creativity, stability...)",
    placeholder: "What I value most is...",
    icon: "◆",
  },
  {
    id: "weaknesses",
    text: "What are your weaknesses or areas you want to grow? Be honest — it helps us guide you better.",
    placeholder: "I struggle with...",
    icon: "◇",
  },
];

// ─── Styles ───────────────────────────────────────────────────────────────────
const injectStyles = () => {
  const style = document.createElement("style");
  style.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;0,9..144,600;1,9..144,300&family=DM+Sans:wght@300;400;500;600&display=swap');

    :root {
      --bg: #f7f6f3;
      --bg2: #ffffff;
      --bg3: #f0efe9;
      --surface: rgba(255,255,255,0.8);
      --border: rgba(0,0,0,0.08);
      --border2: rgba(0,0,0,0.14);
      --text: #1a1916;
      --text2: #4a4740;
      --text3: #8a8680;
      --accent: #c8692a;
      --accent2: #e8843d;
      --accent-bg: rgba(200,105,42,0.08);
      --green: #2a7a4a;
      --green-bg: rgba(42,122,74,0.08);
      --blue: #2a5c8a;
      --blue-bg: rgba(42,92,138,0.08);
      --shadow: 0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.06);
      --shadow2: 0 2px 8px rgba(0,0,0,0.08), 0 8px 32px rgba(0,0,0,0.08);
      --radius: 16px;
      --radius2: 12px;
    }

    .dark {
      --bg: #141310;
      --bg2: #1e1c19;
      --bg3: #252320;
      --surface: rgba(30,28,25,0.9);
      --border: rgba(255,255,255,0.06);
      --border2: rgba(255,255,255,0.12);
      --text: #f0ede8;
      --text2: #b8b4ae;
      --text3: #706c66;
      --accent: #e88040;
      --accent2: #f0944e;
      --accent-bg: rgba(232,128,64,0.1);
      --green: #4aaa6a;
      --green-bg: rgba(74,170,106,0.1);
      --blue: #5a8fc0;
      --blue-bg: rgba(90,143,192,0.1);
      --shadow: 0 1px 3px rgba(0,0,0,0.3), 0 4px 16px rgba(0,0,0,0.2);
      --shadow2: 0 2px 8px rgba(0,0,0,0.4), 0 8px 32px rgba(0,0,0,0.3);
    }

    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'DM Sans', sans-serif; background: var(--bg); color: var(--text); transition: background 0.3s, color 0.3s; }
    
    .font-display { font-family: 'Fraunces', Georgia, serif; }

    .card {
      background: var(--bg2);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      box-shadow: var(--shadow);
    }

    .btn-primary {
      background: var(--accent);
      color: white;
      border: none;
      border-radius: 10px;
      padding: 12px 24px;
      font-family: 'DM Sans', sans-serif;
      font-weight: 500;
      font-size: 15px;
      cursor: pointer;
      transition: all 0.2s;
    }
    .btn-primary:hover { background: var(--accent2); transform: translateY(-1px); box-shadow: 0 4px 16px rgba(200,105,42,0.3); }
    .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }

    .btn-ghost {
      background: transparent;
      color: var(--text2);
      border: 1px solid var(--border2);
      border-radius: 10px;
      padding: 10px 20px;
      font-family: 'DM Sans', sans-serif;
      font-weight: 500;
      font-size: 14px;
      cursor: pointer;
      transition: all 0.2s;
    }
    .btn-ghost:hover { background: var(--bg3); color: var(--text); }

    .tag {
      display: inline-block;
      background: var(--bg3);
      border: 1px solid var(--border);
      border-radius: 6px;
      padding: 4px 10px;
      font-size: 12px;
      font-weight: 500;
      color: var(--text2);
    }

    .tag-accent {
      background: var(--accent-bg);
      border-color: transparent;
      color: var(--accent);
    }

    .tag-green {
      background: var(--green-bg);
      border-color: transparent;
      color: var(--green);
    }

    .tag-blue {
      background: var(--blue-bg);
      border-color: transparent;
      color: var(--blue);
    }

    /* Score bar */
    .score-bar {
      height: 6px;
      background: var(--bg3);
      border-radius: 99px;
      overflow: hidden;
    }
    .score-fill {
      height: 100%;
      border-radius: 99px;
      background: linear-gradient(90deg, var(--accent), var(--accent2));
      transition: width 1s cubic-bezier(0.4,0,0.2,1);
    }

    /* Chat bubbles */
    .msg-ai {
      background: var(--bg3);
      border: 1px solid var(--border);
      border-radius: 4px 16px 16px 16px;
      padding: 14px 18px;
      max-width: 520px;
      animation: slideIn 0.3s ease;
    }
    .msg-user {
      background: var(--accent);
      color: white;
      border-radius: 16px 4px 16px 16px;
      padding: 12px 18px;
      max-width: 480px;
      margin-left: auto;
      animation: slideIn 0.3s ease;
    }

    @keyframes slideIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }

    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; } 50% { opacity: 0.4; }
    }

    .animate-fade-up { animation: fadeUp 0.6s ease forwards; }
    .animate-delay-1 { animation-delay: 0.1s; opacity: 0; }
    .animate-delay-2 { animation-delay: 0.2s; opacity: 0; }
    .animate-delay-3 { animation-delay: 0.3s; opacity: 0; }
    .animate-delay-4 { animation-delay: 0.4s; opacity: 0; }
    .animate-delay-5 { animation-delay: 0.5s; opacity: 0; }

    .typing-dot {
      display: inline-block;
      width: 6px; height: 6px;
      border-radius: 50%;
      background: var(--text3);
      animation: pulse 1.4s infinite;
    }
    .typing-dot:nth-child(2) { animation-delay: 0.2s; }
    .typing-dot:nth-child(3) { animation-delay: 0.4s; }

    /* Scrollbar */
    ::-webkit-scrollbar { width: 4px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: var(--border2); border-radius: 99px; }

    /* Accordion */
    .accordion-content {
      overflow: hidden;
      transition: max-height 0.35s cubic-bezier(0.4,0,0.2,1), opacity 0.3s;
    }

    /* Roadmap timeline */
    .timeline-item::before {
      content: '';
      position: absolute;
      left: 19px;
      top: 40px;
      bottom: -20px;
      width: 2px;
      background: linear-gradient(to bottom, var(--accent), transparent);
    }
    .timeline-item:last-child::before { display: none; }

    /* Nav */
    nav { backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); }

    .comparison-table td, .comparison-table th {
      padding: 12px 16px;
      border-bottom: 1px solid var(--border);
      font-size: 14px;
    }
    .comparison-table th { color: var(--text3); font-weight: 500; text-align: left; }

    @media (max-width: 768px) {
      .msg-ai, .msg-user { max-width: 90%; }
    }
  `;
  document.head.appendChild(style);
};

// ─── Utility Components ───────────────────────────────────────────────────────
function LoadingDots() {
  return (
    <div className="msg-ai" style={{ display: "inline-flex", gap: "6px", alignItems: "center", padding: "14px 18px" }}>
      <span className="typing-dot" />
      <span className="typing-dot" />
      <span className="typing-dot" />
    </div>
  );
}

function ScoreRing({ score, size = 80 }) {
  const r = (size - 10) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  const color = score >= 80 ? "#2a7a4a" : score >= 65 ? "#c8692a" : "#8a8680";

  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--bg3)" strokeWidth="8" />
      <circle
        cx={size / 2} cy={size / 2} r={r}
        fill="none" stroke={color} strokeWidth="8"
        strokeLinecap="round"
        strokeDasharray={`${dash} ${circ}`}
        style={{ transition: "stroke-dasharray 1.2s cubic-bezier(0.4,0,0.2,1)" }}
      />
      <text
        x={size / 2} y={size / 2}
        textAnchor="middle" dominantBaseline="middle"
        fill="var(--text)" fontSize="16" fontWeight="600"
        style={{ transform: `rotate(90deg) translate(0, -${size}px)`, transformOrigin: `${size / 2}px ${size / 2}px`, fontFamily: "'DM Sans', sans-serif" }}
      >
        {score}%
      </text>
    </svg>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState("landing"); // landing | chat | results | compare | roadmap
  const [dark, setDark] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [userAnswers, setUserAnswers] = useState({});
  const [currentQ, setCurrentQ] = useState(0);
  const [inputVal, setInputVal] = useState("");
  const [aiTyping, setAiTyping] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [selectedForCompare, setSelectedForCompare] = useState([]);
  const [compareResult, setCompareResult] = useState(null);
  const [compareLoading, setCompareLoading] = useState(false);
  const [activeRoadmapCareer, setActiveRoadmapCareer] = useState(null);
  const chatEndRef = useRef(null);

  useEffect(() => { injectStyles(); }, []);
  useEffect(() => {
    document.body.className = dark ? "dark" : "";
  }, [dark]);
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, aiTyping]);

  const startAssessment = () => {
    setPage("chat");
    setChatMessages([]);
    setUserAnswers({});
    setCurrentQ(0);
    setResults(null);
    setError(null);
    setTimeout(() => {
      addAiMessage(
        "Welcome! I'm your AI Career Guide. I'll ask you 6 questions to understand your strengths, passions, and work style — then match you with your ideal career paths.\n\nLet's begin! 🌟"
      );
      setTimeout(() => addAiMessage(QUESTIONS[0].text), 800);
    }, 400);
  };

  const addAiMessage = (text) => {
    setChatMessages((prev) => [...prev, { role: "ai", text }]);
  };

  const handleSend = async () => {
    if (!inputVal.trim()) return;
    const answer = inputVal.trim();
    setInputVal("");
    const qId = QUESTIONS[currentQ].id;

    setChatMessages((prev) => [...prev, { role: "user", text: answer }]);
    const newAnswers = { ...userAnswers, [qId]: answer };
    setUserAnswers(newAnswers);

    const nextQ = currentQ + 1;

    if (nextQ < QUESTIONS.length) {
      setCurrentQ(nextQ);
      setAiTyping(true);
      await new Promise((r) => setTimeout(r, 700));
      setAiTyping(false);
      addAiMessage(QUESTIONS[nextQ].text);
    } else {
      setAiTyping(true);
      addAiMessage("Excellent! I have everything I need. Analyzing your profile now...");
      await analyzeCareer(newAnswers);
    }
  };

  const analyzeCareer = async (answers) => {
    try {
      const prompt = buildAnalysisPrompt(answers);
      const raw = await callGemini(prompt);
      const json = extractJSON(raw);
      if (!json?.career_suggestions?.length) throw new Error("Invalid response structure");
      setResults(json);
      setAiTyping(false);
      addAiMessage("Your personalized career analysis is ready! Let me show you your top matches. 🎯");
      setTimeout(() => setPage("results"), 1200);
    } catch (e) {
      setAiTyping(false);
      setError(e.message);
      addAiMessage(`Sorry, something went wrong: ${e.message}. Please try again.`);
    }
  };

  const buildAnalysisPrompt = (answers) => `
You are an expert career counselor and psychologist. Based on the user's responses, provide a comprehensive career analysis.

User Profile:
- Interests: ${answers.interests || "Not provided"}
- Skills: ${answers.skills || "Not provided"}
- Work Style: ${answers.work_style || "Not provided"}
- Preference (people/data/systems): ${answers.people_data_systems || "Not provided"}
- Career Values: ${answers.values || "Not provided"}
- Weaknesses: ${answers.weaknesses || "Not provided"}

Return ONLY valid JSON (no markdown, no explanation outside JSON) in this exact format:
{
  "career_suggestions": [
    {
      "career": "Career Title",
      "fit_score": 85,
      "reasoning": "Detailed 2-3 sentence explanation of why this career fits this specific user's profile",
      "required_skills": ["Skill1", "Skill2", "Skill3", "Skill4", "Skill5"],
      "skill_gap": ["Missing skill 1", "Missing skill 2", "Missing skill 3"],
      "roadmap": [
        "Step 1: Specific action with timeline",
        "Step 2: Specific action with timeline",
        "Step 3: Specific action with timeline",
        "Step 4: Specific action with timeline",
        "Step 5: Specific action with timeline"
      ],
      "avg_salary": "$XX,000 - $XX,000",
      "growth_outlook": "High/Medium/Low",
      "personality_fit": "Brief personality archetype description"
    }
  ]
}

Provide exactly 3 career suggestions ranked by fit score (highest first). Be specific and personalized to THIS user's actual answers.`;

  const extractJSON = (text) => {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("No JSON found in response");
    return JSON.parse(match[0]);
  };

  const handleCompare = async () => {
    if (selectedForCompare.length !== 2) return;
    setCompareLoading(true);
    setPage("compare");
    try {
      const [c1, c2] = selectedForCompare.map((i) => results.career_suggestions[i]);
      const prompt = `Compare these two careers for a user who answered:
Interests: ${userAnswers.interests}
Skills: ${userAnswers.skills}
Values: ${userAnswers.values}

Career A: ${c1.career}
Career B: ${c2.career}

Return ONLY valid JSON:
{
  "comparison": {
    "summary": "2-sentence executive summary of key differences",
    "dimensions": [
      {"label": "Work-Life Balance", "a_score": 75, "b_score": 65, "note": "brief note"},
      {"label": "Earning Potential", "a_score": 80, "b_score": 90, "note": "brief note"},
      {"label": "Creative Freedom", "a_score": 85, "b_score": 55, "note": "brief note"},
      {"label": "Job Security", "a_score": 70, "b_score": 85, "note": "brief note"},
      {"label": "Learning Curve", "a_score": 75, "b_score": 70, "note": "brief note"}
    ],
    "a_pros": ["Pro 1", "Pro 2", "Pro 3"],
    "a_cons": ["Con 1", "Con 2"],
    "b_pros": ["Pro 1", "Pro 2", "Pro 3"],
    "b_cons": ["Con 1", "Con 2"],
    "recommendation": "One sentence: which is better for THIS user and why"
  }
}`;
      const raw = await callGemini(prompt);
      const json = extractJSON(raw);
      setCompareResult({ ...json.comparison, careers: [c1, c2] });
    } catch (e) {
      setError(e.message);
    }
    setCompareLoading(false);
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", color: "var(--text)", transition: "all 0.3s" }}>
      {/* Nav */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        borderBottom: "1px solid var(--border)",
        background: "var(--surface)", padding: "0 24px", height: "60px",
        display: "flex", alignItems: "center", justifyContent: "space-between"
      }}>
        <button onClick={() => setPage("landing")} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ color: "white", fontSize: 14, fontWeight: 700 }}>C</span>
          </div>
          <span className="font-display" style={{ fontSize: 16, fontWeight: 600, color: "var(--text)" }}>CareerAI</span>
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {page === "results" && results && (
            <>
              <button className="btn-ghost" style={{ fontSize: 13, padding: "7px 14px" }} onClick={() => { setActiveRoadmapCareer(0); setPage("roadmap"); }}>
                Roadmap
              </button>
              <button
                className={`btn-ghost`}
                style={{ fontSize: 13, padding: "7px 14px", ...(selectedForCompare.length === 2 ? { background: "var(--accent-bg)", color: "var(--accent)", borderColor: "transparent" } : {}) }}
                onClick={handleCompare}
                disabled={selectedForCompare.length !== 2}
              >
                {selectedForCompare.length === 2 ? "Compare Selected →" : `Compare (${selectedForCompare.length}/2)`}
              </button>
            </>
          )}
          {(page === "compare" || page === "roadmap") && (
            <button className="btn-ghost" style={{ fontSize: 13, padding: "7px 14px" }} onClick={() => setPage("results")}>← Back to Results</button>
          )}
          <button
            onClick={() => setDark(!dark)}
            style={{ background: "var(--bg3)", border: "1px solid var(--border)", borderRadius: 8, padding: "6px 10px", cursor: "pointer", fontSize: 16, color: "var(--text)" }}
            title="Toggle dark mode"
          >
            {dark ? "☀️" : "🌙"}
          </button>
        </div>
      </nav>

      <div style={{ paddingTop: 60 }}>
        {page === "landing" && <LandingPage onStart={startAssessment} />}
        {page === "chat" && (
          <ChatPage
            messages={chatMessages}
            typing={aiTyping}
            inputVal={inputVal}
            setInputVal={setInputVal}
            onSend={handleSend}
            currentQ={currentQ}
            chatEndRef={chatEndRef}
            error={error}
          />
        )}
        {page === "results" && results && (
          <ResultsPage
            results={results}
            selectedForCompare={selectedForCompare}
            setSelectedForCompare={setSelectedForCompare}
            onViewRoadmap={(i) => { setActiveRoadmapCareer(i); setPage("roadmap"); }}
            onCompare={handleCompare}
            onRetake={startAssessment}
          />
        )}
        {page === "compare" && (
          <ComparePage
            loading={compareLoading}
            result={compareResult}
            error={error}
            onBack={() => setPage("results")}
          />
        )}
        {page === "roadmap" && results && (
          <RoadmapPage
            career={results.career_suggestions[activeRoadmapCareer || 0]}
            allCareers={results.career_suggestions}
            activeIdx={activeRoadmapCareer}
            setActiveIdx={setActiveRoadmapCareer}
            onBack={() => setPage("results")}
          />
        )}
      </div>
    </div>
  );
}

// ─── Landing Page ─────────────────────────────────────────────────────────────
function LandingPage({ onStart }) {
  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "80px 24px 60px" }}>
      {/* Hero */}
      <div style={{ textAlign: "center", marginBottom: 80 }}>

        <h1 className="font-display animate-fade-up animate-delay-1" style={{ fontSize: "clamp(42px, 6vw, 72px)", lineHeight: 1.1, fontWeight: 400, marginBottom: 24, color: "var(--text)" }}>
          Discover the career<br /><em style={{ color: "var(--accent)", fontStyle: "italic" }}>you were born for</em>
        </h1>
        <p className="animate-fade-up animate-delay-2" style={{ fontSize: 18, color: "var(--text2)", maxWidth: 520, margin: "0 auto 40px", lineHeight: 1.6 }}>
          A 6-question AI assessment that maps your interests, skills, and personality to your ideal career path — with a full roadmap to get there.
        </p>
        <div className="animate-fade-up animate-delay-3" style={{ display: "flex", justifyContent: "center", gap: 12, flexWrap: "wrap" }}>
          <button className="btn-primary" style={{ fontSize: 16, padding: "14px 32px" }} onClick={onStart}>
            Start Free Assessment →
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "14px 20px", color: "var(--text3)", fontSize: 14 }}>
            <span>⏱</span> Takes ~3 minutes
          </div>
        </div>
      </div>

      {/* Feature Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 20, marginBottom: 80 }}>
        {[
          { icon: "◈", title: "Career Matching", desc: "AI analyzes your profile against hundreds of career paths to find your best fits" },
          { icon: "◉", title: "Fit Score", desc: "Each career gets a personalised compatibility score based on your unique profile" },
          { icon: "◆", title: "Skill Gap Analysis", desc: "Know exactly what skills you're missing and what you already have" },
          { icon: "◎", title: "Learning Roadmap", desc: "Step-by-step guide to transition into your new career, with timelines" },
        ].map((f, i) => (
          <div key={i} className={`card animate-fade-up animate-delay-${i + 1}`} style={{ padding: "28px 24px" }}>
            <div style={{ fontSize: 24, marginBottom: 16, color: "var(--accent)" }}>{f.icon}</div>
            <div style={{ fontWeight: 600, marginBottom: 8, fontSize: 15 }}>{f.title}</div>
            <div style={{ color: "var(--text2)", fontSize: 14, lineHeight: 1.6 }}>{f.desc}</div>
          </div>
        ))}
      </div>

      {/* Process */}
      <div style={{ textAlign: "center", marginBottom: 60 }}>
        <h2 className="font-display" style={{ fontSize: 32, fontWeight: 400, marginBottom: 40 }}>How it works</h2>
        <div style={{ display: "flex", justifyContent: "center", gap: 40, flexWrap: "wrap" }}>
          {["Answer 6 questions", "AI analyses your profile", "Get 3 career matches", "Explore your roadmap"].map((step, i) => (
            <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, maxWidth: 140 }}>
              <div style={{ width: 44, height: 44, borderRadius: "50%", background: i === 0 ? "var(--accent)" : "var(--bg3)", border: "2px solid var(--border2)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 600, fontSize: 16, color: i === 0 ? "white" : "var(--text2)" }}>
                {i + 1}
              </div>
              <div style={{ fontSize: 13, color: "var(--text2)", textAlign: "center", lineHeight: 1.5 }}>{step}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ textAlign: "center" }}>
        <button className="btn-primary" style={{ fontSize: 15, padding: "13px 28px" }} onClick={onStart}>
          Begin Your Assessment →
        </button>
      </div>
    </div>
  );
}

// ─── Chat Page ────────────────────────────────────────────────────────────────
function ChatPage({ messages, typing, inputVal, setInputVal, onSend, currentQ, chatEndRef, error }) {
  const progress = Math.min((currentQ / QUESTIONS.length) * 100, 100);
  const handleKey = (e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); onSend(); } };

  return (
    <div style={{ maxWidth: 680, margin: "0 auto", padding: "32px 24px", display: "flex", flexDirection: "column", height: "calc(100vh - 60px)" }}>
      {/* Progress */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 13, color: "var(--text3)" }}>
          <span>Career Assessment</span>
          <span>Question {Math.min(currentQ + 1, QUESTIONS.length)} of {QUESTIONS.length}</span>
        </div>
        <div className="score-bar">
          <div className="score-fill" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 16, paddingBottom: 16 }}>
        {messages.map((m, i) => (
          <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: m.role === "user" ? "flex-end" : "flex-start" }}>
            {m.role === "ai" && <div style={{ fontSize: 11, color: "var(--text3)", marginBottom: 4, marginLeft: 4 }}>CareerAI</div>}
            <div className={m.role === "ai" ? "msg-ai" : "msg-user"} style={{ fontSize: 14, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
              {m.text}
            </div>
          </div>
        ))}
        {typing && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
            <div style={{ fontSize: 11, color: "var(--text3)", marginBottom: 4, marginLeft: 4 }}>CareerAI</div>
            <LoadingDots />
          </div>
        )}
        {error && (
          <div style={{ background: "rgba(200,50,50,0.08)", border: "1px solid rgba(200,50,50,0.2)", borderRadius: 12, padding: "12px 16px", color: "#c83232", fontSize: 13 }}>
            ⚠️ {error}
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input */}
      <div style={{ background: "var(--bg2)", border: "1px solid var(--border2)", borderRadius: 14, padding: "12px 14px", display: "flex", gap: 10, alignItems: "flex-end" }}>
        <textarea
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          onKeyDown={handleKey}
          placeholder={currentQ < QUESTIONS.length ? QUESTIONS[currentQ]?.placeholder : "Assessment complete..."}
          disabled={typing || currentQ >= QUESTIONS.length}
          rows={1}
          style={{
            flex: 1, background: "none", border: "none", outline: "none", resize: "none",
            font: "15px 'DM Sans', sans-serif", color: "var(--text)", lineHeight: 1.5,
            maxHeight: 120, overflow: "auto"
          }}
          onInput={(e) => { e.target.style.height = "auto"; e.target.style.height = e.target.scrollHeight + "px"; }}
        />
        <button
          className="btn-primary"
          onClick={onSend}
          disabled={!inputVal.trim() || typing || currentQ >= QUESTIONS.length}
          style={{ padding: "8px 16px", fontSize: 14, flexShrink: 0 }}
        >
          Send →
        </button>
      </div>
      <div style={{ textAlign: "center", marginTop: 8, fontSize: 12, color: "var(--text3)" }}>Press Enter to send</div>
    </div>
  );
}

// ─── Results Page ─────────────────────────────────────────────────────────────
function ResultsPage({ results, selectedForCompare, setSelectedForCompare, onViewRoadmap, onRetake }) {
  const [expanded, setExpanded] = useState({});
  const toggle = (i) => setExpanded((p) => ({ ...p, [i]: !p[i] }));
  const toggleCompare = (i) => {
    setSelectedForCompare((prev) => {
      if (prev.includes(i)) return prev.filter((x) => x !== i);
      if (prev.length >= 2) return prev;
      return [...prev, i];
    });
  };

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "40px 24px 80px" }}>
      <div className="animate-fade-up" style={{ marginBottom: 40 }}>
        <div style={{ fontSize: 13, color: "var(--accent)", fontWeight: 500, marginBottom: 8 }}>✦ Analysis Complete</div>
        <h2 className="font-display" style={{ fontSize: 36, fontWeight: 400, marginBottom: 12 }}>Your Career Matches</h2>
        <p style={{ color: "var(--text2)", fontSize: 15 }}>Based on your profile, here are your top 3 career recommendations. Select 2 to compare.</p>
      </div>

      {/* Summary Row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 40 }}>
        {results.career_suggestions.map((c, i) => (
          <button
            key={i}
            onClick={() => toggleCompare(i)}
            className={`card animate-fade-up animate-delay-${i + 1}`}
            style={{
              padding: "20px",
              cursor: "pointer",
              textAlign: "left",
              transition: "all 0.2s",
              border: selectedForCompare.includes(i) ? "2px solid var(--accent)" : "1px solid var(--border)",
              background: selectedForCompare.includes(i) ? "var(--accent-bg)" : "var(--bg2)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                #{i + 1} Match
              </div>
              <ScoreRing score={c.fit_score} size={56} />
            </div>
            <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 4 }}>{c.career}</div>
            <div style={{ fontSize: 12, color: "var(--text3)" }}>{c.avg_salary}</div>
          </button>
        ))}
      </div>

      {/* Detail Cards */}
      {results.career_suggestions.map((c, i) => (
        <div key={i} className={`card animate-fade-up animate-delay-${i + 2}`} style={{ marginBottom: 20, overflow: "hidden" }}>
          <div style={{ padding: "28px 28px 24px" }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 20, marginBottom: 20, flexWrap: "wrap" }}>
              <ScoreRing score={c.fit_score} size={72} />
              <div style={{ flex: 1, minWidth: 200 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6, flexWrap: "wrap" }}>
                  <h3 style={{ fontSize: 22, fontWeight: 600 }}>{c.career}</h3>
                  <span className={`tag ${c.fit_score >= 80 ? "tag-green" : "tag-accent"}`}>{c.fit_score >= 80 ? "Strong Match" : "Good Match"}</span>
                  {c.growth_outlook && <span className="tag tag-blue">📈 {c.growth_outlook} Growth</span>}
                </div>
                <div style={{ fontSize: 14, color: "var(--text2)", marginBottom: 6 }}>{c.avg_salary}</div>
                <div style={{ fontSize: 13, color: "var(--text3)", fontStyle: "italic" }}>{c.personality_fit}</div>
              </div>
              <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                <button className="btn-ghost" style={{ fontSize: 12, padding: "7px 14px" }} onClick={() => onViewRoadmap(i)}>View Roadmap</button>
                <button
                  className="btn-ghost"
                  style={{ fontSize: 12, padding: "7px 14px", ...(selectedForCompare.includes(i) ? { background: "var(--accent-bg)", color: "var(--accent)", borderColor: "transparent" } : {}) }}
                  onClick={() => toggleCompare(i)}
                >
                  {selectedForCompare.includes(i) ? "✓ Selected" : "Compare"}
                </button>
              </div>
            </div>

            {/* Reasoning */}
            <div style={{ background: "var(--bg3)", borderRadius: 10, padding: "14px 16px", marginBottom: 20, fontSize: 14, lineHeight: 1.7, color: "var(--text2)" }}>
              <span style={{ fontWeight: 600, color: "var(--text)" }}>Why this fits you: </span>{c.reasoning}
            </div>

            {/* Skills Row */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 10 }}>Required Skills</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {c.required_skills?.map((s, j) => <span key={j} className="tag tag-green">{s}</span>)}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 10 }}>Skill Gaps</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {c.skill_gap?.map((s, j) => <span key={j} className="tag" style={{ background: "rgba(200,50,50,0.07)", color: "#c83232" }}>{s}</span>)}
                </div>
              </div>
            </div>

            {/* Accordion: Roadmap Preview */}
            <button
              onClick={() => toggle(i)}
              style={{ width: "100%", textAlign: "left", background: "none", border: "1px solid var(--border)", borderRadius: 10, padding: "12px 16px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", color: "var(--text)", fontSize: 14, fontWeight: 500 }}
            >
              <span>Learning Roadmap Preview</span>
              <span style={{ transition: "transform 0.3s", transform: expanded[i] ? "rotate(180deg)" : "rotate(0deg)" }}>▾</span>
            </button>
            <div className="accordion-content" style={{ maxHeight: expanded[i] ? "400px" : 0, opacity: expanded[i] ? 1 : 0 }}>
              <div style={{ paddingTop: 16 }}>
                {c.roadmap?.map((step, j) => (
                  <div key={j} style={{ display: "flex", gap: 14, marginBottom: 14, alignItems: "flex-start" }}>
                    <div style={{ width: 28, height: 28, borderRadius: "50%", background: "var(--accent)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 600, flexShrink: 0 }}>{j + 1}</div>
                    <div style={{ fontSize: 14, color: "var(--text2)", paddingTop: 4, lineHeight: 1.6 }}>{step}</div>
                  </div>
                ))}
              </div>
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

// ─── Compare Page ─────────────────────────────────────────────────────────────
function ComparePage({ loading, result, error, onBack }) {
  if (loading) {
    return (
      <div style={{ maxWidth: 800, margin: "80px auto", padding: "0 24px", textAlign: "center" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
          <div style={{ width: 48, height: 48, borderRadius: "50%", border: "3px solid var(--accent)", borderTopColor: "transparent", animation: "spin 0.8s linear infinite" }} />
          <div className="font-display" style={{ fontSize: 22 }}>Comparing careers...</div>
          <div style={{ color: "var(--text3)", fontSize: 14 }}>AI is analyzing trade-offs for your profile</div>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ maxWidth: 600, margin: "80px auto", padding: "0 24px", textAlign: "center" }}>
        <div style={{ background: "rgba(200,50,50,0.08)", border: "1px solid rgba(200,50,50,0.2)", borderRadius: 14, padding: 24, color: "#c83232" }}>
          ⚠️ {error}
        </div>
        <button className="btn-ghost" style={{ marginTop: 20 }} onClick={onBack}>← Back</button>
      </div>
    );
  }

  if (!result) return null;

  const { careers, summary, dimensions, a_pros, a_cons, b_pros, b_cons, recommendation } = result;

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "40px 24px 80px" }}>
      <div className="animate-fade-up" style={{ marginBottom: 32 }}>
        <div style={{ fontSize: 13, color: "var(--accent)", fontWeight: 500, marginBottom: 8 }}>◈ Career Comparison</div>
        <h2 className="font-display" style={{ fontSize: 36, fontWeight: 400, marginBottom: 12 }}>
          {careers[0]?.career} vs {careers[1]?.career}
        </h2>
        <p style={{ color: "var(--text2)", maxWidth: 600, lineHeight: 1.6 }}>{summary}</p>
      </div>

      {/* Score Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 32 }}>
        {careers.map((c, i) => (
          <div key={i} className="card" style={{ padding: "24px", textAlign: "center" }}>
            <ScoreRing score={c.fit_score} size={72} />
            <div style={{ fontWeight: 600, fontSize: 16, marginTop: 12 }}>{c.career}</div>
            <div style={{ color: "var(--text3)", fontSize: 13, marginTop: 4 }}>{c.avg_salary}</div>
          </div>
        ))}
      </div>

      {/* Dimension Comparison */}
      <div className="card" style={{ padding: "28px", marginBottom: 24 }}>
        <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 20 }}>Dimension Breakdown</h3>
        {dimensions?.map((d, i) => (
          <div key={i} style={{ marginBottom: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 13 }}>
              <span style={{ fontWeight: 500 }}>{d.label}</span>
              <span style={{ color: "var(--text3)", fontSize: 12 }}>{d.note}</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {[{ score: d.a_score, label: careers[0]?.career }, { score: d.b_score, label: careers[1]?.career }].map((item, j) => (
                <div key={j}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, fontSize: 11, color: "var(--text3)" }}>
                    <span style={{ maxWidth: "70%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.label}</span>
                    <span>{item.score}</span>
                  </div>
                  <div className="score-bar">
                    <div className="score-fill" style={{ width: `${item.score}%`, background: j === 0 ? "var(--accent)" : "var(--blue)" }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Pros & Cons */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 24 }}>
        {[{ career: careers[0], pros: a_pros, cons: a_cons }, { career: careers[1], pros: b_pros, cons: b_cons }].map((item, i) => (
          <div key={i} className="card" style={{ padding: "24px" }}>
            <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 16 }}>{item.career?.career}</div>
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: "var(--green)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>Pros</div>
              {item.pros?.map((p, j) => (
                <div key={j} style={{ display: "flex", gap: 8, marginBottom: 6, fontSize: 13, color: "var(--text2)" }}>
                  <span style={{ color: "var(--green)", flexShrink: 0 }}>✓</span> {p}
                </div>
              ))}
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, color: "#c83232", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>Cons</div>
              {item.cons?.map((c, j) => (
                <div key={j} style={{ display: "flex", gap: 8, marginBottom: 6, fontSize: 13, color: "var(--text2)" }}>
                  <span style={{ color: "#c83232", flexShrink: 0 }}>✗</span> {c}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Recommendation */}
      <div style={{ background: "var(--accent-bg)", border: "1px solid var(--accent)", borderRadius: 14, padding: "20px 24px" }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: "var(--accent)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>AI Recommendation</div>
        <div style={{ fontSize: 15, color: "var(--text)", lineHeight: 1.6 }}>{recommendation}</div>
      </div>
    </div>
  );
}

// ─── Roadmap Page ─────────────────────────────────────────────────────────────
function RoadmapPage({ career, allCareers, activeIdx, setActiveIdx, onBack }) {
  if (!career) return null;
  return (
    <div style={{ maxWidth: 760, margin: "0 auto", padding: "40px 24px 80px" }}>
      <div className="animate-fade-up" style={{ marginBottom: 32 }}>
        <div style={{ fontSize: 13, color: "var(--accent)", fontWeight: 500, marginBottom: 8 }}>◆ Learning Roadmap</div>
        <h2 className="font-display" style={{ fontSize: 36, fontWeight: 400, marginBottom: 8 }}>{career.career}</h2>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <span className="tag tag-accent">Fit Score: {career.fit_score}%</span>
          {career.avg_salary && <span className="tag">{career.avg_salary}</span>}
          {career.growth_outlook && <span className="tag tag-green">📈 {career.growth_outlook} Growth</span>}
        </div>
      </div>

      {/* Career selector tabs */}
      {allCareers.length > 1 && (
        <div style={{ display: "flex", gap: 8, marginBottom: 32, padding: "4px", background: "var(--bg3)", borderRadius: 12, width: "fit-content" }}>
          {allCareers.map((c, i) => (
            <button
              key={i}
              onClick={() => setActiveIdx(i)}
              style={{
                padding: "8px 16px", borderRadius: 9, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 500,
                background: activeIdx === i ? "var(--bg2)" : "transparent",
                color: activeIdx === i ? "var(--text)" : "var(--text3)",
                boxShadow: activeIdx === i ? "var(--shadow)" : "none",
                transition: "all 0.2s",
              }}
            >
              {c.career}
            </button>
          ))}
        </div>
      )}

      {/* Skill gaps */}
      <div className="card" style={{ padding: "24px", marginBottom: 24 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 14 }}>Skills to Develop</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {career.skill_gap?.map((s, i) => (
            <span key={i} style={{ background: "rgba(200,50,50,0.07)", border: "1px solid rgba(200,50,50,0.15)", borderRadius: 6, padding: "4px 10px", fontSize: 12, color: "#c83232" }}>
              + {s}
            </span>
          ))}
        </div>
      </div>

      {/* Timeline */}
      <div className="card" style={{ padding: "28px" }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 24 }}>Your Learning Path</div>
        {career.roadmap?.map((step, i) => (
          <div
            key={i}
            className="timeline-item animate-fade-up"
            style={{ position: "relative", paddingLeft: 52, paddingBottom: i < career.roadmap.length - 1 ? 32 : 0, animationDelay: `${i * 0.1}s`, opacity: 0 }}
          >
            {i < career.roadmap.length - 1 && (
              <div style={{ position: "absolute", left: 19, top: 40, bottom: -8, width: 2, background: "linear-gradient(to bottom, var(--accent), var(--border))" }} />
            )}
            <div style={{
              position: "absolute", left: 0, top: 0,
              width: 38, height: 38, borderRadius: "50%",
              background: i === 0 ? "var(--accent)" : "var(--bg3)",
              border: `2px solid ${i === 0 ? "var(--accent)" : "var(--border2)"}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontWeight: 600, fontSize: 13, color: i === 0 ? "white" : "var(--text2)",
              transition: "all 0.3s"
            }}>
              {i + 1}
            </div>
            <div className="card" style={{ padding: "14px 18px" }}>
              <div style={{ fontSize: 14, color: "var(--text)", lineHeight: 1.6 }}>{step}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Required skills */}
      <div className="card" style={{ padding: "24px", marginTop: 24 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 14 }}>Full Skill Set Required</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {career.required_skills?.map((s, i) => <span key={i} className="tag tag-green">{s}</span>)}
        </div>
      </div>
    </div>
  );
}
