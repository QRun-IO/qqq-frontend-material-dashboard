#!/bin/bash

############################################################################
## sync-npm-version.sh
## Synchronizes NPM package.json version with Maven pom.xml version
## 
## This script reads the version from pom.xml and updates package.json
## to maintain consistency between Maven and NPM versions.
##
## Usage: ./sync-npm-version.sh [--dry-run]
## Output: Updates package.json version to match pom.xml revision
############################################################################

set -e

# Configuration
POM_FILE="pom.xml"
PACKAGE_JSON="package.json"
DRY_RUN=false

# Parse command line arguments
if [[ "$1" == "--dry-run" ]]; then
    DRY_RUN=true
    echo "DRY RUN MODE - No changes will be made"
fi

# Get current versions
MAVEN_VERSION=$(grep '<revision>' $POM_FILE | sed 's/.*<revision>//;s/<.*//')
NPM_VERSION=$(grep '"version"' $PACKAGE_JSON | sed 's/.*"version": "//;s/".*//')

echo "Current Maven version: $MAVEN_VERSION"
echo "Current NPM version: $NPM_VERSION"

# Convert Maven version to NPM format
# Maven: 1.0.0-SNAPSHOT -> NPM: 1.0.0-SNAPSHOT
# Maven: 1.0.0-RC.1 -> NPM: 1.0.0-rc.1
# Maven: 1.0.0 -> NPM: 1.0.0
NPM_FORMATTED_VERSION=$(echo "$MAVEN_VERSION" | sed 's/-RC\./-rc./g')

echo "Formatted NPM version: $NPM_FORMATTED_VERSION"

# Check if versions are already in sync
if [[ "$NPM_VERSION" == "$NPM_FORMATTED_VERSION" ]]; then
    echo "✅ Versions are already synchronized"
    exit 0
fi

# Update package.json version
if [[ "$DRY_RUN" == "true" ]]; then
    echo "DRY RUN: Would update package.json version from '$NPM_VERSION' to '$NPM_FORMATTED_VERSION'"
    echo "Command: sed -i 's/\"version\": \"$NPM_VERSION\"/\"version\": \"$NPM_FORMATTED_VERSION\"/' $PACKAGE_JSON"
    exit 0
fi

echo "Updating package.json version from '$NPM_VERSION' to '$NPM_FORMATTED_VERSION'"

# Use sed to update the version in package.json (macOS compatible)
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS requires an empty string for -i
    sed -i '' "s/\"version\": \"$NPM_VERSION\"/\"version\": \"$NPM_FORMATTED_VERSION\"/" $PACKAGE_JSON
else
    # Linux uses -i without empty string
    sed -i "s/\"version\": \"$NPM_VERSION\"/\"version\": \"$NPM_FORMATTED_VERSION\"/" $PACKAGE_JSON
fi

# Verify the change
ACTUAL_NPM_VERSION=$(grep '"version"' $PACKAGE_JSON | sed 's/.*"version": "//;s/".*//')
if [[ "$ACTUAL_NPM_VERSION" == "$NPM_FORMATTED_VERSION" ]]; then
    echo "✅ NPM version successfully updated to: $ACTUAL_NPM_VERSION"
else
    echo "❌ NPM version update failed. Expected: $NPM_FORMATTED_VERSION, Got: $ACTUAL_NPM_VERSION"
    exit 1
fi

echo ""
echo "=== NPM version synchronization complete ==="
echo "Maven: $MAVEN_VERSION"
echo "NPM:   $ACTUAL_NPM_VERSION"
