import { useState, useEffect, useRef } from "react";

// ─── Gemini API Config ────────────────────────────────────────────────────────
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_MODEL = "gemini-2.5-flash";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

async function callGemini(prompt) {
    const res = await fetch(GEMINI_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 16384,
                responseMimeType: "application/json",
            },
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
        id: "education",
        text: "What is your current education level and field of study? (e.g., 12th Science PCM, B.Tech CSE 2nd year, MBA Finance, BA English graduate, Diploma in Mechanical)",
        placeholder: "I am currently studying / have completed...",
        icon: "🎓",
    },
    {
        id: "interests",
        text: "What subjects, activities, or topics genuinely excite you? Think about what you'd do even if you weren't paid. (e.g., coding, teaching, debating, designing, researching, writing, sports, music, social work)",
        placeholder: "I'm genuinely passionate about...",
        icon: "✦",
    },
    {
        id: "skills",
        text: "What are your strongest soft skills? What do friends, family, or teachers often praise you for? (e.g., leadership, communication, problem-solving, creativity, empathy, organisation)",
        placeholder: "People often say I'm good at...",
        icon: "◈",
    },
    {
        id: "technical_skills",
        text: "What technical or domain-specific skills do you have? (e.g., Python, Excel, Photoshop, video editing, lab work, accounting, public speaking, CAD, writing, data analysis)",
        placeholder: "My technical skills include...",
        icon: "⚙",
    },
    {
        id: "work_style",
        text: "How do you prefer to work? Describe your ideal work environment. (Solo vs team, creative vs structured, fast-paced vs methodical, fieldwork vs desk job, fixed hours vs flexible)",
        placeholder: "I work best when...",
        icon: "◉",
    },
    {
        id: "people_data_systems",
        text: "Do you enjoy working more with people (teaching, counselling, sales), data/numbers (analysis, research, finance), or building things/systems (engineering, coding, design)?",
        placeholder: "I enjoy working most with...",
        icon: "◎",
    },
    {
        id: "values",
        text: "What matters most to you in a career? Rank or describe your top priorities. (Job security, high salary, work-life balance, social impact, creativity, government job stability, entrepreneurship, foreign opportunities)",
        placeholder: "What I value most in my career is...",
        icon: "◆",
    },
    {
        id: "location",
        text: "Where would you prefer to work? (Metro cities like Mumbai/Delhi/Bangalore, Tier-2 cities like Jaipur/Pune/Lucknow, your hometown, remote/WFH, open to anywhere, abroad)",
        placeholder: "I'd prefer to work in...",
        icon: "📍",
    },
    {
        id: "sector_pref",
        text: "Which sector appeals to you most? (Government/PSU, private corporate, startups, freelancing/self-employed, NGO/social sector, academia/research, or open to any)",
        placeholder: "I'm most drawn towards...",
        icon: "🏢",
    },
    {
        id: "budget_timeline",
        text: "How much time and money are you willing to invest in upskilling or further education? (e.g., 6 months self-study, 2-year master's degree, online courses only, ready for competitive exam prep for 1-2 years)",
        placeholder: "I can invest approximately...",
        icon: "⏳",
    },
    {
        id: "weaknesses",
        text: "What are your weaknesses or areas you want to improve? Be honest — it helps us guide you better. (e.g., public speaking, maths, time management, confidence, English fluency, technical skills)",
        placeholder: "I struggle with...",
        icon: "◇",
    },
    {
        id: "aspirations",
        text: "Where do you see yourself in 5–10 years? What does your dream career or life look like? (e.g., leading a tech team, running my own business, working in the IAS, settled abroad, teaching at a university)",
        placeholder: "In 5-10 years, I see myself...",
        icon: "🚀",
    },
];

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
    const [page, setPage] = useState("landing"); // landing | chat | results | compare | roadmap | history
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
    const [savedSessions, setSavedSessions] = useState([]);
    const chatEndRef = useRef(null);

    // Load saved sessions from localStorage on mount
    useEffect(() => {
        const saved = JSON.parse(localStorage.getItem("careerAiHistory") || "[]");
        setSavedSessions(saved);
    }, []);

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
                "Welcome! I'm your AI Career Guide. I'll ask you 12 detailed questions to deeply understand your education, strengths, passions, preferences, and aspirations — then match you with your ideal career paths in the Indian job market.\n\nLet's begin! 🌟"
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
            setCurrentQ(nextQ);
            setAiTyping(true);
            addAiMessage("Excellent! I have everything I need. Analyzing your profile now...");
            await analyzeCareer(newAnswers);
        }
    };

    const analyzeCareer = async (answers) => {
        try {
            setError(null);
            const prompt = buildAnalysisPrompt(answers);
            const raw = await callGemini(prompt);
            const json = extractJSON(raw);
            if (!json?.career_suggestions?.length) throw new Error("Invalid response structure");
            setResults(json);
            setAiTyping(false);
            addAiMessage("Your personalized career analysis is ready! Let me show you your top matches. 🎯");
            // Save to localStorage
            const session = {
                id: Date.now(),
                date: new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }),
                answers: userAnswers,
                results: json,
                topCareer: json.career_suggestions[0]?.career || "Unknown",
                topScore: json.career_suggestions[0]?.fit_score || 0,
            };
            const history = JSON.parse(localStorage.getItem("careerAiHistory") || "[]");
            const updated = [session, ...history].slice(0, 20); // Keep last 20
            localStorage.setItem("careerAiHistory", JSON.stringify(updated));
            setSavedSessions(updated);
            setTimeout(() => setPage("results"), 1200);
        } catch (e) {
            setAiTyping(false);
            setError(e.message);
            addAiMessage(`Sorry, something went wrong: ${e.message}. You can click "Retry" below to try again.`);
        }
    };

    const handleRetry = () => {
        setError(null);
        setAiTyping(true);
        addAiMessage("Retrying analysis...");
        analyzeCareer(userAnswers);
    };

    const buildAnalysisPrompt = (answers) => `
You are a world-class career counselor who specialises EXCLUSIVELY in the Indian job market. You have deep expertise in:

**GOVERNMENT & PUBLIC SECTOR:**
- UPSC Civil Services (IAS, IPS, IFS, IRS), SSC CGL, SSC CHSL, State PSC exams
- Banking: IBPS PO/Clerk, SBI PO, RBI Grade B, NABARD
- Railways: RRB NTPC, RRB JE, RRB Group D
- Defence: NDA, CDS, AFCAT, Indian Navy, Coast Guard
- PSUs: ONGC, BHEL, NTPC, ISRO, DRDO, BARC, HAL, BEL
- Teaching: UGC NET, CTET, KVS, NVS, State TET

**CORPORATE & IT:**
- IT Services: TCS, Infosys, Wipro, HCL, Tech Mahindra, Cognizant
- Product companies: Google India, Microsoft India, Amazon India, Flipkart, Razorpay, Zerodha, PhonePe, CRED
- Consulting: McKinsey India, BCG India, Bain India, Deloitte India, EY, KPMG, PwC
- Finance: Goldman Sachs India, JP Morgan India, HDFC, ICICI, Kotak
- FMCG/Consumer: HUL, P&G India, ITC, Nestlé India, Asian Paints

**PROFESSIONAL EXAMINATIONS:**
- Engineering: JEE Main/Advanced, GATE, ESE
- Medical: NEET UG, NEET PG, AIIMS, FMGE
- Law: CLAT, AILET, LSAT India, Bar Council exam
- Commerce: CA (ICAI), CS (ICSI), CMA (ICMAI), CFA, ACCA
- Design: NID DAT, NIFT, UCEED, CEED
- Management: CAT, XAT, GMAT, NMAT, SNAP for IIMs/ISB/XLRI/FMS/MDI

**CREATIVE & MEDIA:**
- Film/TV: FTII, Whistling Woods, Satyajit Ray Institute
- Journalism: IIMC, ACJ, Xavier's, Symbiosis
- Digital content creation, YouTube, podcasting
- Graphic design, UI/UX (Indian startups hiring heavily)

**EMERGING SECTORS IN INDIA:**
- AI/ML, Data Science (Indian AI market growing 30%+ annually)
- Cybersecurity (India's CERT-In, NASSCOM estimates)
- Electric Vehicles (Tata Motors EV, Ather, Ola Electric)
- Space tech (ISRO, Skyroot, Agnikul, Pixxel)
- Fintech (UPI ecosystem, RBI sandbox)
- Agritech, Edtech, Healthtech startups
- Semiconductor (India Semiconductor Mission)

**LEARNING PLATFORMS & INSTITUTIONS:**
- Government: NPTEL, SWAYAM, DigiLocker, Skill India (PMKVY)
- Premier: IITs, IIMs, NITs, AIIMS, NLUs, IISc, TIFR, ISI
- Online: Coursera, Udemy, Scaler, Coding Ninjas, UpGrad, Great Learning, BYJU's, Unacademy
- Certifications: AWS, Google Cloud, Azure, NASSCOM FutureSkills, NISM (securities markets)

**SALARY BENCHMARKS (2024-25 realistic Indian market):**
- Entry-level IT: ₹3-8 LPA | Mid: ₹10-25 LPA | Senior: ₹30-60+ LPA
- Government (Group A): ₹6-10 LPA entry (7th CPC + DA) | Senior: ₹15-25 LPA + perks
- Banking PO: ₹5-8 LPA entry | Branch Manager: ₹12-18 LPA
- CA: ₹7-12 LPA entry | Partner: ₹30-100+ LPA
- Medical (MBBS): ₹5-12 LPA entry | Specialist: ₹20-80+ LPA
- Startup: ₹4-15 LPA + equity | Senior: ₹25-60+ LPA + ESOP
- Data Science: ₹6-15 LPA entry | Senior: ₹25-50+ LPA
- Design (UI/UX): ₹4-10 LPA entry | Senior: ₹20-40+ LPA
- Content/Media: ₹3-8 LPA entry | Senior/Independent: ₹15-40+ LPA

---

Based on the following DETAILED user profile, provide a highly personalized career analysis:

User Profile:
- Education: ${answers.education || "Not provided"}
- Interests & Passions: ${answers.interests || "Not provided"}
- Soft Skills: ${answers.skills || "Not provided"}
- Technical Skills: ${answers.technical_skills || "Not provided"}
- Work Style Preference: ${answers.work_style || "Not provided"}
- People / Data / Systems Preference: ${answers.people_data_systems || "Not provided"}
- Career Values & Priorities: ${answers.values || "Not provided"}
- Location Preference: ${answers.location || "Not provided"}
- Sector Preference: ${answers.sector_pref || "Not provided"}
- Upskilling Budget & Timeline: ${answers.budget_timeline || "Not provided"}
- Weaknesses: ${answers.weaknesses || "Not provided"}
- 5-10 Year Aspirations: ${answers.aspirations || "Not provided"}

---

ANALYSIS RULES:
1. Each career MUST be realistic given the user's education, location preference, and sector preference.
2. If the user prefers government jobs, suggest relevant government career paths with specific exams.
3. If the user prefers startups, suggest roles in India's startup ecosystem.
4. Reference SPECIFIC Indian companies, exams, institutions, and platforms in roadmaps.
5. Salary ranges MUST be realistic 2024-25 Indian market rates in ₹ LPA.
6. Roadmap steps should have SPECIFIC timelines and mention Indian-relevant resources.
7. Consider the user's upskilling budget and timeline when suggesting roadmaps.
8. Factor in the user's location preference (metro vs tier-2 vs remote).

Return ONLY valid JSON (no markdown, no explanation outside JSON) in this exact format:
{
  "career_suggestions": [
    {
      "career": "Career Title",
      "fit_score": 85,
      "reasoning": "Detailed 3-4 sentence explanation of why this career fits this user's specific profile, education, and aspirations in the Indian context",
      "required_skills": ["Skill1", "Skill2", "Skill3", "Skill4", "Skill5", "Skill6"],
      "skill_gap": ["Missing skill 1", "Missing skill 2", "Missing skill 3"],
      "exam_required": "Specific Indian exam or certification needed (e.g., GATE, CA Final, UPSC CSE, NEET PG) or 'None — skill-based hiring' if no exam",
      "top_indian_companies": ["Company1", "Company2", "Company3", "Company4", "Company5"],
      "indian_institutions": ["Best institution/platform 1 for this career", "Institution 2", "Institution 3"],
      "roadmap": [
        "Step 1: Specific action with timeline (e.g., 'Months 1-3: Complete Python + SQL fundamentals via NPTEL/Coursera')",
        "Step 2: Specific action with timeline",
        "Step 3: Specific action with timeline",
        "Step 4: Specific action with timeline",
        "Step 5: Specific action with timeline",
        "Step 6: Specific action with timeline",
        "Step 7: Specific action with timeline"
      ],
      "entry_salary": "₹X-Y LPA (0-2 years experience)",
      "mid_salary": "₹X-Y LPA (3-7 years experience)",
      "senior_salary": "₹X-Y LPA (8+ years experience)",
      "avg_salary": "₹X LPA - ₹Y LPA (overall range)",
      "growth_outlook": "High/Medium/Low — with 1-line reason specific to India",
      "personality_fit": "2-sentence personality archetype description matching the user"
    }
  ]
}

Provide exactly 5 career suggestions ranked by fit score (highest first). Be deeply personalized to THIS user's actual answers — do not give generic suggestions. All salaries must be in Indian Rupees (₹) as LPA (Lakhs Per Annum).`;

    const extractJSON = (text) => {
        // Strip markdown code fences if present
        let cleaned = text.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim();
        // Extract the outermost JSON object
        const match = cleaned.match(/\{[\s\S]*\}/);
        if (!match) throw new Error("No JSON found in response");
        let jsonStr = match[0];

        // Fix trailing commas before ] or } (the most common LLM JSON issue)
        const fixTrailingCommas = (str) => str.replace(/,\s*([\]\}])/g, "$1");

        try {
            return JSON.parse(fixTrailingCommas(jsonStr));
        } catch (e) {
            // If still fails, log the raw text for debugging and rethrow
            console.error("JSON parse failed. Raw response:", text);
            throw e;
        }
    };

    const handleCompare = async () => {
        if (selectedForCompare.length !== 2) return;
        setCompareLoading(true);
        setPage("compare");
        try {
            const [c1, c2] = selectedForCompare.map((i) => results.career_suggestions[i]);
            const prompt = `You are an expert Indian career counselor. Compare these two careers for an Indian user.

User Profile:
- Education: ${userAnswers.education || "Not provided"}
- Interests: ${userAnswers.interests || "Not provided"}
- Skills: ${userAnswers.skills || "Not provided"}
- Technical Skills: ${userAnswers.technical_skills || "Not provided"}
- Values: ${userAnswers.values || "Not provided"}
- Location Preference: ${userAnswers.location || "Not provided"}
- Sector Preference: ${userAnswers.sector_pref || "Not provided"}
- Aspirations: ${userAnswers.aspirations || "Not provided"}

Career A: ${c1.career} (Fit Score: ${c1.fit_score}%)
Career B: ${c2.career} (Fit Score: ${c2.fit_score}%)

Context: Indian job market 2024-25. All insights MUST be specific to India — Indian salaries in ₹ LPA, Indian companies, Indian work culture, Indian exam requirements, Indian city/tier considerations.

Return ONLY valid JSON:
{
  "comparison": {
    "summary": "3-sentence executive summary of key differences in the Indian context, referencing specific Indian market realities",
    "dimensions": [
      {"label": "Work-Life Balance", "a_score": 75, "b_score": 65, "note": "India-specific note (e.g., IT service companies vs govt 9-5)"},
      {"label": "Earning Potential (₹)", "a_score": 80, "b_score": 90, "note": "Compare realistic ₹ LPA ranges for both in India"},
      {"label": "Job Security in India", "a_score": 70, "b_score": 85, "note": "Consider govt permanence vs private layoffs vs startup risk"},
      {"label": "Career Growth", "a_score": 85, "b_score": 75, "note": "Growth trajectory in Indian market"},
      {"label": "Creative Freedom", "a_score": 85, "b_score": 55, "note": "Role autonomy in typical Indian workplace"},
      {"label": "Availability in Tier-2/3 Cities", "a_score": 50, "b_score": 80, "note": "Is this career metro-only or available pan-India?"},
      {"label": "Social Prestige in India", "a_score": 70, "b_score": 90, "note": "Cultural perception in Indian society"}
    ],
    "a_pros": ["India-specific Pro 1", "Pro 2", "Pro 3", "Pro 4"],
    "a_cons": ["India-specific Con 1", "Con 2", "Con 3"],
    "b_pros": ["India-specific Pro 1", "Pro 2", "Pro 3", "Pro 4"],
    "b_cons": ["India-specific Con 1", "Con 2", "Con 3"],
    "recommendation": "2-3 sentences: which is better for THIS specific user in India and why, referencing their education, location pref, and values"
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

    const loadSession = (session) => {
        setUserAnswers(session.answers);
        setResults(session.results);
        setSelectedForCompare([]);
        setCompareResult(null);
        setPage("results");
    };

    const deleteSession = (id) => {
        const updated = savedSessions.filter((s) => s.id !== id);
        localStorage.setItem("careerAiHistory", JSON.stringify(updated));
        setSavedSessions(updated);
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
                    {(page === "landing" || page === "history") && (
                        <button className="btn-ghost" style={{ fontSize: 13, padding: "7px 14px" }} onClick={() => setPage(page === "history" ? "landing" : "history")}>
                            {page === "history" ? "← Home" : `📋 History${savedSessions.length > 0 ? ` (${savedSessions.length})` : ""}`}
                        </button>
                    )}
                    {page === "results" && results && (
                        <>
                            <button className="btn-ghost" style={{ fontSize: 13, padding: "7px 14px" }} onClick={() => { setActiveRoadmapCareer(0); setPage("roadmap"); }}>
                                Roadmap
                            </button>
                            <button
                                className="btn-ghost"
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
                {page === "landing" && <LandingPage onStart={startAssessment} onHistory={() => setPage("history")} historyCount={savedSessions.length} />}
                {page === "history" && (
                    <HistoryPage
                        sessions={savedSessions}
                        onLoad={loadSession}
                        onDelete={deleteSession}
                        onNewAssessment={startAssessment}
                    />
                )}
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
                        onRetry={handleRetry}
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
function LandingPage({ onStart, onHistory, historyCount }) {
    return (
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "80px 24px 60px" }}>
            {/* Hero */}
            <div style={{ textAlign: "center", marginBottom: 80 }}>

                <h1 className="font-display animate-fade-up animate-delay-1" style={{ fontSize: "clamp(42px, 6vw, 72px)", lineHeight: 1.1, fontWeight: 400, marginBottom: 24, color: "var(--text)" }}>
                    Discover the career<br /><em style={{ color: "var(--accent)", fontStyle: "italic" }}>you were born for</em>
                </h1>
                <p className="animate-fade-up animate-delay-2" style={{ fontSize: 18, color: "var(--text2)", maxWidth: 520, margin: "0 auto 40px", lineHeight: 1.6 }}>
                    A 12-question AI assessment that deeply maps your education, skills, interests, and aspirations to your ideal career path in India — with a full roadmap to get there.
                </p>
                <div className="animate-fade-up animate-delay-3" style={{ display: "flex", justifyContent: "center", gap: 12, flexWrap: "wrap" }}>
                    <button className="btn-primary" style={{ fontSize: 16, padding: "14px 32px" }} onClick={onStart}>
                        Start Free Assessment →
                    </button>
                    {historyCount > 0 && (
                        <button className="btn-ghost" style={{ fontSize: 15, padding: "14px 24px" }} onClick={onHistory}>
                            📋 View Past Results ({historyCount})
                        </button>
                    )}
                    <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "14px 20px", color: "var(--text3)", fontSize: 14 }}>
                        <span>⏱</span> Takes ~5 minutes
                    </div>
                </div>
            </div>

            {/* Feature Cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 20, marginBottom: 80 }}>
                {[
                    { icon: "◈", title: "Deep Assessment", desc: "12 detailed questions covering education, skills, values, location, and sector preferences for India" },
                    { icon: "◉", title: "Fit Score", desc: "Each career gets a personalised compatibility score based on your unique profile and Indian market data" },
                    { icon: "◆", title: "India-Centric", desc: "Covers government, corporate, startup, and emerging sectors with real Indian exams, companies, and salaries" },
                    { icon: "◎", title: "Full Roadmap", desc: "Step-by-step guide with Indian institutions, platforms, and certifications to launch your career" },
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
                <div className="how-it-works" style={{ display: "flex", justifyContent: "center", gap: 40, flexWrap: "wrap" }}>
                    {["Answer 12 questions", "AI analyses your profile", "Get 5 career matches", "Explore your roadmap"].map((step, i) => (
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
function ChatPage({ messages, typing, inputVal, setInputVal, onSend, currentQ, chatEndRef, error, onRetry }) {
    const progress = Math.min((currentQ / QUESTIONS.length) * 100, 100);
    const handleKey = (e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); onSend(); } };
    const allAnswered = currentQ >= QUESTIONS.length;

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
                    <div style={{ display: "flex", flexDirection: "column", gap: 10, alignItems: "flex-start" }}>
                        <div style={{ background: "rgba(200,50,50,0.08)", border: "1px solid rgba(200,50,50,0.2)", borderRadius: 12, padding: "12px 16px", color: "#c83232", fontSize: 13 }}>
                            ⚠️ {error}
                        </div>
                        <button
                            className="btn-primary"
                            style={{ fontSize: 13, padding: "8px 20px", background: "#c83232" }}
                            onClick={onRetry}
                        >
                            ↻ Retry Analysis
                        </button>
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
                    placeholder={!allAnswered ? QUESTIONS[currentQ]?.placeholder : "Assessment complete..."}
                    disabled={typing || allAnswered}
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
                    disabled={!inputVal.trim() || typing || allAnswered}
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
            <div className="animate-fade-up results-header" style={{ marginBottom: 40 }}>
                <div style={{ fontSize: 13, color: "var(--accent)", fontWeight: 500, marginBottom: 8 }}>✦ Analysis Complete</div>
                <h2 className="font-display" style={{ fontSize: 36, fontWeight: 400, marginBottom: 12 }}>Your Career Matches</h2>
                <p style={{ color: "var(--text2)", fontSize: 15 }}>Based on your detailed profile, here are your top 5 career recommendations for the Indian job market. Select 2 to compare.</p>
            </div>

            {/* Summary Row */}
            <div className="results-summary-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 16, marginBottom: 40 }}>
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
                                    {c.growth_outlook && <span className="tag tag-blue">📈 {c.growth_outlook}</span>}
                                </div>
                                <div style={{ fontSize: 14, color: "var(--text2)", marginBottom: 4 }}>{c.avg_salary}</div>
                                {c.exam_required && c.exam_required !== "None" && c.exam_required !== "None — skill-based hiring" && (
                                    <div style={{ fontSize: 12, color: "var(--blue)", marginBottom: 4 }}>📝 {c.exam_required}</div>
                                )}
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
                        <div style={{ background: "var(--bg3)", borderRadius: 10, padding: "14px 16px", marginBottom: 16, fontSize: 14, lineHeight: 1.7, color: "var(--text2)" }}>
                            <span style={{ fontWeight: 600, color: "var(--text)" }}>Why this fits you: </span>{c.reasoning}
                        </div>

                        {/* Salary Breakdown & Extras */}
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12, marginBottom: 16 }}>
                            {c.entry_salary && (
                                <div style={{ background: "var(--bg3)", borderRadius: 8, padding: "10px 14px" }}>
                                    <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 4 }}>Entry-Level</div>
                                    <div style={{ fontSize: 14, fontWeight: 500, color: "var(--text)" }}>{c.entry_salary}</div>
                                </div>
                            )}
                            {c.mid_salary && (
                                <div style={{ background: "var(--bg3)", borderRadius: 8, padding: "10px 14px" }}>
                                    <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 4 }}>Mid-Level</div>
                                    <div style={{ fontSize: 14, fontWeight: 500, color: "var(--text)" }}>{c.mid_salary}</div>
                                </div>
                            )}
                            {c.senior_salary && (
                                <div style={{ background: "var(--bg3)", borderRadius: 8, padding: "10px 14px" }}>
                                    <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 4 }}>Senior-Level</div>
                                    <div style={{ fontSize: 14, fontWeight: 500, color: "var(--text)" }}>{c.senior_salary}</div>
                                </div>
                            )}
                        </div>

                        {/* Exam & Institutions */}
                        {(c.exam_required || c.top_indian_companies?.length > 0 || c.indian_institutions?.length > 0) && (
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12, marginBottom: 16 }}>
                                {c.exam_required && (
                                    <div>
                                        <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>Exam / Certification</div>
                                        <span className="tag tag-blue">{c.exam_required}</span>
                                    </div>
                                )}
                                {c.top_indian_companies?.length > 0 && (
                                    <div>
                                        <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>Top Indian Companies</div>
                                        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                                            {c.top_indian_companies.map((co, j) => <span key={j} className="tag">{co}</span>)}
                                        </div>
                                    </div>
                                )}
                                {c.indian_institutions?.length > 0 && (
                                    <div>
                                        <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>Recommended Institutions</div>
                                        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                                            {c.indian_institutions.map((inst, j) => <span key={j} className="tag tag-accent">{inst}</span>)}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Skills Row */}
                        <div className="skills-row" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
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
                    <div className="spinner" />
                    <div className="font-display" style={{ fontSize: 22 }}>Comparing careers...</div>
                    <div style={{ color: "var(--text3)", fontSize: 14 }}>AI is analyzing trade-offs for your profile</div>
                </div>
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
            <div className="compare-score-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 32 }}>
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
                        <div className="dimension-bars" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
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
            <div className="pros-cons-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 24 }}>
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
                <div className="roadmap-tabs" style={{ display: "flex", gap: 8, marginBottom: 32, padding: "4px", background: "var(--bg3)", borderRadius: 12, width: "fit-content" }}>
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

// ─── History Page ─────────────────────────────────────────────────────────────
function HistoryPage({ sessions, onLoad, onDelete, onNewAssessment }) {
    if (sessions.length === 0) {
        return (
            <div style={{ maxWidth: 600, margin: "0 auto", padding: "80px 24px", textAlign: "center" }}>
                <div style={{ fontSize: 48, marginBottom: 20 }}>📋</div>
                <h2 className="font-display" style={{ fontSize: 28, fontWeight: 400, marginBottom: 12 }}>No Past Assessments</h2>
                <p style={{ color: "var(--text2)", fontSize: 15, marginBottom: 32, lineHeight: 1.6 }}>
                    You haven't completed any assessments yet. Start one to see your career matches!
                </p>
                <button className="btn-primary" style={{ fontSize: 15, padding: "13px 28px" }} onClick={onNewAssessment}>
                    Start Your First Assessment →
                </button>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: 800, margin: "0 auto", padding: "40px 24px 80px" }}>
            <div className="animate-fade-up" style={{ marginBottom: 32 }}>
                <div style={{ fontSize: 13, color: "var(--accent)", fontWeight: 500, marginBottom: 8 }}>📋 Assessment History</div>
                <h2 className="font-display" style={{ fontSize: 36, fontWeight: 400, marginBottom: 12 }}>Past Results</h2>
                <p style={{ color: "var(--text2)", fontSize: 15 }}>You have {sessions.length} saved assessment{sessions.length !== 1 ? "s" : ""}. Click any to view full results.</p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {sessions.map((session, i) => (
                    <div
                        key={session.id}
                        className={`card animate-fade-up animate-delay-${Math.min(i + 1, 5)}`}
                        style={{ padding: "24px", display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}
                    >
                        <ScoreRing score={session.topScore} size={56} />
                        <div style={{ flex: 1, minWidth: 180 }}>
                            <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 4 }}>{session.topCareer}</div>
                            <div style={{ fontSize: 13, color: "var(--text3)", marginBottom: 6 }}>{session.date}</div>
                            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                                {session.results.career_suggestions.slice(1).map((c, j) => (
                                    <span key={j} className="tag" style={{ fontSize: 11 }}>{c.career} ({c.fit_score}%)</span>
                                ))}
                            </div>
                        </div>
                        <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                            <button className="btn-primary" style={{ fontSize: 13, padding: "8px 18px" }} onClick={() => onLoad(session)}>
                                View Results
                            </button>
                            <button
                                className="btn-ghost"
                                style={{ fontSize: 13, padding: "8px 14px", color: "#c83232" }}
                                onClick={() => onDelete(session.id)}
                                title="Delete this assessment"
                            >
                                🗑
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <div style={{ textAlign: "center", marginTop: 40 }}>
                <button className="btn-primary" style={{ fontSize: 15, padding: "13px 28px" }} onClick={onNewAssessment}>
                    Start New Assessment →
                </button>
            </div>
        </div>
    );
}
