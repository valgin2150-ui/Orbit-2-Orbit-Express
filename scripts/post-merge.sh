#!/bin/bash
set -e
npm install --prefer-offline --no-audit 2>/dev/null || npm install --no-audit
npm run db:push 2>/dev/null || echo "db:push skipped (no schema changes or DB unavailable)"
