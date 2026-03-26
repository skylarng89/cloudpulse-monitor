# Changelog

## Unreleased
### Added
- Created Memory Bank documentation.
- Devised migration plan for transitioning backend from Node.js to Java Spring Boot.
- Identified latest package versions for the transition: Spring Boot 4.0.x with Java 25, Vue 3.5.31, Vite 8.0.3, and TailwindCSS 4.2.2.
- Configured pnpm as the package manager for the monorepo.
- Integrated `engineering-guide.md` security and resilience patterns into the future plan.
- Completed Phase 2: Initialized Spring Boot structure via Spring Initializr, integrated structured logging, setup CORS, and added PostgreSQL + Flyway configuration.
- Completed Phase 3: Implemented JPA domain models (`Monitor`, `MonitorCheck`). Created `NetworkCheckService` using Java 25 Virtual Threads and `HttpClient`. Added circuit breaking via `Resilience4j`. Engineered scalable `@Scheduled` monitor checker.
- Completed Phase 4: Replicated `/api/monitors` controller mapping. Enforced Strict Input Validation via `Jakarta Validation` (`@Pattern`, `@Max`, `@NotBlank`). Developed an `X-Idempotency-Key` system using PostgreSQL mapping to securely prevent duplicate POST processing.
- Completed Phase 5: Migrated backend to secure rootless `eclipse-temurin:25-jre-jammy` resolving critical Alpine vulns. Orchestrated frontend/backend/DB tightly in `docker-compose.yml`. Initialized `.github/workflows/ci.yml` with Trivy (SCA) and CodeQL (SAST) pipelines.
