/**
 * Simple fixture server for Playwright e2e tests.
 * Serves fixture JSON files from src/test/resources/fixtures/
 * mimicking the Javalin mock server used in Selenium tests.
 */
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.FIXTURE_PORT || 8001;
const FIXTURES_DIR = path.join(__dirname, '..', 'src', 'test', 'resources', 'fixtures');

// Determine which metaData fixture to serve based on env var
const FIXTURE_NAME = process.env.THEME_FIXTURE || 'withFullCustomTheme';

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

   // Support per-request fixture selection via ?fixture=name query parameter
   // This allows unthemed tests to request the 'index' fixture explicitly
   const requestedFixture = url.searchParams.get('fixture') || FIXTURE_NAME;

   // /metaData endpoint - return main metadata with theme
   if (pathname === '/metaData' || pathname === '/metaData/' || pathname === '/api/metaData') {
      const data = loadFixture(`metaData/${requestedFixture}.json`);
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

   // /metaData/process/{processName} - process metadata (supports dots in name like person.bulkEdit)
   const processMetaMatch = pathname.match(/^\/metaData\/process\/(.+)$/);
   if (processMetaMatch) {
      const processName = processMetaMatch[1];
      const data = loadFixture(`metaData/process/${processName}.json`);
      if (data) {
         serveJson(res, data);
         return;
      }
      // Default process metadata response (wrapped in 'process' key)
      serveJson(res, {
         process: {
            name: processName,
            label: processName.charAt(0).toUpperCase() + processName.slice(1).replace(/([A-Z])/g, ' $1'),
            tableName: 'person',
            frontendSteps: [
               { name: 'input', label: 'Input', stepType: 'frontend', formFields: [], components: [] },
               { name: 'review', label: 'Review', stepType: 'frontend', recordListFields: [], components: [] },
               { name: 'result', label: 'Result', stepType: 'frontend', components: [{ type: 'PROCESS_SUMMARY_RESULTS' }] }
            ]
         }
      });
      return;
   }

   // /processes/{processName}/init - process init
   const processInitMatch = pathname.match(/^\/processes\/(\w+)\/init$/);
   if (processInitMatch) {
      const processName = processInitMatch[1];
      const data = loadFixture(`processes/${processName}/init.json`);
      if (data) {
         serveJson(res, data);
         return;
      }
      // Default process init response with stepper and UUID
      serveJson(res, {
         processUUID: 'test-process-uuid-12345',
         values: {},
         processMetaData: {
            name: processName,
            label: processName,
            frontendSteps: [
               { name: 'input', label: 'Input', stepType: 'frontend', formFields: [], components: [] },
               { name: 'review', label: 'Review', stepType: 'frontend', recordListFields: [], components: [] },
               { name: 'result', label: 'Result', stepType: 'frontend', components: [{ type: 'PROCESS_SUMMARY_RESULTS' }] }
            ]
         },
         nextStep: 'input'
      });
      return;
   }

   // /processes/{processName}/{uuid}/records - get process records
   const processRecordsMatch = pathname.match(/^\/processes\/(\w+)\/([^\/]+)\/records$/);
   if (processRecordsMatch) {
      serveJson(res, {
         records: [],
         count: 0
      });
      return;
   }

   // /processes/{processName}/{uuid}/step/{stepName} - process step with UUID
   const processStepWithUuidMatch = pathname.match(/^\/processes\/(\w+)\/([^\/]+)\/step\/(\w+)$/);
   if (processStepWithUuidMatch) {
      const processName = processStepWithUuidMatch[1];
      const uuid = processStepWithUuidMatch[2];
      const stepName = processStepWithUuidMatch[3];
      // Return next step
      serveJson(res, {
         processUUID: uuid,
         values: {},
         processMetaData: {
            name: processName,
            label: processName,
            frontendSteps: [
               { name: 'input', label: 'Input', stepType: 'frontend', formFields: [], components: [] },
               { name: 'review', label: 'Review', stepType: 'frontend', recordListFields: [], components: [] },
               { name: 'result', label: 'Result', stepType: 'frontend', components: [{ type: 'PROCESS_SUMMARY_RESULTS' }] }
            ]
         },
         nextStep: stepName === 'input' ? 'review' : (stepName === 'review' ? 'result' : null),
         processResults: stepName === 'result' ? { message: 'Process completed successfully!' } : undefined
      });
      return;
   }

   // /processes/{processName}/step/{stepName} - process step (legacy, no UUID)
   const processStepMatch = pathname.match(/^\/processes\/(\w+)\/step\/(\w+)$/);
   if (processStepMatch) {
      const processName = processStepMatch[1];
      const stepName = processStepMatch[2];
      // Return next step
      serveJson(res, {
         processUUID: 'test-process-uuid-12345',
         values: {},
         processMetaData: {
            name: processName,
            label: processName,
            frontendSteps: [
               { name: 'input', label: 'Input', stepType: 'frontend', formFields: [], components: [] },
               { name: 'review', label: 'Review', stepType: 'frontend', recordListFields: [], components: [] },
               { name: 'result', label: 'Result', stepType: 'frontend', components: [{ type: 'PROCESS_SUMMARY_RESULTS' }] }
            ]
         },
         nextStep: stepName === 'input' ? 'review' : (stepName === 'review' ? 'result' : null),
         processResults: stepName === 'result' ? { message: 'Process completed successfully!' } : undefined
      });
      return;
   }

   // /widget/{widgetName} - widget data
   const widgetMatch = pathname.match(/^\/widget\/(.+)$/);
   if (widgetMatch) {
      const widgetName = widgetMatch[1];
      const data = loadFixture(`widget/${widgetName}.json`);
      if (data) {
         serveJson(res, data);
         return;
      }
      // Default empty widget response
      serveJson(res, {
         type: 'table',
         data: []
      });
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

   // /data/{tableName}/count - alternate count endpoint
   const dataCountMatch = pathname.match(/^\/data\/(\w+)\/count$/);
   if (dataCountMatch) {
      serveJson(res, { count: 2 });
      return;
   }

   // /data/{tableName}/{id} - alternate single record lookup
   const dataRecordMatch = pathname.match(/^\/data\/(\w+)\/(\d+)$/);
   if (dataRecordMatch) {
      const tableName = dataRecordMatch[1];
      const recordId = dataRecordMatch[2];
      serveJson(res, {
         values: {
            id: parseInt(recordId),
            firstName: recordId === '1' ? 'John' : 'Jane',
            lastName: recordId === '1' ? 'Doe' : 'Smith',
            email: recordId === '1' ? 'john.doe@example.com' : 'jane.smith@example.com',
            birthDate: '1990-01-15',
            createDate: '2024-01-01T00:00:00Z',
            modifyDate: '2024-01-01T00:00:00Z'
         },
         tableName: tableName
      });
      return;
   }

   // /qqq/v1/table/{tableName}/{id} - single record lookup
   const recordMatch = pathname.match(/^\/qqq\/v1\/table\/(\w+)\/(\d+)$/);
   if (recordMatch) {
      const tableName = recordMatch[1];
      const recordId = recordMatch[2];
      const data = loadFixture(`qqq/v1/table/${tableName}/${recordId}.json`);
      if (data) {
         serveJson(res, data);
         return;
      }
      // Default person record response
      serveJson(res, {
         values: {
            id: parseInt(recordId),
            firstName: recordId === '1' ? 'John' : 'Jane',
            lastName: recordId === '1' ? 'Doe' : 'Smith',
            email: recordId === '1' ? 'john.doe@example.com' : 'jane.smith@example.com',
            birthDate: '1990-01-15',
            createDate: '2024-01-01T00:00:00Z',
            modifyDate: '2024-01-01T00:00:00Z'
         },
         tableName: tableName
      });
      return;
   }

   // Default 404
   serve404(res, pathname);
});

server.listen(PORT, () => {
   console.log(`Fixture server running on http://localhost:${PORT}`);
   console.log(`Using fixture: ${FIXTURE_NAME}`);
});
