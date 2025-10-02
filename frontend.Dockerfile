# Dockerfile for CloudPulse Monitor Frontend
FROM node:22-alpine AS builder

# Install Python and build dependencies for native modules
RUN apk add --no-cache python3 py3-pip build-base

# Set working directory
WORKDIR /app

# Copy package files first for better layer caching
COPY frontend/package*.json ./

# Install all dependencies to generate lock file
RUN npm ci

# Copy configuration files needed for build
COPY frontend/vite.config.ts ./
COPY frontend/index.html ./

# Copy source code
COPY frontend/src ./src

# Build the application (skip type-check for Docker)
RUN npm run build-only

# Production stage with Node.js static server
FROM node:22-alpine AS production

# Set working directory
WORKDIR /app

# Copy built assets from builder stage
COPY --from=builder /app/dist ./dist

# Install a simple static server
RUN npm install -g serve

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:80/ || exit 1

# Start the static server
CMD ["serve", "-s", "dist", "-l", "80"]