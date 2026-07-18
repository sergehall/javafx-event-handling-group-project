#!/usr/bin/env bash

set -euo pipefail

readonly SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"

cd "$SCRIPT_DIR"

if ! command -v docker >/dev/null 2>&1; then
    echo "Docker is required but was not found in PATH." >&2
    exit 1
fi

if ! docker info >/dev/null 2>&1; then
    echo "Docker is not running. Start Docker Desktop or another Docker-compatible runtime." >&2
    exit 1
fi

echo "Creating or starting the project infrastructure..."
docker compose config --quiet
docker compose up --detach --wait --no-recreate postgres

echo "Infrastructure is ready:"
docker compose ps postgres
