#!/bin/zsh
set -euo pipefail

export PATH="/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin"
cd "/Users/jinman/Desktop/Projects/products/detail-page-saas"

# Avoid a bad global Anthropic key shadowing .env.local during related checks.
unset ANTHROPIC_API_KEY || true

/opt/homebrew/bin/npx tsx --env-file=.env.local scripts/codex-watchdog.ts
