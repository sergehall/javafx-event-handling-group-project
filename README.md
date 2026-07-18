# JavaFX Event Handling Group Project

A share-safe Java 21 workspace for the **Project: JavaFX + Event Handling (Group)** assignment.

This repository is intentionally independent from any personal portfolio, private backend, or production environment. It contains only local development defaults and can be shared with another student without exposing unrelated `.env` files or credentials.

## Modules

```text
javafx-event-handling-group-project/
|-- desktop-app/   Standalone JavaFX + FXML assignment
|-- group-api/     Small Spring Boot API for optional interaction history
|-- frontend/      Optional Next.js web lab for browser and API testing
|-- compose.yaml   Local PostgreSQL only
`-- .env.example   Safe local configuration template
```

The JavaFX desktop app does not require Spring Boot or PostgreSQL. The API is an optional collaboration extension and remains isolated from the assignment UI.
The Next.js frontend is also optional: it mirrors the event-handling flows in a
browser and provides a typed test interface for the API without replacing the
JavaFX/FXML deliverable.

## Requirements

- JDK 21
- Node.js 24.16.0 (pinned in `.nvmrc`)
- Docker Desktop
- Git

Maven is provided through the repository wrapper, so a global Maven installation is not required.

## First Setup

```bash
nvm use
cp .env.example .env
./mvnw clean verify
npm ci
npm ci --prefix frontend
```

The root `.npmrc` rejects dependency installation on a different Node.js
version. The `.env` file is ignored by Git. Only `.env.example` should be
committed.

## Project Commands

The root `package.json` provides one command interface for the complete project:

| Command | Purpose |
| --- | --- |
| `npm start` | PostgreSQL, Spring Boot API, Next.js, and JavaFX |
| `npm run start:web` | PostgreSQL, Spring Boot API, and Next.js |
| `npm run start:infra` | PostgreSQL in Docker Desktop |
| `npm run stop:infra` | PostgreSQL, preserving its container and volume |
| `npm run start:frontend` | Next.js, then opens it in the default browser |
| `npm run start:api` | Spring Boot API only |
| `npm run start:desktop` | Standalone JavaFX application only |
| `npm run lint` | Checkstyle for Java and ESLint for the frontend |
| `npm run lint:fix` | Apply safe formatter and ESLint fixes, then run lint |
| `npm run format` | Format Java with Spotless and the frontend with Prettier |
| `npm run format:check` | Check formatting without changing files |
| `npm run verify` | Maven, frontend, and Compose quality gates |

Press `Ctrl+C` to stop the foreground processes started by `npm start` or
`npm run start:web`. PostgreSQL intentionally keeps running; stop it separately
with `npm run stop:infra` when required.

Commands that include the frontend wait for `http://127.0.0.1:3000` to become
ready and then open it in the default browser automatically.

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

## Run the Browser Test Lab

The web lab remains useful when the API is offline, but start all optional
services to test persistence and API health.

Start PostgreSQL:

```bash
npm run start:infra
```

Start the Spring Boot API in a second terminal:

```bash
npm run start:api
```

Start the Next.js frontend in a third terminal:

```bash
npm run start:frontend
```

Open `http://127.0.0.1:3000`. The browser communicates with same-origin Next.js
Route Handlers, which validate data and forward only the expected requests to
the local Spring Boot API.

The default API address is `http://127.0.0.1:8081`. To change it locally, copy
`frontend/.env.example` to `frontend/.env.local`; the local file is ignored by
Git.

## Run PostgreSQL and the API

Start the required local infrastructure from the project root:

```bash
npm run start:infra
```

The script validates the Docker environment, starts PostgreSQL through
`compose.yaml`, waits for its health check, and prints the container status. On
the first run it creates the container and named volume. Later runs start the
same container with `--no-recreate`, so the infrastructure and stored data are
reused. Both infrastructure scripts explicitly use Docker Desktop's
`desktop-linux` context, preventing an accidental duplicate in another runtime.
The script uses the safe defaults from the Compose file or optional values from
a local ignored `.env` file.

Start the API in another terminal:

```bash
npm run start:api
```

Verify health:

```bash
curl http://127.0.0.1:8081/actuator/health
```

Stop PostgreSQL while keeping the container and its volume for the next start:

```bash
npm run stop:infra
```

IntelliJ IDEA also provides shared `Start Infrastructure` and
`Stop Infrastructure` run configurations in the toolbar selector. They run the
same root scripts, so terminal and IDE usage have identical behavior.

Use `docker compose down` only when you intentionally want to remove the
container and project network. The named database volume is still preserved
unless `--volumes` is explicitly supplied.

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

Before committing, format the code and run all quality gates from the project
root:

```bash
npm run format
npm run verify
```

Maven runs Checkstyle and Spotless for both Java modules. The frontend runs
ESLint with the Next.js TypeScript rules and Prettier, followed by type checks,
component tests, and a production build. Use `npm run lint` or
`npm run format:check` when you need a faster focused check.

## Security Rules

- Never commit `.env`, passwords, tokens, database dumps, or IDE credentials.
- Keep PostgreSQL and the API bound to `127.0.0.1` for local coursework.
- Use the checked-in Flyway migration instead of editing the database manually.
- Validate every API request and never log submitted personal data or secrets.
- Keep `GROUP_API_BASE_URL` server-side; never expose backend credentials through
  a `NEXT_PUBLIC_*` variable.

## Before Submission

Confirm the instructor's complete rubric and group-submission policy. If only the JavaFX application is required, submit the `desktop-app` module and exclude `target`, `.env`, `.idea`, database volumes, and operating-system files.
The optional `frontend`, `group-api`, and Docker files should also be excluded
when the rubric requests only the JavaFX deliverable.
