# Code Patterns

## Backend (Java Spring Boot)
- **Architecture**: Layered architecture (Controller, Service, Repository).
- **Concurrency**: Use Virtual Threads (Java 21+) or reactive approach for network I/O bounds (pinging).
- **Error Handling**: Follow strict resilience patterns — Circuit breakers, bulkheads, exponential backoff with jitter for remote checks.
- **Idempotency**: Require `X-Idempotency-Key` for state-mutating endpoints, verified via atomic DB locks.
- **Logging**: Structured JSON logs using SLF4J + Logback mapping to OpenTelemetry fields.
- **Timestamps**: Use `OffsetDateTime` with `@PrePersist`/`@PreUpdate` lifecycle callbacks.
- **JSON Serialization**: Jackson with `JavaTimeModule`, disable `WRITE_DATES_AS_TIMESTAMPS`.

## Testing Patterns
- **Integration Tests**: `@SpringBootTest` + `@ActiveProfiles("test")` + MockMvc
- **Unit Tests**: Standard JUnit 5 with Mockito
- **Naming**: `should_expectedBehavior_when_condition` (e.g., `createMonitor_shouldReturnCreated_whenValidInput`)
- **Test Profile**: `ddl-auto: create-drop`, Flyway disabled, existing PostgreSQL on port 7000

## Frontend (Vue 3)
- Use Composition API with setup scripts.
- Strong TypeScript typing for all API contracts.
- TailwindCSS v4 for utility-first styling.
