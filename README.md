# JavaFX Event Handling Group Project

A share-safe Java 21 workspace for the **Project: JavaFX + Event Handling (Group)** assignment.

This repository is intentionally independent from any personal portfolio, private backend, or production environment. It contains only local development defaults and can be shared with another student without exposing unrelated `.env` files or credentials.

## Modules

```text
javafx-event-handling-group-project/
|-- desktop-app/   Standalone JavaFX + FXML assignment
|-- group-api/     Small Spring Boot API for optional interaction history
|-- compose.yaml   Local PostgreSQL only
`-- .env.example   Safe local configuration template
```

The JavaFX desktop app does not require Spring Boot or PostgreSQL. The API is an optional collaboration extension and remains isolated from the assignment UI.

## Requirements

- JDK 21
- Docker Desktop, Colima, or another Docker-compatible runtime
- Git

Maven is provided through the repository wrapper, so a global Maven installation is not required.

## First Setup

```bash
cp .env.example .env
./mvnw clean verify
```

The `.env` file is ignored by Git. Only `.env.example` should be committed.

## Run the JavaFX Assignment

```bash
./mvnw -pl desktop-app javafx:run
```

The application demonstrates:

- button and Enter-key actions;
- mouse click handling and coordinates;
- resize-aware property bindings;
- reset behavior;
- clean application exit.

## Run PostgreSQL and the API

Start the database:

```bash
docker compose up -d postgres
```

Start the API in another terminal:

```bash
./mvnw -pl group-api spring-boot:run
```

Verify health:

```bash
curl http://127.0.0.1:8081/actuator/health
```

Stop the database without deleting its volume:

```bash
docker compose down
```

## API Example

```bash
curl -X POST http://127.0.0.1:8081/api/v1/interactions \
  -H 'Content-Type: application/json' \
  -d '{"type":"CANVAS_CLICK","xCoordinate":120,"yCoordinate":80}'
```

List recent events:

```bash
curl 'http://127.0.0.1:8081/api/v1/interactions?limit=20'
```

## Verification

```bash
./mvnw clean verify
docker compose config
```

## Security Rules

- Never commit `.env`, passwords, tokens, database dumps, or IDE credentials.
- Keep PostgreSQL and the API bound to `127.0.0.1` for local coursework.
- Use the checked-in Flyway migration instead of editing the database manually.
- Validate every API request and never log submitted personal data or secrets.

## Before Submission

Confirm the instructor's complete rubric and group-submission policy. If only the JavaFX application is required, submit the `desktop-app` module and exclude `target`, `.env`, `.idea`, database volumes, and operating-system files.
