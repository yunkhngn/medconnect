# Multi-stage build for Spring Boot application

# Dev stage - only install dependencies for hot reload
FROM maven:3.9.9-eclipse-temurin-21-alpine AS dev

WORKDIR /app

# Copy pom.xml and download dependencies (for better caching)
# Use BuildKit cache mount for Maven dependencies
COPY pom.xml .
RUN --mount=type=cache,target=/root/.m2 \
    mvn dependency:go-offline -B

# Build stage - full build for production
FROM maven:3.9.9-eclipse-temurin-21-alpine AS build

WORKDIR /app

# Copy pom.xml and download dependencies (for better caching)
# Use BuildKit cache mount for Maven dependencies
COPY pom.xml .
RUN --mount=type=cache,target=/root/.m2 \
    mvn dependency:go-offline -B

# Copy source code
COPY src ./src

# Build the application (use cache mount for Maven)
RUN --mount=type=cache,target=/root/.m2 \
    mvn clean package -DskipTests

# Runtime stage
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

# Install wget, curl, and netcat for health check and database wait
RUN apk add --no-cache wget curl netcat-openbsd

# Create non-root user for security
RUN addgroup -S spring && adduser -S spring -G spring

# Copy wait script
COPY wait-for-db.sh /app/wait-for-db.sh
RUN chmod +x /app/wait-for-db.sh

# Copy the built JAR from build stage
COPY --from=build /app/target/*.jar app.jar

# Change ownership
RUN chown -R spring:spring /app

USER spring:spring

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=120s --retries=5 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/actuator/health || exit 1

# Run the application with wait script
ENTRYPOINT ["sh", "-c", "/app/wait-for-db.sh && java -jar app.jar"]
