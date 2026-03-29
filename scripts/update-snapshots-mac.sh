#!/bin/bash
# Generate Playwright snapshots for macOS (local development)
#
# Usage:
#   ./scripts/update-snapshots-mac.sh
#
# Prerequisites:
#   - Run from project root
#   - Dependencies installed (npm ci --legacy-peer-deps)
#
# This script:
#   1. Runs Playwright tests locally with --update-snapshots flag
#   2. Generates snapshots in e2e/snapshots/.../darwin/

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_ROOT"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}=== Generating Playwright Snapshots for macOS ===${NC}"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo -e "${RED}Error: node_modules not found. Run 'npm run install:legacy' first.${NC}"
    exit 1
fi

# Check if Playwright is installed
if [ ! -d "node_modules/@playwright" ]; then
    echo -e "${RED}Error: Playwright not found. Run 'npm run install:legacy' first.${NC}"
    exit 1
fi

echo -e "${YELLOW}Running Playwright tests with --update-snapshots...${NC}"
npx playwright test --update-snapshots --reporter=list

echo -e "${GREEN}=== macOS snapshots updated successfully! ===${NC}"
echo -e "${YELLOW}Snapshots are in e2e/snapshots/.../darwin/${NC}"
echo -e "${YELLOW}Don't forget to commit the updated snapshots.${NC}"
