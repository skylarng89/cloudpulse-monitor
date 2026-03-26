# Base Dockerfile for CloudPulse Monitor Backend (Spring Boot 4)
FROM eclipse-temurin:25-jdk-alpine AS builder
WORKDIR /app

# Placeholder for Phase 2: Copy Gradle/Maven wrapper and source code
# RUN ./gradlew build -x test

# Production stage
FROM eclipse-temurin:25-jre-alpine
WORKDIR /app

# Needs to be matched with actual JAR generated in Phase 2
# COPY --from=builder /app/build/libs/*.jar app.jar

EXPOSE 8080

# Temporary placeholder command until Java app is created in Phase 2
CMD ["sh", "-c", "echo 'Backend will run on port 8080 once Spring Boot is initialized in Phase 2' && sleep infinity"]