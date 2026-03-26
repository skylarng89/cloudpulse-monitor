# Dockerfile for CloudPulse Monitor Frontend
FROM node:22-alpine AS builder

# Install Python and build dependencies, plus enable pnpm
RUN apk add --no-cache python3 py3-pip build-base
RUN corepack enable && corepack prepare pnpm@latest --activate

# Set working directory
WORKDIR /app

# Copy root configurations
COPY package.json pnpm-workspace.yaml ./
COPY frontend/package.json ./frontend/

# Copy lockfile if it exists
COPY pnpm-lock.yaml* ./

# Install dependencies for the workspace
RUN pnpm install

# Copy source code
COPY frontend ./frontend

# Build the application
WORKDIR /app/frontend
RUN pnpm run build-only

# Production stage
FROM node:22-alpine AS production
WORKDIR /app

# Copy built assets from builder stage
COPY --from=builder /app/frontend/dist ./dist

# Install a simple static server
RUN npm install -g serve

# Create non-root user
RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001
USER nextjs

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:80/ || exit 1

# Start the static server
CMD ["serve", "-s", "dist", "-l", "80"]