# Build the Spring Boot executable
FROM eclipse-temurin:25-jdk-jammy AS builder
WORKDIR /app

# Copy gradle wrapper and config
COPY backend/gradlew backend/build.gradle backend/settings.gradle ./
COPY backend/gradle ./gradle

# Copy source
COPY backend/src ./src

# Build the Spring Boot executable
RUN ./gradlew build -x test

# Production execution stage (more secure than Alpine edge)
FROM eclipse-temurin:25-jre-jammy AS production
WORKDIR /app

# Non-root user for security (SCA/SAST requirement)
RUN groupadd -r spring && useradd -r -g spring spring \
    && apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*
USER spring:spring

# Expose backend API
EXPOSE 8080

# Run the app
COPY --from=builder /app/build/libs/*.jar app.jar
CMD ["java", "-jar", "app.jar"]