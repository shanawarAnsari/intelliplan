import { generateAgentApiToken } from '../services/apiTokenGen';

export async function ensureAgentToken() {
    const raw = localStorage.getItem("agentToken");
    let tokenObj = raw ? JSON.parse(raw) : null;

    const nowUtcMs = Date.now(); // current UTC time in ms
    let expired = true;

    if (tokenObj && tokenObj.issued_at && tokenObj.expires_in) {
        const issuedMs = Date.parse(tokenObj.issued_at); // UTC parse
        const expiryMs = issuedMs + tokenObj.expires_in * 1000;
        expired = nowUtcMs >= expiryMs;
    }

    if (expired) {
        tokenObj = await generateAgentApiToken();
        tokenObj.issued_at = new Date().toISOString(); // ensure UTC timestamp
        localStorage.setItem("agentToken", JSON.stringify(tokenObj));
    }

    return tokenObj.access_token;
}