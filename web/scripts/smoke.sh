#!/usr/bin/env bash
set -euo pipefail

# Build
npm run build > /dev/null

# Start dev server on port 3000 in background
PORT=3000
if lsof -ti tcp:$PORT >/dev/null 2>&1; then
  lsof -ti tcp:$PORT | xargs -r kill
fi
npm run dev >/dev/null 2>&1 &
PID=$!
sleep 2

fail=0

function check() {
  name=$1
  url=$2
  method=${3:-GET}
  code=$(curl -s -o /dev/null -w "%{http_code}" -X "$method" "$url") || code=0
  echo "$name -> $code"
  if [[ "$code" == "200" || "$code" == "403" ]]; then
    return 0
  else
    fail=1
    return 1
  fi
}

check "health" "http://localhost:3000/api/health"
check "crypto/new (403)" "http://localhost:3000/api/competition/crypto/new" POST
check "crypto/close (403)" "http://localhost:3000/api/competition/crypto/close" POST
check "crypto/end (403)" "http://localhost:3000/api/competition/crypto/end" POST
check "stocks/new (403)" "http://localhost:3000/api/competition/stocks/new" POST
check "stocks/close (403)" "http://localhost:3000/api/competition/stocks/close" POST
check "stocks/end (403)" "http://localhost:3000/api/competition/stocks/end" POST

kill $PID >/dev/null 2>&1 || true

if [[ $fail -eq 0 ]]; then
  echo "SMOKE: ok"
  exit 0
else
  echo "SMOKE: failed"
  exit 1
fi


