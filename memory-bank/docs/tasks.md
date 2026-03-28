# Tasks & Migration Plan

Legend: 🔴 Not Started · 🟡 In Progress · ✅ Completed

## Phase 6: E2E Testing
- [x] ✅ Set up test infrastructure (MockMvc, test profile)
- [x] ✅ Create MonitorController E2E tests (15 tests)
- [x] ✅ Create NetworkCheckService unit tests (10 tests)
- [x] ✅ Fix Jackson JavaTimeModule serialization issue
- [ ] 🟡 Add tests for other controllers/endpoints
- [ ] 🟡 Add integration tests for scheduling/check execution logic
- [ ] 🟡 Test security configuration
- [ ] 🔴 Add tests for idempotency key cleanup/expiry
- [ ] 🔴 Add tests for concurrent request handling

## Test Coverage Status
| Component | Tests | Status |
|-----------|-------|--------|
| MonitorController | 15 | ✅ Passing |
| NetworkCheckService | 10 | ✅ Passing |
| MonitorRepository | - | 🔴 Not started |
| Scheduling Logic | - | 🔴 Not started |
| Security Config | - | 🔴 Not started |

## Phase 1: Monorepo & Setup (Planning)
- [x] ✅ Initialize Memory Bank.
- [x] ✅ Configure PNPM workspace at the root level (`pnpm-workspace.yaml`).
- [x] ✅ Migrate frontend to use PNPM (remove package-lock.json / yarn.lock).
- [x] ✅ Setup base Docker and Docker Compose files for the new architecture.

## Phase 2: Spring Boot Foundation
- [x] ✅ Initialize Spring Boot project in the `backend/` directory.
- [x] ✅ Configure Gradle/Maven build to coexist gracefully in the monorepo.
- [x] ✅ Apply core security dependencies (Spring Security, strict CORS, TLS 1.3 enforcement).
- [x] ✅ Setup structured JSON logging (Logback setup complying with observability rules).
- [x] ✅ Choose and implement Database connectivity (JPA / Hibernate / JDBC Template) and setup migrations (Flyway / Liquibase).

## Phase 3: Core Application Logic Migration
- [x] ✅ Migrate domain models (Monitors, Checks).
- [x] ✅ Implement network checking logic (HTTP, TCP, Ping) using optimal Java I/O (Virtual threads recommended).
- [x] ✅ Implement the scheduler (Spring `@Scheduled` or Quartz) mapped to cron intervals.
- [x] ✅ Integrate resilience patterns (Resilience4j) for network checks: circuit breakers, bulkheads, timeouts.

## Phase 4: API & Security Compliance
- [x] ✅ Replicate the REST APIs originally in Fastify.
- [x] ✅ Implement Strict Input Validation to prevent injection (Jakarta Validation).
- [x] ✅ Implement Idempotency constraints on POST/PUT endpoints where applicable.
- [x] ✅ Ensure Zero-Trust principles are applied (Authentication scopes if needed, though originally no-auth implies we might need to add lightweight auth or RBAC as per guide).

## Phase 5: CI/CD & Delivery
- [x] ✅ Create multi-stage `Dockerfile` for the Spring Boot backend.
- [x] ✅ Update `docker-compose.yml` to orchestrate Vue Frontend, Spring backend, and optionally PostgreSQL.
- [x] ✅ Add automated checks (SAST, SCA) integrations to the build pipeline.
