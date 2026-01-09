#!/bin/bash
############################################################################
## run-tests.sh
## Run Selenium tests for qqq-frontend-material-dashboard
##
## This script handles starting the React dev server and running Maven tests
############################################################################

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log() { echo -e "${GREEN}[run-tests]${NC} $1"; }
warn() { echo -e "${YELLOW}[run-tests]${NC} $1"; }
error() { echo -e "${RED}[run-tests]${NC} $1"; }

cleanup() {
    log "Cleaning up..."
    if [ -n "$REACT_PID" ] && kill -0 "$REACT_PID" 2>/dev/null; then
        log "Stopping React dev server (PID: $REACT_PID)"
        kill "$REACT_PID" 2>/dev/null || true
    fi
}

trap cleanup EXIT

# Check and free port 8001 (Javalin mock server)
if lsof -i :8001 >/dev/null 2>&1; then
    warn "Port 8001 is in use. Killing process..."
    lsof -ti :8001 | xargs kill -9 2>/dev/null || true
    sleep 1
fi

# Check and free port 3001 (React dev server)
if lsof -i :3001 >/dev/null 2>&1; then
    warn "Port 3001 is in use. Killing process..."
    lsof -ti :3001 | xargs kill -9 2>/dev/null || true
    sleep 1
fi

# Start React dev server with HTTPS
log "Starting React dev server on https://localhost:3001..."
HTTPS=true PORT=3001 REACT_APP_PROXY_LOCALHOST_PORT=8001 npm start > /tmp/react-dev-server.log 2>&1 &
REACT_PID=$!

# Wait for React server to be ready
log "Waiting for React server to be ready..."
MAX_WAIT=120
WAITED=0
while ! curl -sk https://localhost:3001 >/dev/null 2>&1; do
    if ! kill -0 "$REACT_PID" 2>/dev/null; then
        error "React server failed to start. Check /tmp/react-dev-server.log"
        tail -50 /tmp/react-dev-server.log
        exit 1
    fi
    if [ $WAITED -ge $MAX_WAIT ]; then
        error "Timeout waiting for React server"
        exit 1
    fi
    sleep 2
    WAITED=$((WAITED + 2))
    echo -n "."
done
echo ""
log "React server is ready!"

# Run Maven tests
log "Running Maven tests..."
QQQ_SELENIUM_HEADLESS=true mvn verify "$@"

log "Tests complete!"
