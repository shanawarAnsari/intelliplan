# Build arguments
ARG RUNTIME_IMAGE=node:22-alpine

# Use Node.js runtime
FROM ${RUNTIME_IMAGE}

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install 

# Copy application files
COPY . .

# Expose API port
EXPOSE 80

# Start the server
CMD ["node", "server.js"]
