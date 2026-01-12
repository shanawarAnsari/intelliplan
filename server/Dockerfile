
# Build arguments
ARG RUNTIME_IMAGE=node:22-alpine

# Use Node.js runtime
FROM ${RUNTIME_IMAGE}

WORKDIR /app

# Copy package files
COPY package*.json ./

# Copy Docker-specific environment file
COPY .env.docker .env

# Install dependencies (production only)
RUN npm install 

# Copy application files
COPY . .

# Expose API port
EXPOSE 8080

# Health check
# HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
#   CMD node -e "require('http').get('http://localhost:8080/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start the server
CMD ["node", "server.js"]
