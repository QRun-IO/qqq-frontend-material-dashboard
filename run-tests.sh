#!/bin/bash
############################################################################
## run-tests.sh
## Run all tests for qqq-frontend-material-dashboard
##
## This script handles:
## - Starting required servers (React, fixture server)
## - Running Playwright e2e tests
## - Running Selenium integration tests
## - Cleanup and teardown
##
## Usage:
##   ./run-tests.sh              # Run all tests
##   ./run-tests.sh --playwright # Run only Playwright tests
##   ./run-tests.sh --selenium   # Run only Selenium tests
##   ./run-tests.sh --help       # Show help
############################################################################

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# PID tracking
REACT_PID=""
FIXTURE_PID=""

log() { echo -e "${GREEN}[run-tests]${NC} $1"; }
info() { echo -e "${BLUE}[run-tests]${NC} $1"; }
warn() { echo -e "${YELLOW}[run-tests]${NC} $1"; }
error() { echo -e "${RED}[run-tests]${NC} $1"; }

usage() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  --playwright    Run only Playwright e2e tests"
    echo "  --selenium      Run only Selenium integration tests"
    echo "  --all           Run all tests (default)"
    echo "  --help          Show this help message"
    echo ""
    echo "Environment variables:"
    echo "  QQQ_SELENIUM_HEADLESS=true   Run browser in headless mode"
    exit 0
}

cleanup() {
    log "Cleaning up..."

    if [ -n "$REACT_PID" ] && kill -0 "$REACT_PID" 2>/dev/null; then
        log "Stopping React dev server (PID: $REACT_PID)"
        kill "$REACT_PID" 2>/dev/null || true
        wait "$REACT_PID" 2>/dev/null || true
    fi

    if [ -n "$FIXTURE_PID" ] && kill -0 "$FIXTURE_PID" 2>/dev/null; then
        log "Stopping fixture server (PID: $FIXTURE_PID)"
        kill "$FIXTURE_PID" 2>/dev/null || true
        wait "$FIXTURE_PID" 2>/dev/null || true
    fi

    # Kill any orphaned processes on our ports
    lsof -ti :3001 2>/dev/null | xargs kill -9 2>/dev/null || true
    lsof -ti :8001 2>/dev/null | xargs kill -9 2>/dev/null || true
}

trap cleanup EXIT INT TERM

free_port() {
    local port=$1
    if lsof -i :$port >/dev/null 2>&1; then
        warn "Port $port is in use. Killing process..."
        lsof -ti :$port | xargs kill -9 2>/dev/null || true
        sleep 1
    fi
}

start_react_server() {
    log "Starting React dev server on https://localhost:3001..."
    HTTPS=true PORT=3001 REACT_APP_PROXY_LOCALHOST_PORT=8001 npm start > /tmp/react-dev-server.log 2>&1 &
    REACT_PID=$!

    log "Waiting for React server to be ready..."
    local MAX_WAIT=120
    local WAITED=0
    while ! curl -sk https://localhost:3001 >/dev/null 2>&1; do
        if ! kill -0 "$REACT_PID" 2>/dev/null; then
            error "React server failed to start. Check /tmp/react-dev-server.log"
            tail -50 /tmp/react-dev-server.log
            exit 1
        fi
        if [ $WAITED -ge $MAX_WAIT ]; then
            error "Timeout waiting for React server after ${MAX_WAIT}s"
            exit 1
        fi
        sleep 2
        WAITED=$((WAITED + 2))
        echo -n "."
    done
    echo ""
    log "React server is ready!"
}

start_fixture_server() {
    log "Starting fixture server on http://localhost:8001..."
    node e2e/fixture-server.js > /tmp/fixture-server.log 2>&1 &
    FIXTURE_PID=$!

    log "Waiting for fixture server to be ready..."
    local MAX_WAIT=30
    local WAITED=0
    while ! curl -s http://localhost:8001/metaData >/dev/null 2>&1; do
        if ! kill -0 "$FIXTURE_PID" 2>/dev/null; then
            error "Fixture server failed to start. Check /tmp/fixture-server.log"
            tail -20 /tmp/fixture-server.log
            exit 1
        fi
        if [ $WAITED -ge $MAX_WAIT ]; then
            error "Timeout waiting for fixture server after ${MAX_WAIT}s"
            exit 1
        fi
        sleep 1
        WAITED=$((WAITED + 1))
        echo -n "."
    done
    echo ""
    log "Fixture server is ready!"
}

run_playwright_tests() {
    info "=========================================="
    info "Running Playwright E2E Tests"
    info "=========================================="

    # Playwright manages its own servers via playwright.config.ts
    # but we can start them manually for consistency
    npx playwright test --reporter=list

    local result=$?
    if [ $result -eq 0 ]; then
        log "Playwright tests PASSED"
    else
        error "Playwright tests FAILED"
    fi
    return $result
}

run_selenium_tests() {
    info "=========================================="
    info "Running Selenium Integration Tests"
    info "=========================================="

    # Selenium needs React server but Javalin starts its own mock server
    # So we stop the fixture server to free port 8001 for Javalin
    if [ -n "$FIXTURE_PID" ] && kill -0 "$FIXTURE_PID" 2>/dev/null; then
        log "Stopping fixture server for Selenium tests..."
        kill "$FIXTURE_PID" 2>/dev/null || true
        wait "$FIXTURE_PID" 2>/dev/null || true
        FIXTURE_PID=""
        sleep 1
    fi

    # Free port 8001 for Javalin
    free_port 8001

    # Run Selenium tests with headless mode
    QQQ_SELENIUM_HEADLESS=${QQQ_SELENIUM_HEADLESS:-true} mvn test -Dtest="**/selenium/tests/*IT" "$@"

    local result=$?
    if [ $result -eq 0 ]; then
        log "Selenium tests PASSED"
    else
        error "Selenium tests FAILED"
    fi
    return $result
}

# Parse arguments
RUN_PLAYWRIGHT=false
RUN_SELENIUM=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --playwright)
            RUN_PLAYWRIGHT=true
            shift
            ;;
        --selenium)
            RUN_SELENIUM=true
            shift
            ;;
        --all)
            RUN_PLAYWRIGHT=true
            RUN_SELENIUM=true
            shift
            ;;
        --help|-h)
            usage
            ;;
        *)
            # Pass remaining args to mvn
            break
            ;;
    esac
done

# Default to running all tests if nothing specified
if [ "$RUN_PLAYWRIGHT" = false ] && [ "$RUN_SELENIUM" = false ]; then
    RUN_PLAYWRIGHT=true
    RUN_SELENIUM=true
fi

# Track overall success
FAILED=false

info "=========================================="
info "QQQ Frontend Material Dashboard - Test Runner"
info "=========================================="

# Free ports before starting
free_port 3001
free_port 8001

# Start React server (needed for both test types)
start_react_server

# Run Playwright tests
if [ "$RUN_PLAYWRIGHT" = true ]; then
    start_fixture_server
    run_playwright_tests || FAILED=true
fi

# Run Selenium tests
if [ "$RUN_SELENIUM" = true ]; then
    run_selenium_tests "$@" || FAILED=true
fi

# Summary
echo ""
info "=========================================="
if [ "$FAILED" = true ]; then
    error "SOME TESTS FAILED"
    exit 1
else
    log "ALL TESTS PASSED"
    exit 0
fi
