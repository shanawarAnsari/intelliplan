# ---------- Stage 1: Build React app ----------
FROM node:22-alpine AS build
WORKDIR /app

# Copy dependency manifests first to leverage Docker layer caching
COPY package*.json ./

# Install deps; use npm ci if lockfile exists, else npm install
# (remove the second part if you always have package-lock.json)
RUN --mount=type=cache,target=/root/.npm \
    (npm ci --no-audit --no-fund || npm install --no-audit --no-fund)

# Copy the rest of the source
COPY . .

# Build the production bundle
RUN npm run build

# ---------- Stage 2: Serve with Nginx ----------
FROM nginx:alpine

# Use our SPA-friendly server block
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy build output to the default Nginx web root
COPY --from=build /app/build/ /usr/share/nginx/html/

# Copy your entrypoint script that generates /usr/share/nginx/html/env.js
COPY entrypoint.sh /entrypoint.sh

# Ensure executable and normalize line endings (prevents /bin/sh^M when edited on Windows)
RUN chmod +x /entrypoint.sh && sed -i 's/\r$//' /entrypoint.sh

# Expose HTTP
EXPOSE 80

# Use your entrypoint to generate env.js, then start nginx (CMD)
ENTRYPOINT ["/entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]