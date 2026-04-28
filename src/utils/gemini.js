// Gemini API configuration and helper
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

// Model fallback chain: try primary first, then fallbacks
const MODELS = [
    "gemini-2.5-flash",
    "gemini-2.0-flash",
    "gemini-2.0-flash-lite",
];

function getURL(model) {
    return `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;
}

// Simple rate limiter: max 8 calls per minute
const callTimestamps = [];
const RATE_LIMIT = 8;
const RATE_WINDOW = 60000;

// Retry with exponential backoff + model fallback
const MAX_RETRIES = 3;
const BASE_DELAY = 2000; // 2 seconds

async function fetchWithRetry(prompt, modelIdx = 0, attempt = 0) {
    const model = MODELS[modelIdx] || MODELS[0];
    const url = getURL(model);

    const res = await fetch(url, {
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

    if (res.ok) {
        const data = await res.json();
        return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    }

    const err = await res.json().catch(() => ({}));
    const errMsg = err?.error?.message || `HTTP ${res.status}`;
    const isOverloaded = res.status === 429 || res.status === 503 ||
        errMsg.toLowerCase().includes("overloaded") ||
        errMsg.toLowerCase().includes("high demand") ||
        errMsg.toLowerCase().includes("resource exhausted");

    // If overloaded, try next model in fallback chain
    if (isOverloaded && modelIdx + 1 < MODELS.length) {
        console.warn(`Model ${model} overloaded, falling back to ${MODELS[modelIdx + 1]}...`);
        return fetchWithRetry(prompt, modelIdx + 1, 0);
    }

    // If overloaded and we have retries left, wait and retry
    if (isOverloaded && attempt < MAX_RETRIES) {
        const delay = BASE_DELAY * Math.pow(2, attempt) + Math.random() * 1000;
        console.warn(`API overloaded (attempt ${attempt + 1}/${MAX_RETRIES}). Retrying in ${Math.round(delay / 1000)}s...`);
        await new Promise(r => setTimeout(r, delay));
        return fetchWithRetry(prompt, modelIdx, attempt + 1);
    }

    throw new Error(isOverloaded
        ? "Gemini API is currently experiencing high demand. Please wait 30 seconds and try again."
        : errMsg
    );
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
    let jsonStr = match[0];
    const fixTrailingCommas = (str) => str.replace(/,\s*([\]\}])/g, "$1");
    try {
        return JSON.parse(fixTrailingCommas(jsonStr));
    } catch (e) {
        console.error("JSON parse failed. Raw:", text);
        throw e;
    }
}
