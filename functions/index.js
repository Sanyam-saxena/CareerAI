import { onRequest } from "firebase-functions/v2/https";
import { defineString } from "firebase-functions/params";

const geminiKey = defineString("GEMINI_API_KEY");

const ALLOWED_ORIGINS = [
    "https://careerai-app-2026.web.app",
    "https://careerai-app-2026.firebaseapp.com",
    "http://localhost:5173",
];

const RATE_LIMIT_MAP = new Map();
const RATE_LIMIT = 10;
const RATE_WINDOW = 60000;

function rateLimit(ip) {
    const now = Date.now();
    const timestamps = (RATE_LIMIT_MAP.get(ip) || []).filter(t => now - t < RATE_WINDOW);
    if (timestamps.length >= RATE_LIMIT) return false;
    timestamps.push(now);
    RATE_LIMIT_MAP.set(ip, timestamps);
    return true;
}

export const geminiProxy = onRequest(
    { cors: ALLOWED_ORIGINS, region: "asia-south1", memory: "256MiB", timeoutSeconds: 120 },
    async (req, res) => {
        if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

        const clientIp = req.ip || req.headers["x-forwarded-for"] || "unknown";
        if (!rateLimit(clientIp)) return res.status(429).json({ error: "Rate limit exceeded. Try again in a minute." });

        const { prompt, model } = req.body;
        if (!prompt) return res.status(400).json({ error: "Missing prompt" });

        const modelName = model || "gemini-2.5-flash";
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${geminiKey.value()}`;

        try {
            const response = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: { temperature: 0.7, maxOutputTokens: 16384, responseMimeType: "application/json" },
                }),
            });

            const data = await response.json();
            if (!response.ok) return res.status(response.status).json(data);
            const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
            res.json({ text });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }
);
