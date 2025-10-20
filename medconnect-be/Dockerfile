# syntax=docker/dockerfile:1.7
FROM eclipse-temurin:21-jdk-alpine AS build
WORKDIR /src
RUN apk add --no-cache maven
COPY pom.xml ./
# cache repo maven
RUN --mount=type=cache,target=/root/.m2 mvn -q -DskipTests dependency:go-offline
COPY . .
RUN --mount=type=cache,target=/root/.m2 mvn -q -DskipTests -T 1C clean package

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=build /src/target/MedConnect-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java","-jar","app.jar"]