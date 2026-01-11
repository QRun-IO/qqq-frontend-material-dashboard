/**
 * Fixture server for Playwright e2e tests.
 *
 * Serves fixture JSON files from src/test/resources/fixtures/
 * mimicking the Javalin mock server used in Selenium tests.
 *
 * In CI mode (BUILD_DIR env var set), also serves the static React build
 * with SPA fallback routing. This eliminates the need for the React dev
 * server, avoiding webpack compilation timeout issues in CI.
 *
 * Usage:
 *   Local dev:  node e2e/fixture-server.js
 *   CI mode:    BUILD_DIR=build node e2e/fixture-server.js
 */
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.FIXTURE_PORT || 8001;
const FIXTURES_DIR = path.join(__dirname, '..', 'src', 'test', 'resources', 'fixtures');

// When BUILD_DIR is set, serve static React build files (CI mode)
const BUILD_DIR = process.env.BUILD_DIR
   ? path.join(__dirname, '..', process.env.BUILD_DIR)
   : null;

// Determine which metaData fixture to serve based on env var
const FIXTURE_NAME = process.env.THEME_FIXTURE || 'withFullCustomTheme';

// MIME types for static file serving
const MIME_TYPES = {
   '.html': 'text/html; charset=utf-8',
   '.js': 'application/javascript; charset=utf-8',
   '.mjs': 'application/javascript; charset=utf-8',
   '.css': 'text/css; charset=utf-8',
   '.json': 'application/json; charset=utf-8',
   '.png': 'image/png',
   '.jpg': 'image/jpeg',
   '.jpeg': 'image/jpeg',
   '.gif': 'image/gif',
   '.svg': 'image/svg+xml',
   '.ico': 'image/x-icon',
   '.woff': 'font/woff',
   '.woff2': 'font/woff2',
   '.ttf': 'font/ttf',
   '.eot': 'application/vnd.ms-fontobject',
   '.otf': 'font/otf',
   '.map': 'application/json',
   '.txt': 'text/plain; charset=utf-8',
   '.webp': 'image/webp',
   '.webmanifest': 'application/manifest+json',
};

// API route patterns - these are checked BEFORE static file serving
const API_PATTERNS = [
   /^\/metaData/,
   /^\/api\//,
   /^\/qqq\//,
   /^\/data\//,
   /^\/processes/,
   /^\/manageSession/,
   /^\/possibleValues/,
   /^\/widget/,
   /^\/serverInfo/,
];

function isApiRoute(pathname) {
   return API_PATTERNS.some(pattern => pattern.test(pathname));
}

function loadFixture(relativePath) {
   const fixturePath = path.join(FIXTURES_DIR, relativePath);
   if (fs.existsSync(fixturePath)) {
      try {
         return JSON.parse(fs.readFileSync(fixturePath, 'utf8'));
      } catch (err) {
         console.error(`Error parsing fixture ${fixturePath}:`, err);
         return null;
      }
   }
   return null;
}

function loadFixtureRaw(relativePath) {
   const fixturePath = path.join(FIXTURES_DIR, relativePath);
   if (fs.existsSync(fixturePath)) {
      return fs.readFileSync(fixturePath, 'utf8');
   }
   return null;
}

function serveJson(res, data) {
   res.writeHead(200, { 'Content-Type': 'application/json' });
   res.end(JSON.stringify(data));
}

function serve404(res, pathname) {
   console.log(`404: ${pathname}`);
   res.writeHead(404, { 'Content-Type': 'application/json' });
   res.end(JSON.stringify({ error: 'Not found', path: pathname }));
}

/**
 * Serve a static file from the build directory.
 * Returns true if file was served, false otherwise.
 */
function serveStaticFile(res, pathname) {
   if (!BUILD_DIR) return false;

   // Normalize pathname (remove leading slash for path.join)
   let relativePath = pathname === '/' ? 'index.html' : pathname.slice(1);
   let filePath = path.join(BUILD_DIR, relativePath);

   // Security: prevent directory traversal
   if (!filePath.startsWith(BUILD_DIR)) {
      return false;
   }

   // If path is a directory, try index.html
   if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
      filePath = path.join(filePath, 'index.html');
   }

   // If file exists, serve it
   if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      const ext = path.extname(filePath).toLowerCase();
      const contentType = MIME_TYPES[ext] || 'application/octet-stream';

      try {
         const content = fs.readFileSync(filePath);
         res.writeHead(200, { 'Content-Type': contentType });
         res.end(content);
         return true;
      } catch (err) {
         console.error(`Error reading file ${filePath}:`, err);
         return false;
      }
   }

   return false;
}

/**
 * SPA fallback: serve index.html for client-side routes.
 * This enables React Router to handle routes like /testApp/person.
 */
function serveSpaFallback(res) {
   if (!BUILD_DIR) return false;

   const indexPath = path.join(BUILD_DIR, 'index.html');
   if (fs.existsSync(indexPath)) {
      try {
         const content = fs.readFileSync(indexPath);
         res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
         res.end(content);
         return true;
      } catch (err) {
         console.error('Error reading index.html:', err);
         return false;
      }
   }
   return false;
}

/**
 * Handle API fixture routes.
 * Returns true if request was handled, false otherwise.
 */
function handleApiRoute(req, res, pathname, searchParams) {
   // =========================================================================
   // METADATA ROUTES
   // =========================================================================

   // /metaData endpoint - return main metadata with theme
   if (pathname === '/metaData' || pathname === '/metaData/' || pathname === '/api/metaData') {
      const data = loadFixture(`metaData/${FIXTURE_NAME}.json`);
      if (data) {
         serveJson(res, data);
         return true;
      }
      // Fallback to index.json
      const fallback = loadFixture('metaData/index.json');
      if (fallback) {
         serveJson(res, fallback);
         return true;
      }
   }

   // /metaData/authentication - authentication config
   if (pathname === '/metaData/authentication' || pathname === '/api/metaData/authentication') {
      const data = loadFixture('metaData/authentication.json');
      if (data) {
         serveJson(res, data);
         return true;
      }
   }

   // /metaData/table/{tableName} - table metadata
   const tableMetaMatch = pathname.match(/^\/metaData\/table\/(\w+)$/);
   if (tableMetaMatch) {
      const tableName = tableMetaMatch[1];
      const data = loadFixture(`metaData/table/${tableName}.json`);
      if (data) {
         serveJson(res, data);
         return true;
      }
      // If specific table not found, return generic person table
      const personData = loadFixture('metaData/table/person.json');
      if (personData) {
         serveJson(res, personData);
         return true;
      }
   }

   // /metaData/process/{processName} - process metadata
   const processMetaMatch = pathname.match(/^\/metaData\/process\/(.+)$/);
   if (processMetaMatch) {
      const processName = processMetaMatch[1];
      const data = loadFixture(`metaData/process/${processName}.json`);
      if (data) {
         serveJson(res, data);
         return true;
      }
   }

   // =========================================================================
   // QQQ API v1 ROUTES
   // =========================================================================

   // /qqq/v1/metaData/table/{tableName} - API table metadata
   const apiTableMetaMatch = pathname.match(/^\/qqq\/v1\/metaData\/table\/(\w+)$/);
   if (apiTableMetaMatch) {
      const tableName = apiTableMetaMatch[1];
      const data = loadFixture(`qqq/v1/metaData/table/${tableName}.json`);
      if (data) {
         serveJson(res, data);
         return true;
      }
   }

   // /qqq/v1/table/{tableName}/query - table queries
   const queryMatch = pathname.match(/^\/qqq\/v1\/table\/(\w+)\/query$/);
   if (queryMatch) {
      const tableName = queryMatch[1];
      // Try specific query file first, then index.json
      let data = loadFixture(`qqq/v1/table/${tableName}/query.json`);
      if (!data) {
         data = loadFixture(`qqq/v1/table/${tableName}/index.json`);
      }
      if (data) {
         serveJson(res, data);
         return true;
      }
      // Default query response
      serveJson(res, {
         records: [
            { values: { id: 1, firstName: 'Test', lastName: 'User' } },
            { values: { id: 2, firstName: 'Another', lastName: 'Person' } }
         ],
         count: 2
      });
      return true;
   }

   // /qqq/v1/table/{tableName}/count - table counts
   const countMatch = pathname.match(/^\/qqq\/v1\/table\/(\w+)\/count$/);
   if (countMatch) {
      const tableName = countMatch[1];
      const data = loadFixture(`qqq/v1/table/${tableName}/count.json`);
      if (data) {
         serveJson(res, data);
         return true;
      }
      serveJson(res, { count: 2 });
      return true;
   }

   // /qqq/v1/table/{tableName}/variants - table variants
   const variantsMatch = pathname.match(/^\/qqq\/v1\/table\/(\w+)\/variants$/);
   if (variantsMatch) {
      const tableName = variantsMatch[1];
      const data = loadFixture(`qqq/v1/table/${tableName}/variants.json`);
      if (data) {
         serveJson(res, data);
         return true;
      }
      serveJson(res, { options: [] });
      return true;
   }

   // /qqq/v1/table/{tableName}/possibleValues/{fieldName} - possible values
   const pvMatch = pathname.match(/^\/qqq\/v1\/table\/(\w+)\/possibleValues\/(\w+)$/);
   if (pvMatch) {
      const tableName = pvMatch[1];
      const fieldName = pvMatch[2];
      // Check for query params like id=1
      const idParam = searchParams.get('id');
      if (idParam) {
         const data = loadFixture(`qqq/v1/table/${tableName}/possibleValues/${fieldName}=${idParam}.json`);
         if (data) {
            serveJson(res, data);
            return true;
         }
      }
      const data = loadFixture(`qqq/v1/table/${tableName}/possibleValues/${fieldName}.json`);
      if (data) {
         serveJson(res, data);
         return true;
      }
      serveJson(res, { options: [] });
      return true;
   }

   // /qqq/v1/table/{tableName}/{id} - single record
   const singleRecordMatch = pathname.match(/^\/qqq\/v1\/table\/(\w+)\/(\d+)$/);
   if (singleRecordMatch) {
      const tableName = singleRecordMatch[1];
      const recordId = singleRecordMatch[2];
      const data = loadFixture(`qqq/v1/table/${tableName}/${recordId}.json`);
      if (data) {
         serveJson(res, data);
         return true;
      }
      // Default single record response
      serveJson(res, { values: { id: parseInt(recordId), name: `Record ${recordId}` } });
      return true;
   }

   // =========================================================================
   // DATA ROUTES (legacy/alternate endpoints)
   // =========================================================================

   // /data/{tableName}/query - data queries
   const dataQueryMatch = pathname.match(/^\/data\/(\w+)\/query$/);
   if (dataQueryMatch) {
      const tableName = dataQueryMatch[1];
      let data = loadFixture(`data/${tableName}/query.json`);
      if (!data) {
         data = loadFixture(`data/${tableName}/index.json`);
      }
      if (data) {
         serveJson(res, data);
         return true;
      }
      serveJson(res, { records: [], count: 0 });
      return true;
   }

   // /data/{tableName}/count - data counts
   const dataCountMatch = pathname.match(/^\/data\/(\w+)\/count$/);
   if (dataCountMatch) {
      const tableName = dataCountMatch[1];
      const data = loadFixture(`data/${tableName}/count.json`);
      if (data) {
         serveJson(res, data);
         return true;
      }
      serveJson(res, { count: 0 });
      return true;
   }

   // /data/{tableName}/variants - data variants
   const dataVariantsMatch = pathname.match(/^\/data\/(\w+)\/variants$/);
   if (dataVariantsMatch) {
      const tableName = dataVariantsMatch[1];
      const data = loadFixture(`data/${tableName}/variants.json`);
      if (data) {
         serveJson(res, data);
         return true;
      }
      serveJson(res, { options: [] });
      return true;
   }

   // /data/{tableName}/possibleValues/{fieldName} - data possible values
   const dataPvMatch = pathname.match(/^\/data\/(\w+)\/possibleValues\/(\w+)$/);
   if (dataPvMatch) {
      const tableName = dataPvMatch[1];
      const fieldName = dataPvMatch[2];
      const idParam = searchParams.get('id');
      if (idParam) {
         const data = loadFixture(`data/${tableName}/possibleValues/${fieldName}=${idParam}.json`);
         if (data) {
            serveJson(res, data);
            return true;
         }
      }
      const data = loadFixture(`data/${tableName}/possibleValues/${fieldName}.json`);
      if (data) {
         serveJson(res, data);
         return true;
      }
      serveJson(res, { options: [] });
      return true;
   }

   // /data/{tableName}/{id} - single data record
   const dataSingleMatch = pathname.match(/^\/data\/(\w+)\/(\d+)$/);
   if (dataSingleMatch) {
      const tableName = dataSingleMatch[1];
      const recordId = dataSingleMatch[2];
      const data = loadFixture(`data/${tableName}/${recordId}.json`);
      if (data) {
         serveJson(res, data);
         return true;
      }
      serveJson(res, { values: { id: parseInt(recordId) } });
      return true;
   }

   // =========================================================================
   // PROCESS ROUTES
   // =========================================================================

   // /processes/querySavedView/init - saved view init (with optional id param)
   if (pathname === '/processes/querySavedView/init') {
      const idParam = searchParams.get('id');
      if (idParam) {
         const data = loadFixture(`processes/querySavedView/init-id=${idParam}.json`);
         if (data) {
            serveJson(res, data);
            return true;
         }
      }
      const data = loadFixture('processes/querySavedView/init.json');
      if (data) {
         serveJson(res, data);
         return true;
      }
      serveJson(res, { values: {} });
      return true;
   }

   // /processes/{processName}/init - process init
   const processInitMatch = pathname.match(/^\/processes\/([^\/]+)\/init$/);
   if (processInitMatch) {
      const processName = processInitMatch[1];
      const data = loadFixture(`processes/${processName}/init.json`);
      if (data) {
         serveJson(res, data);
         return true;
      }
      // Default process init response with UUID
      serveJson(res, {
         processUUID: '74a03a7d-2f53-4784-9911-3a21f7646c43',
         values: {}
      });
      return true;
   }

   // /processes/{processName}/{uuid}/step/{stepName} - process step
   const processStepMatch = pathname.match(/^\/processes\/([^\/]+)\/([^\/]+)\/step\/([^\/]+)$/);
   if (processStepMatch) {
      const processName = processStepMatch[1];
      const processUUID = processStepMatch[2];
      const stepName = processStepMatch[3];

      console.log(`[PROCESS STEP] ${req.method} ${pathname} -> step: ${stepName}`);

      // Track POST count per process UUID and step for multi-step flows
      const processStateKey = `${processUUID}-${stepName}-post-count`;
      if (!global.processState) {
         global.processState = {};
      }

      // For POST requests, handle step progression
      if (req.method === 'POST') {
         // Increment POST count for this step
         global.processState[processStateKey] = (global.processState[processStateKey] || 0) + 1;
         const postCount = global.processState[processStateKey];
         console.log(`[PROCESS STEP] POST #${postCount} to ${stepName}`);

         // POST to edit step (Next button) - return edit.json with nextStep: review
         if (stepName === 'edit') {
            console.log(`[PROCESS STEP] POST to edit - returning edit.json (nextStep: review)`);
            const data = loadFixture(`processes/${processName}/step/edit.json`);
            if (data) {
               serveJson(res, data);
               return true;
            }
         }

         // POST to review step - handle validation vs submit
         if (stepName === 'review') {
            if (postCount === 1) {
               // First POST to review: validation - return review.json with validation summary
               console.log(`[PROCESS STEP] POST #1 to review - returning review.json (validation summary)`);
               const reviewData = loadFixture(`processes/${processName}/step/review.json`);
               if (reviewData) {
                  serveJson(res, reviewData);
                  return true;
               }
            } else {
               // Second+ POST to review: submit - return result.json
               console.log(`[PROCESS STEP] POST #${postCount} to review - returning result.json (submit)`);
               const resultData = loadFixture(`processes/${processName}/step/result.json`);
               if (resultData) {
                  serveJson(res, resultData);
                  return true;
               }
            }
         }
      }

      // For GET requests, return the step's fixture
      // Special case: for review step, return initial state (no validationSummary)
      if (req.method === 'GET' && stepName === 'review') {
         console.log(`[PROCESS STEP] GET to review - returning review-initial.json (validation options)`);
         const initialData = loadFixture(`processes/${processName}/step/review-initial.json`);
         if (initialData) {
            serveJson(res, initialData);
            return true;
         }
      }

      console.log(`[PROCESS STEP] ${req.method} to ${stepName} - returning ${stepName}.json`);
      const data = loadFixture(`processes/${processName}/step/${stepName}.json`);
      if (data) {
         serveJson(res, data);
         return true;
      }
      serveJson(res, { values: {} });
      return true;
   }

   // /processes/{processName}/{uuid}/records - process records
   const processRecordsMatch = pathname.match(/^\/processes\/([^\/]+)\/([^\/]+)\/records$/);
   if (processRecordsMatch) {
      const processName = processRecordsMatch[1];
      const data = loadFixture(`processes/${processName}/records.json`);
      if (data) {
         serveJson(res, data);
         return true;
      }
      serveJson(res, []);
      return true;
   }

   // =========================================================================
   // WIDGET ROUTES
   // =========================================================================

   // /widget/{widgetName} - widget data
   const widgetMatch = pathname.match(/^\/widget\/(\w+)$/);
   if (widgetMatch) {
      const widgetName = widgetMatch[1];
      const data = loadFixture(`widget/${widgetName}.json`);
      if (data) {
         serveJson(res, data);
         return true;
      }
      // Default widget response
      const emptyData = loadFixture('widget/empty.json');
      if (emptyData) {
         serveJson(res, emptyData);
         return true;
      }
      serveJson(res, {});
      return true;
   }

   // =========================================================================
   // SESSION & SERVER ROUTES
   // =========================================================================

   // /manageSession - session management
   if (pathname === '/manageSession' || pathname === '/api/manageSession') {
      serveJson(res, {
         uuid: 'test-session-uuid',
         values: {}
      });
      return true;
   }

   // /serverInfo - server info
   if (pathname === '/serverInfo' || pathname === '/api/serverInfo') {
      serveJson(res, {
         startTime: new Date().toISOString(),
         buildTime: new Date().toISOString(),
         version: 'test-0.0.0'
      });
      return true;
   }

   return false;
}

const server = http.createServer((req, res) => {
   // Enable CORS for local development
   res.setHeader('Access-Control-Allow-Origin', '*');
   res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
   res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

   if (req.method === 'OPTIONS') {
      res.writeHead(204);
      res.end();
      return;
   }

   const url = new URL(req.url, `http://localhost:${PORT}`);
   const pathname = url.pathname;
   const searchParams = url.searchParams;

   // 1. Check API routes first (highest priority)
   if (isApiRoute(pathname)) {
      if (handleApiRoute(req, res, pathname, searchParams)) {
         return;
      }
      // API route matched pattern but no handler - 404
      serve404(res, pathname);
      return;
   }

   // 2. In CI mode, try to serve static file from build directory
   if (BUILD_DIR) {
      if (serveStaticFile(res, pathname)) {
         return;
      }

      // 3. SPA fallback: serve index.html for client-side routes
      if (serveSpaFallback(res)) {
         return;
      }
   }

   // 4. Default 404
   serve404(res, pathname);
});

server.listen(PORT, () => {
   console.log(`Fixture server running on http://localhost:${PORT}`);
   console.log(`Using fixture: ${FIXTURE_NAME}`);
   if (BUILD_DIR) {
      console.log(`CI mode: Serving static build from ${BUILD_DIR}`);
   } else {
      console.log(`Dev mode: API fixtures only (use React dev server for frontend)`);
   }
});
