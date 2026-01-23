import { OktaAuth } from '@okta/okta-auth-js';
import { CONFIG } from '../../runtimeConfig';

let config = {
    clientId: CONFIG.OKTA_CLIENT_ID,
    issuer: CONFIG.OKTA_URL,
    redirectUri: `${window.location.origin}/login/callback`,
    scopes: ['openid', 'profile', 'groups', 'email']
}
export const oktaAuth = new OktaAuth(config);
