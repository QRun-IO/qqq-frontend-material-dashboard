#!/bin/bash
# Generate Playwright snapshots using Docker to match CI environment
#
# Usage:
#   ./scripts/update-snapshots.sh
#
# Prerequisites:
#   - Docker must be running
#   - Run from project root
#
# This script:
#   1. Runs everything inside Docker matching CI environment
#   2. Starts the fixture server and React dev server inside Docker
#   3. Runs Playwright tests with --update-snapshots flag
#   4. Copies generated snapshots to host

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_ROOT"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}=== Generating Playwright Snapshots via Docker ===${NC}"

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}Error: Docker is not running. Please start Docker and try again.${NC}"
    exit 1
fi

# Use the same Playwright image as CI
echo -e "${YELLOW}Running Playwright tests in Docker to update snapshots...${NC}"
echo -e "${YELLOW}This will install dependencies, start servers, run tests, and update snapshots inside Docker.${NC}"
echo -e "${YELLOW}This may take several minutes...${NC}"

docker run --rm \
    -v "$PROJECT_ROOT:/app" \
    -w /app \
    -e CI=true \
    -e HTTPS=true \
    -e PORT=3001 \
    -e REACT_APP_PROXY_LOCALHOST_PORT=8001 \
    mcr.microsoft.com/playwright:v1.57.0-jammy \
    sh -c "
        echo '=== Installing dependencies...' &&
        npm ci --legacy-peer-deps &&
        echo '=== Running Playwright tests with --update-snapshots...' &&
        npx playwright test --update-snapshots --reporter=list
    "

echo -e "${GREEN}=== Snapshots updated successfully! ===${NC}"
echo -e "${YELLOW}Don't forget to commit the updated snapshots in e2e/snapshots/${NC}"
