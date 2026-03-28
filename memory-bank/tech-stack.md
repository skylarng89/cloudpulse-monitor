# Technology Stack

## Frontend
- **Framework**: Vue 3.5.31 (Composition API)
- **Language**: TypeScript
- **Styling**: TailwindCSS 4.2.2
- **Build Tool**: Vite 8.0.3
- **HTTP Client**: Axios

## Backend
- **Framework**: Spring Boot 4.0.5
- **Language**: Java 25
- **Build Tool**: Gradle 9.4.0
- **ORM**: Spring Data JPA
- **Database**: PostgreSQL
- **Migrations**: Flyway
- **Validation**: Jakarta Validation
- **Security**: Spring Security
- **JSON**: Jackson with JSR310 module
- **Logging**: Logstash Logback Encoder 7.4
- **Resilience**: Resilience4j 2.2.0

## Testing
- **Framework**: JUnit 5 (via spring-boot-starter-test)
- **Mocking**: Mockito
- **Web Testing**: MockMvc
- **Security Testing**: spring-security-test
- **Testcontainers**: 1.21.3 (available, not used)

## Infrastructure & Tooling
- **Package Manager**: pnpm (frontend), Gradle (backend)
- **Containerization**: Docker, Docker Compose
- **Base Image**: eclipse-temurin:25-jre-jammy
- **CI/CD**: GitHub Actions (Trivy SCA, CodeQL SAST)
