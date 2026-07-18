# Team Workflow

## Contributors

- Student 1: add name
- Student 2: add name

Update this file before the first shared commit.

## Git Workflow

1. Protect `main` from direct feature work.
2. Create one short branch per task, such as `feature/mouse-events`.
3. Pull the latest `main` before starting.
4. Keep commits focused and describe behavior, not filenames.
5. Open a pull request and ask the other student to review it.
6. Run `./mvnw clean verify`, `npm --prefix frontend run verify`, and
   `docker compose config` before merging.

## Suggested Ownership

- One student owns JavaFX UI and FXML changes.
- One student owns tests, API, frontend, Docker, and documentation.
- Both students review event-handler behavior and the final submission archive.

Ownership is temporary. Important code must be understood by both contributors.

## Definition of Done

- JavaFX behavior works manually.
- Automated tests pass.
- Java and frontend lint and formatting checks pass.
- Frontend typecheck, component tests, and production build pass.
- No secret or `.env` file is tracked.
- The database schema is reproducible through Flyway.
- The pull request explains how the change was verified.
- Generated files are excluded from the final archive.
