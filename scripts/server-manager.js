#!/usr/bin/env node

/**
 * Server Manager Script for Maven Integration
 * Handles starting and stopping the React development server
 */

const { spawn, exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const PID_FILE = path.join(__dirname, '..', '.react-server.pid');
const PORT = process.env.PORT || 3001;

function writePidFile(pid) {
    fs.writeFileSync(PID_FILE, pid.toString());
}

function readPidFile() {
    try {
        return fs.readFileSync(PID_FILE, 'utf8').trim();
    } catch (error) {
        return null;
    }
}

function deletePidFile() {
    try {
        fs.unlinkSync(PID_FILE);
    } catch (error) {
        // Ignore if file doesn't exist
    }
}

function isServerRunning(pid) {
    try {
        process.kill(pid, 0);
        return true;
    } catch (error) {
        return false;
    }
}

function waitForServer(maxAttempts = 30, interval = 1000) {
    return new Promise((resolve, reject) => {
        let attempts = 0;
        
        // Detect CI environment for different behavior
        const isCI = process.env.CI === 'true' || process.env.GITHUB_ACTIONS === 'true' || process.env.QQQ_SELENIUM_HEADLESS === 'true';
        
        if (isCI) {
            console.log('🔍 CI environment detected - using extended server wait parameters');
            maxAttempts = Math.max(maxAttempts, 60); // Minimum 60 attempts in CI
            interval = Math.max(interval, 2000);     // Minimum 2 second intervals in CI
        }
        
        const checkServer = () => {
            attempts++;
            
            // Use curl to check if server is ready (more reliable for HTTPS)
            const { exec } = require('child_process');
            const curlCommand = `curl -k -s -o /dev/null -w "%{http_code}" https://localhost:${PORT}`;
            
            exec(curlCommand, (error, stdout, stderr) => {
                if (stdout && stdout.trim() !== '000') {
                    console.log(`✅ React server is ready on port ${PORT} (HTTP ${stdout.trim()}) after ${attempts} attempts`);
                    resolve();
                } else if (attempts >= maxAttempts) {
                    reject(new Error(`Server failed to start after ${maxAttempts} attempts (${maxAttempts * interval / 1000} seconds)`));
                } else {
                    // Log every 5th attempt, or every attempt in CI
                    if (attempts % 5 === 0 || isCI) {
                        console.log(`⏳ Waiting for React server on port ${PORT}... (attempt ${attempts}/${maxAttempts})`);
                        if (isCI && attempts > 10) {
                            console.log(`   Error details: ${error ? error.message : 'Connection refused'}`);
                        }
                    }
                    setTimeout(checkServer, interval);
                }
            });
        };
        
        checkServer();
    });
}

function startServer() {
    console.log('🚀 Starting React development server...');
    
    const child = spawn('npm', ['start'], {
        stdio: 'pipe',
        env: {
            ...process.env,
            BROWSER: 'none',
            PORT: PORT,
            HTTPS: 'true'
        }
    });
    
    child.stdout.on('data', (data) => {
        const output = data.toString();
        if (output.includes('webpack compiled') || output.includes('Local:')) {
            console.log('📦 Webpack compilation completed');
        }
    });
    
    child.stderr.on('data', (data) => {
        const output = data.toString();
        if (output.includes('Error') || output.includes('error')) {
            console.error('❌ Server error:', output);
        }
    });
    
    child.on('error', (error) => {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    });
    
    writePidFile(child.pid);
    
    // Wait for server to be ready
    waitForServer()
        .then(() => {
            console.log('✅ React server started successfully');
            // Keep the process alive
            process.stdin.resume();
        })
        .catch((error) => {
            console.error('❌ Server startup failed:', error.message);
            process.exit(1);
        });
}

function stopServer() {
    console.log('🛑 Stopping React development server...');
    
    const pid = readPidFile();
    if (pid && isServerRunning(pid)) {
        try {
            process.kill(pid, 'SIGTERM');
            console.log(`✅ Stopped server (PID: ${pid})`);
        } catch (error) {
            console.error('❌ Failed to stop server:', error.message);
        }
    } else {
        console.log('ℹ️  No running server found');
    }
    
    deletePidFile();
}

// Handle command line arguments
const command = process.argv[2];

switch (command) {
    case 'start':
        startServer();
        break;
    case 'stop':
        stopServer();
        break;
    default:
        console.log('Usage: node server-manager.js [start|stop]');
        process.exit(1);
}

// Handle process termination
process.on('SIGINT', () => {
    console.log('\n🛑 Received SIGINT, stopping server...');
    stopServer();
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\n🛑 Received SIGTERM, stopping server...');
    stopServer();
    process.exit(0);
});