# Path-Agnostic SPA Implementation for qfmd

## Overview

The qfmd (Material Dashboard) SPA is now fully path-agnostic. It can be hosted at any path (/, /admin, /dashboard, etc.) without requiring any configuration or rebuild.

### Key Design: Separation of SPA and API Paths

- **SPA Assets**: Can be hosted at any path (e.g., `/admin`, `/dashboard`, `/`)
- **API Endpoints**: Always served from the root path (/) regardless of the SPA's location
  - `/metaData/authentication` (always at root)
  - `/qqq/v1/data/person` (always at root)
  - `/qqq-api/` (always at root)

This separation allows maximum flexibility: change the SPA's hosting path without affecting API routing.

## Key Changes

### 1. New File: `src/qqq/utils/PathUtils.ts`

This utility provides two functions for path detection:

- **`detectBasePath(): string`** - Detects the base path where the SPA is running
  - Used for React Router basename configuration
  - Used for serving static assets from the correct path
  - Primary strategy: Extracts path from the current script's source location
  - Fallback: Detects from known SPA path patterns in `window.location.pathname`
  - Default: Returns "/" if no path is detected

- **`logBasePathDetection(): void`** - Logs the detected base path for debugging

### 2. Updated: `src/qqq/utils/qqq/Client.ts`

The Client class detects the SPA base path for logging/routing but **always uses the root path for API calls**:

```typescript
private static initializeBasePath(): void {
  if (!this.basePath) {
    this.basePath = detectBasePath();
    console.log(`[QQQ] SPA base path detected: ${this.basePath}`);
    console.log("[QQQ] API calls will be directed to root path (/, /metaData, /qqq/v1, etc.)");
  }
}

public static getInstance(): QController {
  if (this.qController == null) {
    this.initializeBasePath();
    // APIs are always served from root (/) regardless of SPA base path
    // Empty string baseUrl means use the current origin as the base
    this.qController = new QController("", this.handleException);
  }
  return this.qController;
}

public static getInstanceV1(path: string = "/qqq/v1"): QControllerV1 {
  if (this.qControllerV1 == null) {
    this.initializeBasePath();
    // APIs are always served from root (/), not from the SPA's base path
    this.qControllerV1 = new QControllerV1(path, this.handleException);
  }
  return this.qControllerV1;
}
```

**Key Point**: Both controllers use root-relative paths (`""` and `/qqq/v1`) so all API calls go to the root.

### 3. Updated: `src/index.tsx`

React Router is configured with the detected base path (for routing only):

```typescript
import {detectBasePath, logBasePathDetection} from "qqq/utils/PathUtils";

// Log base path detection for debugging
logBasePathDetection();

// Get the detected base path for React Router
const basename = detectBasePath();

// Use basename in all BrowserRouter instances
root.render(<BrowserRouter basename={basename}>
  <Auth0RouterBody />
</BrowserRouter>);
```

## How It Works

### Runtime Detection & Request Flow

#### Example: SPA hosted at `/admin`

**Server Configuration:**
```java
.withAdditionalRouteProvider(
   new IsolatedSpaRouteProvider("/admin", "material-dashboard")
      .withLoadFromJar(true)
      .withSpaIndexFile("material-dashboard/index.html")
)
```

**What happens on page load:**

1. Browser requests: `http://localhost:8000/admin/`
2. Javalin's `IsolatedSpaRouteProvider` serves the bundled `index.html`
3. React app loads scripts from: `http://localhost:8000/admin/static/js/main.abc123.js`
4. `detectBasePath()` extracts `/admin` from the script source
5. React Router is configured with `basename="/admin"`
6. `Client.getInstance()` is called:
   - Detects base path: `/admin` (for logging)
   - Creates QController with `baseURL: ""` (root-relative)

**User navigates to `/admin/apps`:**
- Browser URL: `http://localhost:8000/admin/apps`
- React Router (with `basename="/admin"`) sees path: `/apps`
- Correct component renders ✅

**App fetches authentication metadata:**
- Component calls: `Client.getInstance().getAuthenticationMetaData()`
- QController with `baseURL: ""` makes request to: `/metaData/authentication`
- Request goes to: `http://localhost:8000/metaData/authentication` ✅
- Server returns authentication data from root path

**App queries data:**
- Component calls: `Client.getInstance().getTableMetaData("person")`
- QController makes request to: `/data/person`
- Request goes to: `http://localhost:8000/data/person` ✅
- Server returns table metadata from root path

#### Example: Change SPA to `/dashboard`

**Just change Server.java:**
```java
.withAdditionalRouteProvider(
   new IsolatedSpaRouteProvider("/dashboard", "material-dashboard")
      .withLoadFromJar(true)
)
```

**What happens:**
- Scripts now load from: `http://localhost:8000/dashboard/static/js/main.abc123.js`
- Detection extracts: `/dashboard`
- React Router uses: `basename="/dashboard"`
- **API calls still go to root** (no change needed) ✅
- **All routing still works** (deep linking, navigation, etc.) ✅
- **No rebuild, no code changes** ✅

### Path Detection Strategy

The detection uses a multi-strategy approach for maximum reliability:

1. **Primary**: Extracts from `document.currentScript.src`
   - Most reliable as it directly identifies the script's load location
   - Example: `/admin/static/js/main.abc123.js` → `/admin`
   - Works regardless of how the user navigated to the app
   
2. **Fallback**: Checks known SPA path patterns in `window.location.pathname`
   - Useful if primary detection fails
   - Supports known paths: "admin", "dashboard", "app", "manager", "console"
   - Example: `window.location.pathname = "/admin/apps"` → `/admin`
   
3. **Default**: Falls back to "/" if detection fails
   - Ensures the SPA always has a valid base path
   - Example: Root deployment → `/`

## API Request Flow Examples

### Example 1: SPA at `/admin`, APIs at `/`

```
User navigates to: http://localhost:8000/admin/apps

React Router flow (using basename="/admin"):
  - Page URL: /admin/apps
  - basename: /admin
  - Rendered route: /apps ✅

API call flow (using baseURL=""):
  - Component: qController.getMetaData()
  - axios baseURL: "" (empty = root-relative)
  - Full URL: http://localhost:8000/metaData/... ✅
```

### Example 2: SPA at `/`, APIs at `/`

```
User navigates to: http://localhost:8000/apps

React Router flow (using basename="/"):
  - Page URL: /apps
  - basename: / (no prefix)
  - Rendered route: /apps ✅

API call flow (using baseURL=""):
  - Component: qController.getMetaData()
  - axios baseURL: "" (empty = root-relative)
  - Full URL: http://localhost:8000/metaData/... ✅
```

### Example 3: SPA at `/dashboard`, APIs at `/`

```
User navigates to: http://localhost:8000/dashboard/records

React Router flow (using basename="/dashboard"):
  - Page URL: /dashboard/records
  - basename: /dashboard
  - Rendered route: /records ✅

API call flow (using baseURL=""):
  - Component: qController.getTableMetaData("person")
  - axios baseURL: "" (empty = root-relative)
  - Full URL: http://localhost:8000/data/person ✅
```

## Features Enabled

✅ **Deep Linking** - Routes like `/admin/apps/123` work correctly after page refresh
✅ **Dynamic SPA Paths** - Can host at any path without configuration or rebuild
✅ **Root-Level APIs** - All API endpoints remain at root path regardless of SPA location
✅ **Static Assets** - Served from SPA's path (e.g., `/admin/static/js/main.js`)
✅ **No Configuration** - SPA adapts automatically to its hosting path
✅ **No Rebuild** - Same compiled JAR works at any path
✅ **Backward Compatible** - Works perfectly at root path (/)

## Debug Logging

The SPA logs its configuration on startup:

```
[QQQ] Detected SPA base path: /admin
[QQQ] API calls will be directed to root path (/, /metaData, /qqq/v1, etc.)
[QQQ] SPA base path detected: /admin
[QQQ] API calls will be directed to root path (/, /metaData, /qqq/v1, etc.)
```

## Implementation Notes

### Why This Design?

1. **APIs are centralized at root**: Simplifies backend configuration and routing rules
2. **SPA can be anywhere**: Frontend can be deployed at any sub-path without backend changes
3. **Clean separation of concerns**: Router handles SPA routing, HTTP client handles API routing
4. **No URL rewriting needed**: No proxy rules or URL rewrites required

### Supported Hosting Paths

By default, the detection recognizes these path patterns:
- `/` (root)
- `/admin`
- `/dashboard`
- `/app`
- `/manager`
- `/console`

To add more paths, edit the allowed list in `PathUtils.ts`:

```typescript
if (["admin", "dashboard", "app", "manager", "console"].includes(firstPart))
```

## Testing the Implementation

### Test Case 1: Root Deployment
- Deploy SPA at: `/`
- Expected API calls: `/metaData/...`, `/data/...`
- Deep linking: `/apps/123` should work ✅

### Test Case 2: Subpath Deployment  
- Deploy SPA at: `/admin`
- Expected UI paths: `/admin/apps`, `/admin/records`
- Expected API calls: `/metaData/...`, `/data/...` (still at root)
- Deep linking: `/admin/apps/123` should work ✅

### Test Case 3: Multiple SPAs
- Deploy admin SPA at: `/admin`
- Deploy dashboard SPA at: `/dashboard`
- Both should use same APIs at: `/metaData/...`, `/data/...` ✅

## Deployment Benefits

1. **Single Build Artifact**: One compiled JAR works in all environments
2. **Flexible Hosting**: Can host at any path without recompilation
3. **Easy Configuration**: Only configure the path in Server.java, SPA adapts automatically
4. **Simplified Backend**: No need for path-specific API endpoints
5. **Framework Agnostic**: Works with any hosting platform that can serve static files
6. **No Runtime Configuration**: No environment variables or config files needed for paths

## Migration from Previous Versions

If previously the SPA was hardcoded to expect APIs at a specific path, this implementation automatically adapts:

- Old: SPA at `/admin` expected APIs at `/admin/metaData`
- New: SPA at `/admin` automatically uses APIs at `/metaData`
- Old: Changing path required rebuilding with new API base path
- New: Changing path requires only Server.java configuration change


