const { Resend } = require("resend");
const {
    corsHeaders,
    validateContact,
    createRateLimiter,
    clientIp,
    readJsonBody
} = require("../lib/contact");

// Best-effort, per-instance rate limit (serverless instances don't share memory).
const isRateLimited = createRateLimiter({ windowMs: 60_000, max: 5 });

// Configure these in Vercel → Settings → Environment Variables.
// The defaults keep local/test setups working, but production should use a
// verified Resend domain and the inbox that should receive direct messages.
const CONTACT_FROM_EMAIL = process.env.CONTACT_FROM_EMAIL || "Portfolio <onboarding@resend.dev>";
const CONTACT_TO_EMAIL = process.env.CONTACT_TO_EMAIL || "ekanshsaraswat1234@gmail.com";

module.exports = async (req, res) => {
    // Same-origin in production, so these headers are only emitted for
    // localhost origins (used when testing the static site against the API).
    const headers = corsHeaders(req.headers.origin);
    for (const [key, value] of Object.entries(headers)) {
        res.setHeader(key, value);
    }

    // Handle preflight
    if (req.method === "OPTIONS") return res.status(204).end();

    // Only allow POST
    if (req.method !== "POST") {
        res.setHeader("Allow", "POST, OPTIONS");
        return res.status(405).json({ success: false, message: "Method Not Allowed" });
    }

    if (isRateLimited(clientIp(req))) {
        res.setHeader("Retry-After", "60");
        return res.status(429).json({
            success: false,
            message: "Too many messages. Please try again in a minute."
        });
    }

    let body;
    try {
        body = await readJsonBody(req);
    } catch (err) {
        return res.status(err.status || 400).json({
            success: false,
            message: err.message || "Invalid request body."
        });
    }

    const { ok, error, data } = validateContact(body);
    if (!ok) {
        return res.status(400).json({ success: false, message: error });
    }

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
        console.error("RESEND_API_KEY is not set — cannot send email.");
        return res.status(503).json({
            success: false,
            message: "Email service is not configured."
        });
    }

    try {
        const resend = new Resend(apiKey);

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
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};
