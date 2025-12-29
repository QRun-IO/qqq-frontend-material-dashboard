# CI/CD Integration with GitHub Actions Library

## Overview

The qqq-frontend-material-dashboard project has been successfully integrated with the Kingsrook GitHub Actions Library to provide standardized CI/CD workflows for building, testing, and publishing.

## Project Type

This project is configured as an **integrated Maven+NPM project** where:
- Maven handles the overall build lifecycle and Java components
- The frontend-maven-plugin builds the React frontend and packages it into the Maven JAR
- NPM components are not published separately - they are embedded as resources in the Maven JAR

## Workflow Configuration

### Current Setup

The project uses the following workflow configuration in `.github/workflows/ci.yml`:

```yaml
name: 'CI/CD Pipeline'

on:
  push:
    branches: [ main, develop, 'release/*', 'hotfix/*', 'feature/*' ]
  pull_request:
    branches: [ main, develop ]
  workflow_dispatch:

jobs:
  publish:
    name: '🚀 Build, Test, and Publish Release (main, rc, hotfix, or snapshot)'
    if: |
      github.ref_name == 'main' ||
      github.ref_name == 'develop' ||
      startsWith(github.ref_name, 'release/') ||
      startsWith(github.ref_name, 'hotfix/')
    uses: Kingsrook/github-actions-library/.github/workflows/reusable-gitflow-publish@develop
    with:
      project-type: 'maven'
      java-version: '17'
      maven-args: '-B -q -P ci package'
      maven-working-directory: '.'
    secrets:
      GPG_PRIVATE_KEY_B64: ${{ secrets.GPG_PRIVATE_KEY_B64 }}
      GPG_KEYNAME: ${{ secrets.GPG_KEYNAME }}
      GPG_PASSPHRASE: ${{ secrets.GPG_PASSPHRASE }}
      CENTRAL_USERNAME: ${{ secrets.CENTRAL_USERNAME }}
      CENTRAL_PASSWORD: ${{ secrets.CENTRAL_PASSWORD }}
      NPM_TOKEN: ${{ secrets.NPM_TOKEN }}

  test:
    name: '🧪 Build and Test Only'
    if: |
      !(
        github.ref_name == 'main' ||
        github.ref_name == 'develop' ||
        startsWith(github.ref_name, 'release/') ||
        startsWith(github.ref_name, 'hotfix/')
      )
    uses: Kingsrook/github-actions-library/.github/workflows/reusable-gitflow-test@develop
    with:
      project-type: 'maven'
      java-version: '17'
      maven-args: '-B -q -P ci package'
      maven-working-directory: '.'
```

### Key Configuration Details

1. **Project Type**: `maven` - This is correct for an integrated project where Maven builds everything
2. **Maven Arguments**: `-B -q -P ci package` - Uses the CI profile and runs the package phase to trigger frontend build
3. **Branch Reference**: `@develop` - Uses the latest version of the GitHub Actions library
4. **Java Version**: `17` - Matches the project's Java version requirement

## Maven Configuration

### CI Profile

The project includes a CI profile in `pom.xml` that optimizes the build for automated environments:

```xml
<profile>
  <!-- CI/CD profile - optimized for automated builds -->
  <id>ci</id>
  <build>
    <plugins>
      <plugin>
        <groupId>com.github.eirslett</groupId>
        <artifactId>frontend-maven-plugin</artifactId>
        <configuration>
          <nodeVersion>v18.17.0</nodeVersion>
          <npmVersion>9.6.7</npmVersion>
          <workingDirectory>.</workingDirectory>
        </configuration>
      </plugin>
    </plugins>
  </build>
</profile>
```

### Frontend Maven Plugin

The main build configuration includes the frontend-maven-plugin with the following executions:

1. **install-node-and-npm**: Installs Node.js v18.17.0 and NPM 9.6.7
2. **npm-install**: Runs `npm install --legacy-peer-deps` to handle peer dependency conflicts
3. **npm-build**: Runs `npm run build` to create the production React build
4. **copy-frontend-build**: Copies the built frontend files to Maven resources

## Build Process

### Local Testing

To test the build locally:

```bash
# Set up Java 17
export JAVA_HOME=$(/usr/libexec/java_home -v 17)

# Run the same command as the CI workflow
mvn clean compile test-compile -B -P ci package
```

### CI Workflow Steps

1. **Environment Validation**: Validates required secrets and configurations
2. **Version Management**: Uses calculate-version.sh to determine next version
3. **Build and Test**: 
   - Installs Node.js and NPM
   - Runs `npm install --legacy-peer-deps`
   - Runs `npm run build` to create production build
   - Copies frontend files to Maven resources
   - Compiles Java code
   - Runs tests
4. **Publishing**: Publishes to Maven Central (for publishing branches)
5. **Git Operations**: Commits version changes (for publishing branches)

## Required Secrets

The following secrets must be configured in the GitHub repository:

### For Publishing Workflows
- `GPG_PRIVATE_KEY_B64` - Base64 encoded GPG private key for artifact signing
- `GPG_KEYNAME` - GPG key identifier (email or key ID)
- `GPG_PASSPHRASE` - GPG key passphrase
- `CENTRAL_USERNAME` - Sonatype OSSRH username for Maven Central
- `CENTRAL_PASSWORD` - Sonatype OSSRH password for Maven Central
- `NPM_TOKEN` - NPM authentication token (required even though NPM isn't published separately)

### For Testing Workflows
- No additional secrets required beyond the standard `GITHUB_TOKEN`

## Branch Strategy

The workflow follows GitFlow conventions:

- **Feature branches** (`feature/*`): Run test workflow only
- **Develop branch** (`develop`): Run publish workflow, creates SNAPSHOT versions
- **Release branches** (`release/*`): Run publish workflow, creates RC versions
- **Main branch** (`main`): Run publish workflow, creates stable releases
- **Hotfix branches** (`hotfix/*`): Run publish workflow, creates patch versions

## Version Management

The workflow uses the `calculate-version.sh` script from the GitHub Actions library to:
- Determine the current version from `pom.xml`
- Calculate the next version based on branch type
- Update version files automatically
- Handle SNAPSHOT, RC, and stable version formats

## Troubleshooting

### Common Issues

1. **Frontend Build Failures**: Ensure the CI profile is properly configured and Node.js/NPM versions match
2. **Peer Dependency Conflicts**: The workflow uses `--legacy-peer-deps` to handle React 18 + Material-UI conflicts
3. **Version Calculation Errors**: Check that the `calculate-version.sh` script is accessible and the branch naming follows GitFlow conventions

### Debugging

To debug build issues locally:
```bash
# Run with verbose output
mvn clean compile test-compile -B -P ci package -X

# Check Node.js and NPM versions
node --version
npm --version

# Test frontend build separately
npm install --legacy-peer-deps
npm run build
```

## Integration Status

✅ **Completed**: 
- Workflow configuration updated to use develop branch
- Maven arguments configured for integrated build
- CI profile properly configured
- Local testing confirmed working
- Documentation created

🔄 **Next Steps**:
- Push changes to trigger GitHub Actions workflow
- Monitor workflow execution and fix any issues
- Test publishing workflow on appropriate branches