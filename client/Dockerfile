# Build arguments
ARG BUILD_IMAGE=node:22-alpine
ARG RUNTIME_IMAGE=nginx:alpine

# Stage 1: Build the React application
FROM ${BUILD_IMAGE} AS build

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Copy Docker-specific environment file
COPY .env.docker .env

# Build the application
RUN npm run build

# Stage 2: Serve with Nginx
FROM ${RUNTIME_IMAGE} AS runner

# Copy built files from build stage
COPY --from=build /app/build /usr/share/nginx/html

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
