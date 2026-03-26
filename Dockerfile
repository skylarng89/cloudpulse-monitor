FROM eclipse-temurin:25-jdk-alpine AS builder
WORKDIR /app

# Copy gradle wrapper and config
COPY backend/gradlew backend/build.gradle backend/settings.gradle ./
COPY backend/gradle ./gradle

# Copy source
COPY backend/src ./src

# Build the Spring Boot executable
RUN ./gradlew build -x test

# Production execution stage
FROM eclipse-temurin:25-jre-alpine AS production
WORKDIR /app

# Expose backend API
EXPOSE 8080

# Run the app
COPY --from=builder /app/build/libs/*.jar app.jar
CMD ["java", "-jar", "app.jar"]