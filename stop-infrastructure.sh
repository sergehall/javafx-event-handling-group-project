#!/usr/bin/env bash

set -euo pipefail

readonly SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
readonly DOCKER_CONTEXT="desktop-linux"

cd "$SCRIPT_DIR"

if ! command -v docker >/dev/null 2>&1; then
    echo "Docker is required but was not found in PATH." >&2
    exit 1
fi

if ! docker context inspect "$DOCKER_CONTEXT" >/dev/null 2>&1; then
    echo "Docker Desktop context '$DOCKER_CONTEXT' was not found." >&2
    exit 1
fi

if ! docker --context "$DOCKER_CONTEXT" info >/dev/null 2>&1; then
    echo "Docker Desktop is not running." >&2
    exit 1
fi

echo "Stopping the project infrastructure..."
docker --context "$DOCKER_CONTEXT" compose config --quiet
docker --context "$DOCKER_CONTEXT" compose stop postgres

echo "Infrastructure is stopped. The container and database volume are preserved:"
docker --context "$DOCKER_CONTEXT" compose ps --all postgres
