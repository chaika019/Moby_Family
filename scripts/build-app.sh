#!/usr/bin/env bash
set -euo pipefail
backend_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
frontend_dir="${FRONTEND_DIR:-$backend_dir/frontend}"
if [[ ! -f "$frontend_dir/package.json" ]]; then
  echo "Frontend not found at $frontend_dir. Set FRONTEND_DIR." >&2
  exit 1
fi
if [[ ! -d "$frontend_dir/node_modules" ]]; then
  npm --prefix "$frontend_dir" ci
fi
npm --prefix "$frontend_dir" run build
cd "$backend_dir"
./mvnw -B -ntp clean verify -Pwith-frontend "-Dfrontend.dist=$frontend_dir/dist"
echo 'Run: java -jar target/mobyfamily-0.0.1-SNAPSHOT.jar'
