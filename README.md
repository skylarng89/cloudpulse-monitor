# CloudPulse Monitor

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)]()
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Java](https://img.shields.io/badge/Java-25-orange)]()
[![Vue](https://img.shields.io/badge/Vue-3.5-42b883)]()
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-4.0-6db33f)]()

A modern, lightweight uptime monitoring solution for tracking HTTP/HTTPS endpoints, TCP ports, and ICMP ping targets. CloudPulse provides real-time monitoring with a beautiful responsive dashboard, detailed analytics, and incident tracking.

---

## Table of Contents

- [Project Overview](#project-overview)
- [Key Features](#key-features)
- [Technology Stack](#technology-stack)
- [Prerequisites](#prerequisites)
- [Local Development Setup](#local-development-setup)
- [Configuration](#configuration)
- [Production Deployment Guide](#production-deployment-guide)
- [API Documentation](#api-documentation)
- [Testing](#testing)
- [Troubleshooting & Common Issues](#troubleshooting--common-issues)
- [Contributing Guidelines](#contributing-guidelines)
- [License](#license)
- [Contact/Support](#contactsupport)

---

## Project Overview

CloudPulse Monitor solves the need for a self-hosted, lightweight uptime monitoring solution that provides:

- **Real-time visibility** into service health across HTTP, TCP, and ICMP endpoints
- **Historical tracking** of response times and availability
- **Incident management** with detailed failure logs
- **Automated scheduling** using Java virtual threads for massive parallelism
- **Modern UI** with dark mode, responsive design, and real-time updates

**Primary Value Proposition:** Deploy a complete uptime monitoring solution in minutes with zero external dependencies (except PostgreSQL). Built for developers who need reliability insights without the complexity of enterprise monitoring platforms.

---

## Key Features

- **Multi-Protocol Monitoring**
  - HTTP/HTTPS endpoint checks with status code validation
  - TCP port connectivity tests
  - ICMP ping availability checks

- **Real-time Dashboard**
  - Live status updates with auto-refresh (configurable intervals)
  - Response time metrics and uptime statistics
  - Color-coded status indicators (UP, DOWN, UNKNOWN)

- **Monitor Management**
  - Create, update, and delete monitors
  - Bulk operations (multi-select delete)
  - Duplicate prevention (unique constraint on URL + type)
  - Configurable check intervals (30s to 5 min)

- **Reports & Analytics**
  - Uptime trend charts (1 hour to 30 days)
  - Response time visualization
  - Incident history and tracking

- **Modern Architecture**
  - Dark mode with system preference detection
  - Responsive design (mobile, tablet, desktop)
  - Collapsible sidebar navigation
  - Toast notifications for all actions

- **Enterprise-Ready Backend**
  - Virtual threads for high-concurrency checks
  - Circuit breaker and bulkhead patterns (Resilience4j)
  - Flyway database migrations
  - Actuator health endpoints

---

## Technology Stack

### Backend

| Component | Technology | Version |
|-----------|------------|---------|
| Runtime | Java (OpenJDK Temurin) | 25 |
| Framework | Spring Boot | 4.0.5 |
| Database | PostgreSQL | 15+ |
| ORM | Spring Data JPA / Hibernate | - |
| Migrations | Flyway | - |
| Resilience | Resilience4j | 2.2.0 |
| Build Tool | Gradle | 8.x |
| Logging | Logstash Logback Encoder | 7.4 |

### Frontend

| Component | Technology | Version |
|-----------|------------|---------|
| Framework | Vue.js | 3.5 |
| Language | TypeScript | 5.1 |
| Styling | Tailwind CSS | 4.2 |
| Build Tool | Vite | 8.0 |
| State Management | Pinia | 3.0 |
| Routing | Vue Router | 4.2 |
| Charts | Chart.js | 4.3 |
| Package Manager | pnpm | 9.x |

### Infrastructure

| Component | Technology |
|-----------|------------|
| Container Runtime | Docker |
| Orchestration | Docker Compose |
| Web Server (Frontend) | serve (static file server) |

---

## Prerequisites

### Required Software

| Software | Minimum Version | Verification Command |
|----------|-----------------|----------------------|
| Java JDK | 25 | `java --version` |
| Node.js | 22 | `node --version` |
| pnpm | 9.x | `pnpm --version` |
| PostgreSQL | 15 | `psql --version` |
| Docker | 24.x | `docker --version` |
| Docker Compose | 2.x | `docker compose version` |

### Optional Software

| Software | Purpose |
|----------|---------|
| Git | Version control |
| curl | API testing |
| jq | JSON processing |

### System Requirements

- **CPU:** 2 cores minimum, 4+ recommended
- **RAM:** 2GB minimum, 4GB+ recommended
- **Disk:** 1GB for application, additional for database

---

## Local Development Setup

### Step 1: Clone the Repository

```bash
git clone <repository-url>
cd cloudpulse-monitor
```

### Step 2: Start PostgreSQL Database

Using Docker (recommended):

```bash
docker run -d \
  --name cloudpulse-db \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=cloudpulse \
  -p 5432:5432 \
  postgres:15-alpine
```

Or use an existing PostgreSQL instance and note the connection details.

### Step 3: Configure Environment Variables

Create `.env` file from the example:

```bash
cp .env.example .env
```

Edit `.env` with your database credentials:

```bash
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=cloudpulse
DB_USER=postgres
DB_PASS=postgres

# Application
SPRING_PROFILES_ACTIVE=dev
LOG_LEVEL=debug
```

### Step 4: Install Backend Dependencies & Run

```bash
cd backend

# Build the application (downloads dependencies)
./gradlew build -x test

# Run database migrations and start the application
./gradlew bootRun
```

Expected output:
```
... Spring Boot application starting
... Flyway migration completed successfully
... Tomcat started on port(s): 8080 (http)
... Started BackendApplication in 2.5 seconds
```

Verify backend is running:
```bash
curl http://localhost:8080/actuator/health
# Expected: {"status":"UP",...}
```

### Step 5: Install Frontend Dependencies & Run

Open a new terminal:

```bash
cd frontend

# Install dependencies
pnpm install

# Start development server
pnpm dev
```

Expected output:
```
VITE v8.0.3  ready in 172 ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

### Step 6: Access the Application

Open your browser to: **http://localhost:5173**

The frontend proxies API requests to the backend at `http://localhost:8080`.

### Quick Start with Docker Compose

Alternatively, run the entire stack with Docker Compose:

```bash
# Build and start all services
docker compose up -d

# View logs
docker compose logs -f

# Stop all services
docker compose down
```

Access the application at: **http://localhost:3001**

---

## Configuration

### Environment Variables

#### Backend Configuration

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `DB_HOST` | PostgreSQL host | `localhost` | Yes |
| `DB_PORT` | PostgreSQL port | `5432` | Yes |
| `DB_NAME` | Database name | `cloudpulse` | Yes |
| `DB_USER` | Database username | `postgres` | Yes |
| `DB_PASS` | Database password | `postgres` | Yes |
| `SPRING_PROFILES_ACTIVE` | Spring profile (`dev`, `prod`) | - | No |
| `SERVER_PORT` | Backend server port | `8080` | No |

#### Frontend Configuration

The frontend uses Vite's proxy configuration for local development. In production, configure your reverse proxy to route `/api` requests to the backend.

Configuration file: `frontend/vite.config.ts`

```typescript
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:8080',
      changeOrigin: true
    }
  }
}
```

### Application Configuration Files

| File | Purpose |
|------|---------|
| `backend/src/main/resources/application.yml` | Main Spring Boot configuration |
| `backend/src/main/resources/application-test.yml` | Test environment configuration |
| `frontend/vite.config.ts` | Vite build and dev server configuration |

### Database Configuration

The application uses Flyway for database migrations. Migrations are located at:

```
backend/src/main/resources/db/migration/
├── V1__Initial_Schema.sql
└── V2__Idempotency.sql
```

Flyway runs automatically on application startup when `spring.flyway.enabled=true` (default).

### Resilience4j Configuration

Default circuit breaker and bulkhead settings (in `application.yml`):

```yaml
resilience4j:
  circuitbreaker:
    configs:
      default:
        slidingWindowSize: 10
        failureRateThreshold: 50
        waitDurationInOpenState: 5s
  bulkhead:
    configs:
      default:
        maxConcurrentCalls: 100
```

---

## Production Deployment Guide

### Target Environment

This guide assumes deployment to a Docker-based environment (Docker Compose, Kubernetes, or cloud container services).

### Build Production Artifacts

#### Backend JAR

```bash
cd backend
./gradlew build -x test

# Output: backend/build/libs/backend-0.0.1-SNAPSHOT.jar
```

#### Frontend Static Files

```bash
cd frontend
pnpm build-only

# Output: frontend/dist/
```

### Docker Build

Build both images:

```bash
# Backend
docker build -t cloudpulse-backend:latest -f Dockerfile .

# Frontend
docker build -t cloudpulse-frontend:latest -f frontend.Dockerfile .
```

### Production Environment Variables

Create a production `.env` file:

```bash
# Database (use strong passwords!)
DB_HOST=your-postgres-host
DB_PORT=5432
DB_NAME=cloudpulse
DB_USER=cloudpulse_user
DB_PASS=<strong-secure-password>

# Application
SPRING_PROFILES_ACTIVE=prod
SERVER_PORT=8080

# Security (configure appropriately)
# SPRING_SECURITY_USER_NAME=admin
# SPRING_SECURITY_USER_PASSWORD=<secure-password>
```

### Deploy with Docker Compose

```bash
# Start services
docker compose -f docker-compose.yml up -d

# Check health
docker compose ps
curl http://localhost:8080/actuator/health

# View logs
docker compose logs -f cloudpulse-backend
```

### Health Check Endpoints

| Service | Endpoint | Expected Response |
|---------|----------|-------------------|
| Backend | `GET /actuator/health` | `{"status":"UP"}` |
| Frontend | `GET /` | HTTP 200 |

### Database Migration in Production

Flyway migrations run automatically on backend startup. For manual migration control:

```bash
# Run migrations only (dry-run to verify)
# Use Flyway CLI or Spring Boot with flyway repair/migrate commands
```

### Scaling Considerations

1. **Horizontal Scaling:** The backend is stateless; scale behind a load balancer
2. **Database:** Use managed PostgreSQL (RDS, Cloud SQL, etc.) with connection pooling
3. **Frontend:** Serve static files from CDN or object storage (S3, GCS)
4. **Scheduler:** Only one instance should run the scheduler; use leader election or dedicated scheduler instance

---

## API Documentation

### Base URL

- **Development:** `http://localhost:8080/api`
- **Production:** `https://your-domain.com/api`

### Authentication

Currently, the API is open. Future versions will include authentication.

### Endpoints

#### Monitors

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/monitors` | List all monitors |
| `GET` | `/api/monitors/{id}` | Get single monitor |
| `POST` | `/api/monitors` | Create monitor |
| `PUT` | `/api/monitors/{id}` | Update monitor |
| `DELETE` | `/api/monitors/{id}` | Delete monitor |
| `GET` | `/api/monitors/{id}/checks` | Get monitor check history |

#### Monitoring Operations

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/scheduler/run/{id}` | Run immediate check for monitor |
| `POST` | `/api/monitors/check-all` | Check all monitors |
| `GET` | `/api/scheduler/status` | Get scheduler status |

#### System

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/actuator/health` | Health check |
| `GET` | `/actuator/info` | Application info |

### Request/Response Examples

#### Create Monitor

**Request:**
```bash
curl -X POST http://localhost:8080/api/monitors \
  -H "Content-Type: application/json" \
  -H "X-Idempotency-Key: unique-request-id" \
  -d '{
    "name": "Google DNS",
    "url": "8.8.8.8",
    "type": "PING",
    "intervalSeconds": 60
  }'
```

**Response:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Google DNS",
  "url": "8.8.8.8",
  "type": "PING",
  "intervalSeconds": 60,
  "status": "UNKNOWN",
  "createdAt": "2026-03-29T10:00:00Z",
  "updatedAt": "2026-03-29T10:00:00Z"
}
```

#### Get Monitor Checks

**Request:**
```bash
curl http://localhost:8080/api/monitors/550e8400-e29b-41d4-a716-446655440000/checks?limit=10
```

**Response:**
```json
[
  {
    "id": "...",
    "monitorId": "550e8400-e29b-41d4-a716-446655440000",
    "checkedAt": "2026-03-29T10:05:00Z",
    "responseTimeMs": 15,
    "statusCode": null,
    "status": "UP",
    "errorMessage": null
  }
]
```

### Monitor Types

| Type | URL Format | Example |
|------|------------|---------|
| `HTTP` | Full URL with protocol | `https://api.example.com/health` |
| `HTTPS` | Full URL with protocol | `https://secure.example.com` |
| `PING` | Hostname or IP | `google.com` or `8.8.8.8` |
| `TCP` | Host:Port | `db.example.com:5432` |

### Idempotency

POST requests support idempotency via the `X-Idempotency-Key` header. Include a unique key to prevent duplicate operations on retry.

---

## Testing

### Backend Tests

```bash
cd backend

# Run all tests
./gradlew test

# Run with verbose output
./gradlew test --info

# Generate coverage report (if configured)
./gradlew jacocoTestReport
```

Test output: `backend/build/reports/tests/test/index.html`

### Frontend Tests

Currently, the frontend does not have automated tests configured. Future versions will include:

- Vitest for unit tests
- Playwright for E2E tests

### Manual Testing

1. **Health Check:**
   ```bash
   curl http://localhost:8080/actuator/health
   ```

2. **Create Test Monitor:**
   ```bash
   curl -X POST http://localhost:8080/api/monitors \
     -H "Content-Type: application/json" \
     -d '{"name":"Test","url":"https://httpstat.us/200","type":"HTTP","intervalSeconds":60}'
   ```

3. **Verify UI:** Open http://localhost:5173 and confirm the monitor appears

---

## Troubleshooting & Common Issues

### Port Already in Use

**Symptom:** `Port 8080 already in use` or `Port 5173 already in use`

**Solution:**
```bash
# Find process using port
lsof -i :8080
# or
netstat -tulpn | grep 8080

# Kill the process
kill -9 <PID>
```

### Database Connection Failed

**Symptom:** `Unable to open JDBC Connection` or `Connection refused`

**Solution:**
1. Verify PostgreSQL is running: `docker ps | grep postgres`
2. Check credentials in `.env` match database
3. Verify database exists: `psql -U postgres -c "\l"`
4. Create database if missing:
   ```bash
   psql -U postgres -c "CREATE DATABASE cloudpulse;"
   ```

### Flyway Migration Failed

**Symptom:** `Flyway validation failed` or `Migration checksum mismatch`

**Solution:**
```bash
# Reset Flyway (development only - loses data)
# Connect to database and run:
DELETE FROM flyway_schema_history;

# Restart application to re-run migrations
```

### Frontend Can't Reach Backend

**Symptom:** `Network Error` or `CORS error` in browser console

**Solution:**
1. Verify backend is running: `curl http://localhost:8080/actuator/health`
2. Check Vite proxy config in `frontend/vite.config.ts`
3. Ensure you're accessing via `http://localhost:5173` (not file://)

### Build Failures

**Symptom:** `vue-tsc` errors or `TypeScript` errors

**Solution:**
```bash
# Use build-only to skip type checking
cd frontend
pnpm build-only

# Or fix type issues
pnpm type-check
```

### Docker Issues

**Symptom:** `Cannot connect to Docker daemon`

**Solution:**
```bash
# Start Docker service
sudo systemctl start docker

# Add user to docker group (Linux)
sudo usermod -aG docker $USER
# Log out and back in
```

---

## Contributing Guidelines

We welcome contributions! Please follow these steps:

1. **Fork** the repository
2. **Create a feature branch:** `git checkout -b feature/my-feature`
3. **Make your changes** following the existing code style
4. **Run tests:** `./gradlew test` (backend) and verify frontend builds
5. **Commit changes:** `git commit -m "Add my feature"`
6. **Push to branch:** `git push origin feature/my-feature`
7. **Open a Pull Request**

### Code Style

- **Backend:** Follow Google Java Style Guide
- **Frontend:** ESLint + Prettier (run `pnpm format` before committing)

### Commit Message Format

```
<type>: <subject>

[optional body]

Types: feat, fix, docs, style, refactor, test, chore
```

---

## License

MIT License

Copyright (c) 2026 CloudPulse

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

---

## Contact/Support

- **GitHub Issues:** [Project Issues Page](https://github.com/your-org/cloudpulse-monitor/issues)
- **Documentation:** This README and inline code documentation
- **Security Issues:** Please report privately via GitHub Security Advisories

---

Built with ❤️ using Spring Boot, Vue.js, and Tailwind CSS
