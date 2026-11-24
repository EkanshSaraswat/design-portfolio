'use strict';

/**
 * Shared helpers for the contact endpoint.
 *
 * Used by both entry points so validation and abuse protection stay identical:
 *   - backend/server.js  (local Express dev server)
 *   - api/contact.js     (Vercel serverless function)
 */

const LIMITS = {
    name: 80,
    email: 254,
    message: 5000
};

// Deliberately simple: rejects whitespace, missing @, and missing TLD.
// The frontend uses the same pattern, but the server never trusts the client.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// Origins allowed to read cross-origin responses in local development.
// Production is same-origin on Vercel, so no CORS header is needed there.
const LOCAL_ORIGIN_RE = /^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$/i;

function isAllowedOrigin(origin) {
    return typeof origin === 'string' && LOCAL_ORIGIN_RE.test(origin);
}

function corsHeaders(origin) {
    if (!isAllowedOrigin(origin)) return {};
    return {
        'Access-Control-Allow-Origin': origin,
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Max-Age': '600',
        Vary: 'Origin'
    };
}

function asText(value) {
    return typeof value === 'string' ? value.trim() : '';
}

/**
 * Strips CR/LF so a crafted name/email cannot inject extra mail headers.
 */
function singleLine(value) {
    return value.replace(/[\r\n]+/g, ' ').trim();
}

/**
 * @returns {{ ok: true, data: { name: string, email: string, message: string } }
 *          | { ok: false, error: string }}
 */
function validateContact(body) {
    const payload = body && typeof body === 'object' ? body : {};
    const name = asText(payload.name);
    const email = asText(payload.email);
    const message = asText(payload.message);

    if (!name || !email || !message) {
        return { ok: false, error: 'All fields are required.' };
    }
    if (name.length > LIMITS.name) {
        return { ok: false, error: `Name must be ${LIMITS.name} characters or fewer.` };
    }
    if (email.length > LIMITS.email || !EMAIL_RE.test(email)) {
        return { ok: false, error: 'Please enter a valid email address.' };
    }
    if (message.length > LIMITS.message) {
        return { ok: false, error: `Message must be ${LIMITS.message} characters or fewer.` };
    }

    return {
        ok: true,
        data: {
            name: singleLine(name),
            email: singleLine(email),
            message
        }
    };
}

/**
 * Tiny in-memory fixed-window limiter.
 *
 * Serverless instances don't share memory, so this is best-effort protection
 * against bursts, not a global quota. Good enough to stop casual form spam.
 */
function createRateLimiter({ windowMs = 60_000, max = 5 } = {}) {
    const hits = new Map();

    return function isLimited(key) {
        const now = Date.now();

        // Keep the map from growing without bound in long-lived processes.
        if (hits.size > 5000) {
            for (const [k, entry] of hits) {
                if (now > entry.reset) hits.delete(k);
            }
        }

        const entry = hits.get(key);
        if (!entry || now > entry.reset) {
            hits.set(key, { count: 1, reset: now + windowMs });
            return false;
        }

        entry.count += 1;
        return entry.count > max;
    };
}

function clientIp(req) {
    const forwarded = req.headers && req.headers['x-forwarded-for'];
    if (typeof forwarded === 'string' && forwarded.length) {
        return forwarded.split(',')[0].trim();
    }

    return (req.socket && req.socket.remoteAddress) ||
        (req.connection && req.connection.remoteAddress) ||
        'unknown';
}

/**
 * Vercel's Node runtime usually parses JSON bodies, but not every deployment
 * target does. Reading the stream ourselves keeps the API reliable without
 * needing Express middleware in the serverless function.
 */
function readJsonBody(req, { limit = 16 * 1024 } = {}) {
    if (req.body && typeof req.body === 'object') return Promise.resolve(req.body);
    if (typeof req.body === 'string') {
        try {
            return Promise.resolve(JSON.parse(req.body));
        } catch {
            return Promise.reject(Object.assign(new Error('Invalid JSON body.'), { status: 400 }));
        }
    }

    return new Promise((resolve, reject) => {
        const chunks = [];
        let size = 0;
        let tooLarge = false;

        req.on('data', (chunk) => {
            if (tooLarge) return;
            size += chunk.length;
            if (size > limit) {
                tooLarge = true;
                chunks.length = 0;
                return;
            }
            chunks.push(chunk);
        });

        req.on('end', () => {
            if (tooLarge) {
                return reject(Object.assign(new Error('Message is too large.'), { status: 413 }));
            }
            if (!chunks.length) return resolve({});

            try {
                resolve(JSON.parse(Buffer.concat(chunks).toString('utf8')));
            } catch {
                reject(Object.assign(new Error('Invalid JSON body.'), { status: 400 }));
            }
        });

        req.on('error', reject);
    });
}

module.exports = {
    LIMITS,
    EMAIL_RE,
    isAllowedOrigin,
    corsHeaders,
    validateContact,
    createRateLimiter,
    clientIp,
    readJsonBody
};
