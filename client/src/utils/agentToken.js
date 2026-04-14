// utils/agentToken.js
import { generateAgentApiToken } from '../services/apiTokenGen';

let inflightRefresh = null; // prevent concurrent refreshes

export async function ensureAgentToken() {
    const nowUtcMs = Date.now();
    const SKEW_MS = 60 * 1000; // refresh 60s before expiry

    // Parse current token (if any)
    const raw = localStorage.getItem('agentToken');
    let tokenObj = raw ? safeParseJSON(raw) : null;

    // Helper: check if token is expired (with skew)
    const isExpired = (t) => {
        if (!t || !t.issued_at || !t.expires_in) return true;
        const issuedMs = Date.parse(t.issued_at); // UTC
        if (Number.isNaN(issuedMs)) return true;
        const expiryMs = issuedMs + Number(t.expires_in) * 1000;
        return nowUtcMs >= (expiryMs - SKEW_MS);
    };

    if (!isExpired(tokenObj)) {
        return tokenObj.access_token;
    }

    // If a refresh is already in progress, await it
    if (inflightRefresh) {
        try {
            return await inflightRefresh;
        } catch (e) {
            // fall through to attempt a fresh refresh
        }
    }

    inflightRefresh = (async () => {
        const fresh = await generateAgentApiToken();
        // Normalize shape just in case
        const normalized = {
            ...fresh,
            issued_at: new Date().toISOString(), // ensure UTC timestamp
        };
        localStorage.setItem('agentToken', JSON.stringify(normalized));
        return normalized.access_token;
    })();

    try {
        const accessToken = await inflightRefresh;
        return accessToken;
    } finally {
        inflightRefresh = null; // clear after completion
    }
}

function safeParseJSON(str) {
    try {
        return JSON.parse(str);
    } catch {
        return null;
    }
}