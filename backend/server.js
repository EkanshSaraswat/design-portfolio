const express = require("express");
const cors = require("cors");
const { Resend } = require("resend");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const {
    isAllowedOrigin,
    validateContact,
    createRateLimiter,
    clientIp
} = require("../lib/contact");

const app = express();
const PORT = process.env.PORT || 5000;

// Resend throws when constructed without a key, so only build it when configured.
// The endpoint returns a clear 503 instead of the process crashing on startup.
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;

// Same configurable sender/recipient as the Vercel function.
const CONTACT_FROM_EMAIL = process.env.CONTACT_FROM_EMAIL || "Portfolio <onboarding@resend.dev>";
const CONTACT_TO_EMAIL = process.env.CONTACT_TO_EMAIL || "ekanshsaraswat1234@gmail.com";

// Rate limit: 5 messages per minute per IP.
const isRateLimited = createRateLimiter({ windowMs: 60_000, max: 5 });

app.disable("x-powered-by");
app.set("trust proxy", 1);

// Local dev runs the static site on :3000 and this API on :5000, so only
// localhost origins get CORS headers. Production uses the Vercel function.
app.use(cors({
    origin(origin, callback) {
        callback(null, !origin || isAllowedOrigin(origin));
    },
    methods: ["POST", "OPTIONS"]
}));
app.use(express.json({ limit: "16kb" }));

// Test route
app.get("/", (req, res) => {
    res.send("Portfolio Backend is running!");
});

// Contact form API
app.post("/api/contact", async (req, res) => {
    if (isRateLimited(clientIp(req))) {
        res.set("Retry-After", "60");
        return res.status(429).json({
            success: false,
            message: "Too many messages. Please try again in a minute."
        });
    }

    const { ok, error, data } = validateContact(req.body);
    if (!ok) {
        return res.status(400).json({ success: false, message: error });
    }

    if (!resend) {
        console.error("RESEND_API_KEY is not set — cannot send email. Add it to backend/.env.");
        return res.status(503).json({
            success: false,
            message: "Email service is not configured."
        });
    }

    try {
        const { data: sent, error: sendError } = await resend.emails.send({
            from: CONTACT_FROM_EMAIL,
            to: [CONTACT_TO_EMAIL],
            replyTo: data.email,
            subject: `New Portfolio Message from ${data.name}`,
            text: `Name: ${data.name}\nEmail: ${data.email}\n\nMessage:\n${data.message}`
        });

        if (sendError) {
            console.error("Resend Error:", sendError);
            return res.status(502).json({
                success: false,
                message: "Failed to send email. Please try again later."
            });
        }

        return res.status(200).json({
            success: true,
            message: "Email sent successfully!",
            id: sent?.id
        });
    } catch (err) {
        console.error("Server Error:", err);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
});

// Keep malformed/oversized JSON from returning Express' default HTML page.
app.use((err, req, res, next) => {
    if (err && err.type === "entity.too.large") {
        return res.status(413).json({ success: false, message: "Message is too large." });
    }
    if (err instanceof SyntaxError) {
        return res.status(400).json({ success: false, message: "Invalid JSON body." });
    }
    console.error("Unhandled Error:", err);
    return res.status(500).json({ success: false, message: "Internal server error" });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    if (!resend) {
        console.warn("RESEND_API_KEY is not set. Copy backend/.env.example to backend/.env and add your key.");
    }
});
