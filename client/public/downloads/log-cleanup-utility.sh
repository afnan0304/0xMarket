#!/usr/bin/env bash
set -euo pipefail

log_dir="${1:-./logs}"
archive_dir="${2:-./archive}"

mkdir -p "$archive_dir"
find "$log_dir" -type f -name '*.log' -exec gzip -c '{}' '>' "$archive_dir/{}.gz" ';'
