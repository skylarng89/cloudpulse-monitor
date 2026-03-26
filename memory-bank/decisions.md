# Architectural Decisions

## Date: 2026-03-26

**Decision**: Migrate backend from Node.js (Fastify) to Java Spring Boot 4.0.x using Java 25 (Latest LTS).
**Rationale**: Take advantage of Spring Boot's robust enterprise ecosystem, static typing, and mature threading/concurrency models suitable for scheduling network monitor pingers on a massive scale, leveraging Java 25's virtual threads.

**Decision**: Switch package management to `pnpm`.
**Rationale**: `pnpm` offers faster, more efficient monorepo support through symlinked node_modules, reducing disk space and install times.

**Decision**: Strict adherence to the Engineering Master Guide (2026 Edition).
**Rationale**: Ensures enterprise-grade security (Zero Trust, TLS 1.3), resilience (Circuit breakers, retries), and robust observability (OpenTelemetry, JSON structured logging).

**Pending Decision**: Database selection.
*Context*: Currently using SQLite. For production-scale Spring Boot apps requiring strict ACID compliance, race condition prevention (`SELECT FOR UPDATE`), and concurrent access, PostgreSQL is highly recommended by the engineering guide. Will evaluate whether to migrate to PostgreSQL or retain SQLite.
