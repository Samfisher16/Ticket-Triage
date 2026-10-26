FROM node:20-alpine AS frontend-build
WORKDIR /frontend

COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci

COPY frontend/ ./
RUN npm run build

FROM maven:3.9-eclipse-temurin-21 AS backend-build
WORKDIR /app

COPY backend/pom.xml ./
COPY backend/src ./src
COPY --from=frontend-build /frontend/dist/ticket-triage-ui/browser/ ./src/main/resources/static/
RUN mvn -B package

FROM eclipse-temurin:21-jre
WORKDIR /app

COPY --from=backend-build --chown=10001:10001 /app/target/ticket-triage-0.0.1.jar ./app.jar
RUN mkdir -p /app/data && chown -R 10001:10001 /app/data

USER 10001:10001
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
