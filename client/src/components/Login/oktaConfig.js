import { OktaAuth, toRelativeUrl } from '@okta/okta-auth-js';
import { CONFIG } from '../../runtimeConfig';

let config = {
    clientId: CONFIG.OKTA_CLIENT_ID,
    issuer: CONFIG.OKTA_URL,
    redirectUri: `${window.location.origin}/login/callback`,
    scopes: ['openid', 'profile', 'groups', 'email']
}

// Helpers to remember and restore the page the user wanted:
const ORIGINAL_URI_KEY = 'okta_original_uri';

export function setOriginalUri(uri) {
    sessionStorage.setItem(ORIGINAL_URI_KEY, uri);
}

export function consumeOriginalUri() {
    const v = sessionStorage.getItem(ORIGINAL_URI_KEY);
    sessionStorage.removeItem(ORIGINAL_URI_KEY);
    return v;
}


export function resolveOriginalUri(defaultTo = '/') {
    const originalUri = consumeOriginalUri();
    return toRelativeUrl(originalUri || defaultTo, window.location.origin);
}


export const oktaAuth = new OktaAuth(config);
