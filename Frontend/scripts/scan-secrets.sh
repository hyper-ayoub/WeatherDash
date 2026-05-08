#!/usr/bin/env bash
set -euo pipefail

repo_root="$(git rev-parse --show-toplevel)"
cd "$repo_root"

# Keep this focused on high-signal patterns to reduce false positives.
pattern='(VITE_OPENWEATHER_API_KEY\s*=\s*[A-Za-z0-9_-]{16,}|OPENWEATHER_API_KEY\s*=\s*[A-Za-z0-9_-]{16,}|AKIA[0-9A-Z]{16}|AIza[0-9A-Za-z_-]{35}|ghp_[A-Za-z0-9]{36}|-----BEGIN (RSA|EC|OPENSSH|DSA|PGP) PRIVATE KEY-----|xox[baprs]-[A-Za-z0-9-]{10,}|api[_-]?key\s*[:=]\s*["'"'"'][A-Za-z0-9_\-]{16,}["'"'"'])'

exclude_args=(
  ":(exclude)Frontend/.env"
  ":(exclude)Frontend/.env.example"
  ":(exclude)Frontend/package-lock.json"
)

echo "Scanning tracked files for potential secrets..."

if git grep -nI -E "$pattern" -- . "${exclude_args[@]}"; then
  echo
  echo "Potential secret(s) detected. Remove or move secrets to untracked env files before pushing."
  exit 1
fi

echo "No obvious secrets found in tracked files."