// Gemini API — uses Cloud Function proxy when available, direct API as fallback
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

const MODELS = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-2.0-flash-lite"];

// Rate limiter: max 8 calls per minute (client-side safety net)
const callTimestamps = [];
const RATE_LIMIT = 8;
const RATE_WINDOW = 60000;
const MAX_RETRIES = 3;
const BASE_DELAY = 2000;

// Try Cloud Function proxy first; fall back to direct API if unavailable
async function callModel(prompt, model) {
    // Attempt 1: Cloud Function proxy (API key stays on server)
    try {
        const proxyRes = await fetch("/api/gemini", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ prompt, model }),
        });
        if (proxyRes.ok) {
            const data = await proxyRes.json();
            return data.text || "";
        }
        // If proxy returns 404 (not deployed), fall through to direct API
        if (proxyRes.status !== 404) {
            const err = await proxyRes.json().catch(() => ({}));
            const msg = err?.error?.message || err?.error || `HTTP ${proxyRes.status}`;
            const e = new Error(msg);
            e.status = proxyRes.status;
            throw e;
        }
    } catch (e) {
        // Network error or 404 = proxy not deployed, fall through
        if (e.status && e.status !== 404) throw e;
    }

    // Attempt 2: Direct API call (fallback when Cloud Function is not deployed)
    if (!GEMINI_API_KEY) throw new Error("API configuration missing. Please contact the administrator.");
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;
    const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.7, maxOutputTokens: 16384, responseMimeType: "application/json" },
        }),
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        const msg = err?.error?.message || `HTTP ${res.status}`;
        const e = new Error(msg);
        e.status = res.status;
        throw e;
    }
    const data = await res.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
}

async function fetchWithRetry(prompt, modelIdx = 0, attempt = 0) {
    const model = MODELS[modelIdx] || MODELS[0];
    try {
        return await callModel(prompt, model);
    } catch (err) {
        const isOverloaded = err.status === 429 || err.status === 503 ||
            (err.message && (err.message.toLowerCase().includes("overloaded") ||
                err.message.toLowerCase().includes("high demand") ||
                err.message.toLowerCase().includes("resource exhausted")));

        if (isOverloaded && modelIdx + 1 < MODELS.length) {
            console.warn(`Model ${model} overloaded, trying ${MODELS[modelIdx + 1]}...`);
            return fetchWithRetry(prompt, modelIdx + 1, 0);
        }
        if (isOverloaded && attempt < MAX_RETRIES) {
            const delay = BASE_DELAY * Math.pow(2, attempt) + Math.random() * 1000;
            console.warn(`Retry ${attempt + 1}/${MAX_RETRIES} in ${Math.round(delay / 1000)}s...`);
            await new Promise(r => setTimeout(r, delay));
            return fetchWithRetry(prompt, modelIdx, attempt + 1);
        }
        throw isOverloaded
            ? new Error("Gemini API is experiencing high demand. Please wait 30 seconds and try again.")
            : err;
    }
}

export async function callGemini(prompt) {
    const now = Date.now();
    const recent = callTimestamps.filter(t => now - t < RATE_WINDOW);
    if (recent.length >= RATE_LIMIT) {
        throw new Error("Rate limit reached. Please wait a moment before trying again.");
    }
    callTimestamps.push(now);
    return fetchWithRetry(prompt);
}

export function extractJSON(text) {
    let cleaned = text.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim();
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("No JSON found in response");
    const fixTrailingCommas = (str) => str.replace(/,\s*([\]\}])/g, "$1");
    try {
        return JSON.parse(fixTrailingCommas(match[0]));
    } catch (e) {
        console.error("JSON parse failed. Raw:", text);
        throw e;
    }
}
