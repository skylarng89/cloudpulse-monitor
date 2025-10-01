# Multi-stage Dockerfile for CloudPulse Monitor Backend
FROM node:22-alpine AS builder

# Install Python and build dependencies for native modules
RUN apk add --no-cache python3 py3-pip build-base

# Set working directory
WORKDIR /app

# Copy package files first for better layer caching
COPY backend/package*.json ./

# Install all dependencies (including dev) to generate lock file
RUN npm ci

# Copy source code
COPY backend/src ./src

# Production stage
FROM node:22-alpine AS production

# Install Python and build dependencies for native modules
RUN apk add --no-cache python3 py3-pip build-base

# Create app directory
WORKDIR /app

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Copy package files and lock file
COPY backend/package*.json ./
COPY --from=builder /app/node_modules ./node_modules

# Copy source code from builder stage
COPY --from=builder /app/src ./src

# Create data directory for SQLite
RUN mkdir -p data && chown -R nextjs:nodejs /app

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "const http=require('http');const req=http.request({hostname:'localhost',port:3000,path:'/'},res=>{process.exit(res.statusCode===200?0:1)});req.on('error',()=>process.exit(1));req.end();"

# Start the application
CMD ["node", "src/app.js"]