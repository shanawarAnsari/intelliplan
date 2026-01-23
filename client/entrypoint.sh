#!/bin/sh
set -eu

HTML_DIR="/usr/share/nginx/html"
ENV_JS="${HTML_DIR}/env.js"

: "${API_BASE_URL:=}"
: "${OKTA_URL:=}"
: "${OKTA_CLIENT_ID:=}"
: "${AGENT_AD_GROUP_NAME:=}"

cat > "${ENV_JS}" <<EOF
// Generated at container start
window.__ENV__ = {
  API_BASE_URL: "${API_BASE_URL}",
  OKTA_URL: "${OKTA_URL}",
  OKTA_CLIENT_ID: "${OKTA_CLIENT_ID}",
  AGENT_AD_GROUP_NAME: "${AGENT_AD_GROUP_NAME}"
};
EOF

echo "[entrypoint] env.js generated"
exec "$@"