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
#   1. Starts the fixture server and React dev server locally
#   2. Runs Playwright tests in a Docker container matching CI
#   3. Updates snapshots with --update-snapshots flag
#   4. Cleans up servers when done

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

# Kill any existing servers
echo -e "${YELLOW}Stopping any existing servers...${NC}"
pkill -f "node e2e/fixture-server.js" 2>/dev/null || true
pkill -f "react-scripts start" 2>/dev/null || true
sleep 2

# Start fixture server
echo -e "${YELLOW}Starting fixture server on port 8001...${NC}"
node e2e/fixture-server.js &
FIXTURE_PID=$!
sleep 2

# Verify fixture server is running
if ! curl -s http://localhost:8001/metaData > /dev/null; then
    echo -e "${RED}Error: Fixture server failed to start${NC}"
    kill $FIXTURE_PID 2>/dev/null || true
    exit 1
fi
echo -e "${GREEN}Fixture server running (PID: $FIXTURE_PID)${NC}"

# Start React dev server
echo -e "${YELLOW}Starting React dev server on port 3001...${NC}"
HTTPS=true PORT=3001 REACT_APP_PROXY_LOCALHOST_PORT=8001 npm start &
REACT_PID=$!

# Wait for React server to be ready
echo -e "${YELLOW}Waiting for React server to be ready (this may take 1-2 minutes)...${NC}"
for i in {1..120}; do
    if curl -sk https://localhost:3001 > /dev/null 2>&1; then
        echo -e "${GREEN}React server is ready!${NC}"
        break
    fi
    if [ $i -eq 120 ]; then
        echo -e "${RED}Error: React server failed to start within 2 minutes${NC}"
        kill $FIXTURE_PID 2>/dev/null || true
        kill $REACT_PID 2>/dev/null || true
        exit 1
    fi
    sleep 1
done

# Cleanup function
cleanup() {
    echo -e "${YELLOW}Cleaning up servers...${NC}"
    kill $FIXTURE_PID 2>/dev/null || true
    kill $REACT_PID 2>/dev/null || true
    pkill -f "node e2e/fixture-server.js" 2>/dev/null || true
    pkill -f "react-scripts start" 2>/dev/null || true
}
trap cleanup EXIT

# Run Playwright in Docker
echo -e "${YELLOW}Running Playwright tests in Docker to update snapshots...${NC}"

# Determine if we're on macOS or Linux for host connectivity
if [[ "$(uname)" == "Darwin" ]]; then
    # macOS: Use host.docker.internal to reach host services
    HOST_URL="host.docker.internal"
else
    # Linux: Use host network mode
    HOST_URL="localhost"
fi

# Create a temporary playwright config that uses the correct host
TEMP_CONFIG=$(mktemp)
cat > "$TEMP_CONFIG" << EOF
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e/tests',
  fullyParallel: false,
  forbidOnly: true,
  retries: 0,
  workers: 1,
  reporter: [['list']],
  timeout: 60000,
  snapshotDir: './e2e/snapshots',
  snapshotPathTemplate: '{snapshotDir}/{testFilePath}/{arg}{ext}',
  expect: {
    toHaveScreenshot: {
      maxDiffPixels: 100,
      maxDiffPixelRatio: 0.01,
      animations: 'disabled',
    },
  },
  use: {
    baseURL: 'https://${HOST_URL}:3001',
    trace: 'off',
    screenshot: 'off',
    ignoreHTTPSErrors: true,
    viewport: { width: 1280, height: 720 },
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
EOF

cp "$TEMP_CONFIG" "$PROJECT_ROOT/playwright.docker.config.ts"
rm "$TEMP_CONFIG"

# Use the same Playwright image as CI
docker run --rm \
    --add-host=host.docker.internal:host-gateway \
    -v "$PROJECT_ROOT:/app" \
    -w /app \
    -e CI=true \
    mcr.microsoft.com/playwright:v1.57.0-jammy \
    sh -c "
        npm ci --legacy-peer-deps &&
        npx playwright test --config=playwright.docker.config.ts --update-snapshots --reporter=list
    "

# Clean up temp config
rm -f "$PROJECT_ROOT/playwright.docker.config.ts"

echo -e "${GREEN}=== Snapshots updated successfully! ===${NC}"
echo -e "${YELLOW}Don't forget to commit the updated snapshots in e2e/snapshots/${NC}"
