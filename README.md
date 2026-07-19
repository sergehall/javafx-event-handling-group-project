# JavaFX Event Handling Group Project

A share-safe multi-application workspace for the **Project: JavaFX + Event Handling (Group)** assignment. The JavaFX desktop application is the required deliverable and the reference implementation; the web application and API are optional companion modules.

This repository is intentionally independent from any personal portfolio, private backend, or production environment. It contains only local development defaults and can be shared with another student without exposing unrelated `.env` files or credentials.

## Modules

```text
javafx-event-handling-group-project/
|-- desktop-app/   Required JavaFX + FXML assignment
|-- frontend/      Independent Next.js companion site and task labs
|-- group-api/     Spring Boot task persistence and interaction API
|-- config/        Shared Java quality configuration
|-- scripts/       Root development and infrastructure scripts
|-- compose.yaml   Optional local PostgreSQL for group-api
|-- pom.xml        Maven aggregator for the Java modules
|-- package.json   Root command orchestrator
`-- .env.example   Safe local configuration template
```

### Architecture Boundaries

- `desktop-app` never connects directly to PostgreSQL. It uses the Spring Boot REST API for persistence and automatically falls back to an in-memory session when the API is unavailable at startup.
- `frontend` is a standalone Next.js application. Its Foundation and Advanced task labs use browser state and do not require the API or database.
- `group-api` owns task and interaction persistence. It validates requests, applies transactions through Spring Data JPA, and is the only application allowed to connect to PostgreSQL.
- The root Maven project aggregates the Java modules, while the root npm scripts coordinate development commands. Application source code remains inside its owning module.
- The web Advanced lab follows the JavaFX Advanced workflow so priorities, statuses, filters, and progress behavior remain consistent across both interfaces.

### Shared Task Persistence

The JavaFX application is connected to the local PostgreSQL database through
the Spring Boot API. It never receives database credentials and never opens a
direct JDBC connection:

```text
desktop-app --HTTP /api/v1/tasks--> group-api --JPA/Flyway--> PostgreSQL
```

The database runs locally in `javafx-event-handling-group-postgres-1`, and its
data is retained in the named Docker volume. The JavaFX header displays
`Database online` after a successful API request and `Database offline` when
persistence is unavailable.

The current Next.js Foundation and Advanced labs still keep tasks in browser
state, so web and desktop tasks are not synchronized yet. The existing
architecture supports sharing the same records by adding typed same-origin
Next.js Route Handlers for `/api/group/tasks` that proxy the Spring Boot task
API:

```text
desktop-app ---------> group-api ---------> PostgreSQL tasks
Next.js task labs ---> /api/group/tasks ---^
```

Neither JavaFX nor Next.js should connect directly to PostgreSQL. The
`group-api` remains the single validation and persistence boundary for both
clients.

| Shared value      | API representation                 | PostgreSQL column |
| ----------------- | ---------------------------------- | ----------------- |
| Stable identifier | `id`                               | `id`              |
| Task text         | `title`                            | `title`           |
| Priority          | `HIGH`, `MEDIUM`, `LOW`            | `priority`        |
| Workflow status   | `ACTIVE`, `IN_REVIEW`, `COMPLETED` | `status`          |
| Creation time     | `createdAt`                        | `created_at`      |
| Last update time  | `updatedAt`                        | `updated_at`      |

The database additionally keeps `normalized_title` for case-insensitive
duplicate protection and `version` for optimistic concurrency control. These
internal persistence fields do not need to be edited by either UI.

### Generated Local Directories

These directories are build output or local tooling state. They are ignored by Git and must not be included in the submission:

| Directory                                             | Purpose                                                    |
| ----------------------------------------------------- | ---------------------------------------------------------- |
| `node_modules/`                                       | Root command-runner dependencies, primarily `concurrently` |
| `frontend/node_modules/`                              | Next.js application dependencies                           |
| `target/`, `desktop-app/target/`, `group-api/target/` | Maven build output                                         |
| `frontend/.next/`                                     | Next.js build and development output                       |
| `.idea/`                                              | Local IntelliJ IDEA workspace settings                     |

## Requirements

- JDK 21
- Node.js 24.16.0 (pinned in `.nvmrc`)
- Docker Desktop (only for the optional API and PostgreSQL)
- Git

Maven is provided through the repository wrapper, so a global Maven installation is not required.

## First Setup

For the complete workspace:

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

For the required JavaFX assignment only, JDK 21 and the Maven wrapper are sufficient:

```bash
./mvnw -pl desktop-app clean verify
```

## Project Commands

The root `package.json` provides one command interface for the complete project:

| Command                  | Purpose                                                  |
| ------------------------ | -------------------------------------------------------- |
| `npm start`              | PostgreSQL, Spring Boot API, Next.js, and JavaFX         |
| `npm run start:web`      | PostgreSQL, Spring Boot API, and Next.js                 |
| `npm run start:infra`    | PostgreSQL in Docker Desktop                             |
| `npm run stop:infra`     | PostgreSQL, preserving its container and volume          |
| `npm run start:frontend` | Next.js, then opens it in the default browser            |
| `npm run start:api`      | Spring Boot API only                                     |
| `npm run start:desktop`  | JavaFX with API persistence or automatic memory fallback |
| `npm run lint`           | Checkstyle for Java and ESLint for the frontend          |
| `npm run lint:fix`       | Apply safe formatter and ESLint fixes, then run lint     |
| `npm run format`         | Format Java with Spotless and the frontend with Prettier |
| `npm run format:check`   | Check formatting without changing files                  |
| `npm run verify`         | Maven, frontend, and Compose quality gates               |

Press `Ctrl+C` to stop the foreground processes started by `npm start` or
`npm run start:web`. PostgreSQL intentionally keeps running; stop it separately
with `npm run stop:infra` when required.

Commands that include the frontend wait for `http://127.0.0.1:3000` to become
ready and then open it in the default browser automatically.

## Run the JavaFX Assignment

For PostgreSQL persistence, start the three layers in separate terminals:

```bash
npm run start:infra
```

```bash
npm run start:api
```

```bash
./mvnw -pl desktop-app javafx:run
```

The JavaFX application loads existing tasks from `GET /api/v1/tasks` and sends
all create, priority, status, completion, and removal changes through the API.
Foundation and Advanced continue sharing the same `TaskListModel`, so switching
paths never duplicates or loses the current task list. New tasks use `MEDIUM`
priority by default. A compact header badge shows whether PostgreSQL-backed
persistence is connecting, online, or offline.

Running only the JavaFX command remains safe for the base assignment. If the
API cannot be reached during startup, the status line reports memory mode and
the task controls continue to work for that application session. Restart the
application after starting the API to return to PostgreSQL-backed mode.

The application demonstrates:

- a JavaFX `Application` with an FXML `BorderPane`/`VBox` layout;
- task entry through a text field, the Add Task button, or Enter;
- a `ListView` with a checkbox and Remove button for every task;
- immediate UI updates when tasks are added, completed, or removed;
- in-app Foundation and Advanced path buttons that preserve the current task list;
- optional Advanced priority editing, an Active/In Review/Completed workflow, combined filters,
  progress statistics, and completed-task cleanup;
- input validation and a testable task model separated from the controller.

## Run the Web Companion

The Next.js companion runs independently from the optional API and database:

```bash
npm run start:frontend
```

The command opens `http://127.0.0.1:3000` automatically.

| Route           | Purpose                                                                           |
| --------------- | --------------------------------------------------------------------------------- |
| `/`             | Project home page and assignment overview                                         |
| `/requirements` | Assignment requirements, rubric, and submission checklist                         |
| `/materials`    | Viewable and downloadable assignment materials                                    |
| `/lab`          | Foundation task workflow required by the assignment                               |
| `/lab/advanced` | JavaFX-aligned workflow with priorities, statuses, combined filters, and progress |

Both task labs keep their data in browser component state and therefore require
neither Spring Boot nor PostgreSQL. The optional same-origin Route Handlers at
`/api/group/health` and `/api/group/interactions` validate and forward requests
to the local Spring Boot API; they are separate from the task-list workflow.

The default API address is `http://127.0.0.1:8081`. To change it locally, copy
`frontend/.env.example` to `frontend/.env.local`; the local file is ignored by
Git.

## Run the Optional PostgreSQL and API Extension

Start the optional local infrastructure from the project root:

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

Create a persistent task. Omitting `priority` also selects `MEDIUM`:

```bash
curl -X POST http://127.0.0.1:8081/api/v1/tasks \
  -H 'Content-Type: application/json' \
  -d '{"title":"Show PostgreSQL persistence","priority":"MEDIUM"}'
```

List all tasks:

```bash
curl http://127.0.0.1:8081/api/v1/tasks
```

Inspect exactly what is stored in the local database:

```bash
docker exec -it javafx-event-handling-group-postgres-1 \
  psql -U javafx_group -d javafx_group \
  -c 'SELECT id, title, priority, status, created_at, updated_at FROM tasks ORDER BY id;'
```

The `tasks` table is created by
`group-api/src/main/resources/db/migration/V2__create_tasks.sql`. Its data is
kept in the named Docker volume across normal container stops and starts.

Record an optional browser interaction event:

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
- Keep database credentials inside API configuration; the JavaFX application
  must communicate with the API instead of opening a JDBC connection.
- Use the checked-in Flyway migration instead of editing the database manually.
- Validate every API request and never log submitted personal data or secrets.
- Keep `GROUP_API_BASE_URL` limited to the trusted API origin and never place
  database credentials in that URL or in a `NEXT_PUBLIC_*` variable.

## Before Submission

Confirm the instructor's complete rubric and group-submission policy. The screen recording must show the IDE, the JavaFX source, the running desktop application, and interaction with its task controls.

If only the JavaFX application is required, submit the `desktop-app` module and exclude all generated directories listed above, `.env` files, database volumes, and operating-system files. Exclude `frontend`, `group-api`, and Docker files when the rubric requests only the JavaFX deliverable.
