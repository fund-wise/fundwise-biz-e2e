#!/bin/sh
# Shared entrypoint: load /secrets/.env if present, then exec passed command.
set -e

if [ -f /secrets/.env ]; then
  echo "[entrypoint] Loading /secrets/.env"
  set -a
  # shellcheck disable=SC1091
  . /secrets/.env
  set +a
else
  echo "[entrypoint] No /secrets/.env found"
fi

exec "$@"
