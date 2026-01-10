/**
 * Combined fixture server for Playwright e2e tests.
 * Serves:
 * 1. Static React build from build/ directory
 * 2. Fixture JSON files from src/test/resources/fixtures/
 *
 * This allows e2e tests to run against a production build
 * without needing a proxy between frontend and API.
 */
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.FIXTURE_PORT || 8001;
const FIXTURES_DIR = path.join(__dirname, '..', 'src', 'test', 'resources', 'fixtures');
const BUILD_DIR = path.join(__dirname, '..', 'build');

// Determine which metaData fixture to serve based on env var
const FIXTURE_NAME = process.env.THEME_FIXTURE || 'withFullCustomTheme';

// MIME types for static file serving
const MIME_TYPES = {
   '.html': 'text/html',
   '.js': 'application/javascript',
   '.css': 'text/css',
   '.json': 'application/json',
   '.png': 'image/png',
   '.jpg': 'image/jpeg',
   '.jpeg': 'image/jpeg',
   '.gif': 'image/gif',
   '.svg': 'image/svg+xml',
   '.ico': 'image/x-icon',
   '.woff': 'font/woff',
   '.woff2': 'font/woff2',
   '.ttf': 'font/ttf',
   '.map': 'application/json'
};

function loadFixture(relativePath) {
   const fixturePath = path.join(FIXTURES_DIR, relativePath);
   if (fs.existsSync(fixturePath)) {
      return JSON.parse(fs.readFileSync(fixturePath, 'utf8'));
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

function serveStaticFile(res, pathname) {
   // Map pathname to file in build directory
   let filePath = path.join(BUILD_DIR, pathname);

   // For SPA routing, serve index.html for non-file paths
   if (!path.extname(pathname)) {
      filePath = path.join(BUILD_DIR, 'index.html');
   }

   // Check if file exists
   if (!fs.existsSync(filePath)) {
      // Fall back to index.html for SPA routing
      filePath = path.join(BUILD_DIR, 'index.html');
   }

   if (!fs.existsSync(filePath)) {
      return false;
   }

   const ext = path.extname(filePath);
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

   // /metaData endpoint - return main metadata with theme
   if (pathname === '/metaData' || pathname === '/metaData/' || pathname === '/api/metaData') {
      const data = loadFixture(`metaData/${FIXTURE_NAME}.json`);
      if (data) {
         serveJson(res, data);
         return;
      }
   }

   // /metaData/authentication - authentication config
   if (pathname === '/metaData/authentication' || pathname === '/api/metaData/authentication') {
      const data = loadFixture('metaData/authentication.json');
      if (data) {
         serveJson(res, data);
         return;
      }
   }

   // /metaData/table/{tableName} - table metadata
   const tableMetaMatch = pathname.match(/^\/metaData\/table\/(\w+)$/);
   if (tableMetaMatch) {
      const tableName = tableMetaMatch[1];
      const data = loadFixture(`metaData/table/${tableName}.json`);
      if (data) {
         serveJson(res, data);
         return;
      }
      // If specific table not found, return generic person table
      const personData = loadFixture('metaData/table/person.json');
      if (personData) {
         serveJson(res, personData);
         return;
      }
   }

   // /qqq/v1/metaData/table/{tableName} - API table metadata
   const apiTableMetaMatch = pathname.match(/^\/qqq\/v1\/metaData\/table\/(\w+)$/);
   if (apiTableMetaMatch) {
      const tableName = apiTableMetaMatch[1];
      const data = loadFixture(`qqq/v1/metaData/table/${tableName}.json`);
      if (data) {
         serveJson(res, data);
         return;
      }
   }

   // /processes/querySavedView/init - saved view init
   if (pathname === '/processes/querySavedView/init') {
      const data = loadFixture('processes/querySavedView/init.json');
      if (data) {
         serveJson(res, data);
         return;
      }
      // Default response if fixture not found
      serveJson(res, { values: {} });
      return;
   }

   // /manageSession - session management
   if (pathname === '/manageSession' || pathname === '/api/manageSession') {
      serveJson(res, {
         uuid: 'test-session-uuid',
         values: {}
      });
      return;
   }

   // /qqq/v1/table/{tableName}/query - table queries
   const queryMatch = pathname.match(/^\/qqq\/v1\/table\/(\w+)\/query$/);
   if (queryMatch) {
      const tableName = queryMatch[1];
      const data = loadFixture(`qqq/v1/table/${tableName}/query.json`);
      if (data) {
         serveJson(res, data);
         return;
      }
      // Default query response
      serveJson(res, {
         records: [
            { values: { id: 1, firstName: 'Test', lastName: 'User' } },
            { values: { id: 2, firstName: 'Another', lastName: 'Person' } }
         ],
         count: 2
      });
      return;
   }

   // /qqq/v1/table/{tableName}/count - table counts
   const countMatch = pathname.match(/^\/qqq\/v1\/table\/(\w+)\/count$/);
   if (countMatch) {
      const tableName = countMatch[1];
      const data = loadFixture(`qqq/v1/table/${tableName}/count.json`);
      if (data) {
         serveJson(res, data);
         return;
      }
      serveJson(res, { count: 2 });
      return;
   }

   // /data/{tableName}/query - alternate query endpoint
   const dataQueryMatch = pathname.match(/^\/data\/(\w+)\/query$/);
   if (dataQueryMatch) {
      serveJson(res, {
         records: [],
         count: 0
      });
      return;
   }

   // Try serving static file (for React build)
   if (serveStaticFile(res, pathname)) {
      return;
   }

   // Default 404
   serve404(res, pathname);
});

server.listen(PORT, () => {
   console.log(`Fixture server running on http://localhost:${PORT}`);
   console.log(`Using fixture: ${FIXTURE_NAME}`);
});
