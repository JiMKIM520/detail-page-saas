#!/bin/zsh
set -euo pipefail

export PATH="/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin"
cd "/Users/jinman/Desktop/Projects/products/detail-page-saas"

mkdir -p .watchdog
echo "$$" > .watchdog/hourly.pid

while true; do
  {
    echo "===== $(date -u '+%Y-%m-%dT%H:%M:%SZ') watchdog run ====="
    ./scripts/run-codex-watchdog.sh
  } >> .watchdog/hourly.out.log 2>> .watchdog/hourly.err.log || true

  sleep 3600
done
