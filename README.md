<p align="center">
  <img src="https://img.shields.io/badge/Google-Solution%20Challenge%202026-4285F4?style=for-the-badge&logo=google&logoColor=white" alt="Google Solution Challenge 2026" />
  <img src="https://img.shields.io/badge/Build%20with-Gemini%20AI-8E75B2?style=for-the-badge&logo=google&logoColor=white" alt="Gemini AI" />
  <img src="https://img.shields.io/badge/Deploy-Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black" alt="Firebase" />
</p>

<h1 align="center">CareerAI — Career Decision & Action Engine</h1>

<p align="center">
  <strong>AI-powered career guidance for Indian students who lack access to professional counseling</strong>
</p>

<p align="center">
  <a href="https://careerai-app-2026.web.app">🌐 Live Demo</a> •
  <a href="#features">Features</a> •
  <a href="#architecture">Architecture</a> •
  <a href="#setup">Setup</a> •
  <a href="#sdg-alignment">SDG Alignment</a>
</p>

---

## 🎯 Problem Statement

**76% of Indian students lack access to professional career guidance** (NASSCOM, 2023). This gap is even wider in Tier-2 and Tier-3 cities, where students choose careers based on peer pressure, parental expectations, or limited awareness — leading to high dropout rates and job dissatisfaction.

Existing solutions (Shiksha, CareerGuide.com) offer generic advice or paid consultations. **None provide personalized AI simulations** that let students *experience* a career before committing to it.

## 💡 Solution

**CareerAI** is a 3-in-1 Career Decision & Action Engine powered by Google's Gemini AI:

1. **Recommend** — AI matches your profile to 3 best-fit careers
2. **Simulate** — Experience career trajectories *before* choosing
3. **Act** — Get a 4-week actionable roadmap with free resources

Unlike traditional tools, CareerAI doesn't just tell you *what* to do — it shows you *what it looks like* and *how to get there*.

---

## <a id="features"></a>✨ Features

### 1. Smart Career Recommendation
- 12-question AI-driven assessment covering education, skills, interests, constraints
- 3 focused career matches with fit scores, salary ranges (₹ LPA), skill gaps
- India-specific data: top companies, required exams, growth outlook

### 2. Career Decision Simulator ⭐ (Hero Feature)
- **Salary progression** — Entry to Peak salary visualization with animated bars
- **Difficulty meter** — Color-coded career difficulty assessment
- **Risk analysis** — 3 key risks with severity badges and mitigation strategies
- **Suitability check** — "Best For" vs "Not Ideal For" personality profiles
- **Day-in-the-life** — AI-generated typical workday description
- **Indian market insight** — Current demand, hiring trends, location data

### 3. Action Roadmap Generator
- **4-week structured plan** with weekly goals and task checklists
- **Skills to learn** with difficulty indicators
- **Free resources** — NPTEL, Coursera, YouTube links
- **After Week 4** — Long-term next steps

### 4. Session History
- Auto-saves assessment results to browser storage
- Load and review past sessions without re-taking the assessment
- Delete individual sessions or clear all

---

## <a id="sdg-alignment"></a>🌍 UN Sustainable Development Goals

<table>
  <tr>
    <td align="center"><strong>SDG 4</strong><br/>Quality Education</td>
    <td>Democratizes career guidance for students who can't afford professional counseling. Provides free, AI-powered, data-driven career advice accessible to anyone with internet.</td>
  </tr>
  <tr>
    <td align="center"><strong>SDG 8</strong><br/>Decent Work & Growth</td>
    <td>Helps students identify careers aligned with their strengths, reducing job dissatisfaction and improving workforce productivity. Includes salary data and growth projections.</td>
  </tr>
  <tr>
    <td align="center"><strong>SDG 10</strong><br/>Reduced Inequalities</td>
    <td>Bridges the career guidance gap between metro and Tier-2/3 city students. AI provides the same quality of advice regardless of location or economic status.</td>
  </tr>
</table>

---

## <a id="architecture"></a>🏗 Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND (React + Vite)               │
│                                                         │
│  LandingPage → ChatPage → ResultsPage → SimulatorPage  │
│                                    └──→ RoadmapPage     │
│                                    └──→ HistoryPage     │
└──────────────────────┬──────────────────────────────────┘
                       │ /api/gemini (POST)
                       ▼
┌─────────────────────────────────────────────────────────┐
│              FIREBASE CLOUD FUNCTION (Node.js)           │
│                                                         │
│  • API key stored server-side (never exposed to client) │
│  • CORS whitelist (only careerai-app-2026.web.app)      │
│  • Rate limiting: 10 requests/min per IP                │
│  • Model fallback: 2.5-flash → 2.0-flash → 2.0-lite   │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│                  GOOGLE GEMINI API                       │
│                                                         │
│  • Structured JSON output (responseMimeType)            │
│  • Temperature: 0.7 (balanced creativity/accuracy)      │
│  • 3 specialized prompts (Analysis, Simulator, Roadmap) │
└─────────────────────────────────────────────────────────┘
```

### Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | React 18 + Vite 6 | UI framework & build tool |
| AI Engine | Google Gemini 2.5 Flash | Career analysis, simulation, roadmap generation |
| Backend | Firebase Cloud Functions | Secure API proxy (hides Gemini key) |
| Hosting | Firebase Hosting | Global CDN, SSL, SPA support |
| Storage | localStorage | Session history persistence |
| Design | Custom CSS ("Amber Ethos") | Warm amber palette, dark mode |

### Project Structure

```
src/
├── App.jsx                     # Page router & state orchestrator
├── main.jsx                    # React entry point
├── index.css                   # Design system & component styles
├── components/
│   ├── LandingPage.jsx         # Hero, SDG banner, features, stats
│   ├── ChatPage.jsx            # 12-question assessment chat
│   ├── ResultsPage.jsx         # 3 career cards with CTAs
│   ├── SimulatorPage.jsx       # Career trajectory simulation
│   ├── ActionRoadmapPage.jsx   # 4-week action plan
│   ├── HistoryPage.jsx         # Past session viewer
│   └── SharedUI.jsx            # ScoreRing, Spinner, LoadingDots
└── utils/
    ├── gemini.js               # API client (proxy in prod, direct in dev)
    ├── prompts.js              # 3 Gemini prompt templates
    └── questions.js            # 12 assessment questions

functions/
├── index.js                    # Cloud Function: Gemini API proxy
└── package.json
```

---

## <a id="setup"></a>🚀 Setup & Run

### Prerequisites
- Node.js 18+
- npm
- A [Google AI Studio](https://aistudio.google.com/) API key

### Local Development

```bash
# 1. Clone the repository
git clone https://github.com/Sanyam-saxena/CareerAI.git
cd CareerAI

# 2. Install dependencies
npm install

# 3. Create environment file
echo "VITE_GEMINI_API_KEY=your_api_key_here" > .env

# 4. Start development server
npm run dev
```

The app runs at `http://localhost:5173`

### Production Deployment (Firebase)

```bash
# 1. Install Firebase CLI
npm install -g firebase-tools

# 2. Login to Firebase
firebase login

# 3. Set Gemini API key as Cloud Function secret
firebase functions:secrets:set GEMINI_API_KEY

# 4. Build and deploy
npm run build
firebase deploy
```

---

## 🔒 Security

| Measure | Implementation |
|---------|---------------|
| API Key Protection | Gemini key stored in Cloud Function, never in client bundle |
| CORS Whitelist | Only `careerai-app-2026.web.app` can call the proxy |
| Rate Limiting | Server: 10 req/min per IP, Client: 8 req/min |
| Model Fallback | Auto-switches models on overload (429 errors) |
| Input Validation | Prompt sanitization in Cloud Function |

---

## 🧠 Google Technologies Used

1. **Google Gemini 2.5 Flash** — Core AI engine for career analysis, simulation, and roadmap generation
2. **Firebase Hosting** — Global CDN deployment with SSL
3. **Firebase Cloud Functions** — Serverless API proxy for secure Gemini access

---

## 👥 Team

| Name | Role |
|------|------|
| Sanyam Saxena | Full Stack Developer & AI Integration |

---

## 📄 License

This project is built for the Google Solution Challenge 2026 — Build with AI (hack2skill).

---

<p align="center">
  <strong>Built with ❤️ using Google Gemini AI</strong><br/>
  <a href="https://careerai-app-2026.web.app">Try CareerAI →</a>
</p>
