# Architectural Decisions

## Date: 2026-03-28

**Decision**: Use existing PostgreSQL container instead of Testcontainers for testing.
**Rationale**: Testcontainers 1.20.x/1.21.x fails with Docker API version mismatch (requires 1.32, Docker needs 1.40). Using existing container on port 7000 is simpler and faster.
**Tradeoffs**: Tests require local PostgreSQL running; not fully isolated.

**Decision**: Explicit ObjectMapper bean with JavaTimeModule.
**Rationale**: Spring Boot 4.0.x `spring-boot-starter-webmvc` does not auto-configure ObjectMapper with JavaTimeModule. Entities use `OffsetDateTime` fields requiring JSR310 module.
**Tradeoffs**: Manual configuration required; Spring Boot auto-configuration not fully utilized.

**Decision**: MockMvc over WebTestClient for WebMVC testing.
**Rationale**: WebTestClient requires WebFlux; not available for WebMVC applications.
**Tradeoffs**: Slightly more verbose test setup; cannot use reactive testing patterns.

## Date: 2026-03-26

**Decision**: Migrate backend from Node.js (Fastify) to Java Spring Boot 4.0.x using Java 25 (Latest LTS).
**Rationale**: Take advantage of Spring Boot's robust enterprise ecosystem, static typing, and mature threading/concurrency models suitable for scheduling network monitor pingers on a massive scale, leveraging Java 25's virtual threads.

**Decision**: Switch package management to `pnpm`.
**Rationale**: `pnpm` offers faster, more efficient monorepo support through symlinked node_modules, reducing disk space and install times.

**Decision**: Strict adherence to the Engineering Master Guide (2026 Edition).
**Rationale**: Ensures enterprise-grade security (Zero Trust, TLS 1.3), resilience (Circuit breakers, retries), and robust observability (OpenTelemetry, JSON structured logging).

**Decision**: Database selection: PostgreSQL.
**Rationale**: For production-scale Spring Boot apps requiring strict ACID compliance, race condition prevention (`SELECT FOR UPDATE`), and concurrent access, PostgreSQL is highly recommended by the engineering guide.
