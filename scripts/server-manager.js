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
    
    // Detect CI environment for different behavior
    const isCI = process.env.CI === 'true' || process.env.GITHUB_ACTIONS === 'true' || process.env.QQQ_SELENIUM_HEADLESS === 'true';
    
    if (isCI) {
        console.log('🔍 CI environment detected - using enhanced startup process');
    }
    
    const child = spawn('npm', ['start'], {
        stdio: 'pipe',
        env: {
            ...process.env,
            BROWSER: 'none',
            PORT: PORT,
            HTTPS: 'true',
            GENERATE_SOURCEMAP: 'false',
            FAST_REFRESH: 'false'
        }
    });
    
    let serverReady = false;
    let webpackCompiled = false;
    
    child.stdout.on('data', (data) => {
        const output = data.toString();
        console.log('📝 Server output:', output.trim());
        
        if (output.includes('webpack compiled') || output.includes('Local:')) {
            webpackCompiled = true;
            console.log('📦 Webpack compilation completed');
        }
        
        if (output.includes('Local:') && output.includes('https://localhost:' + PORT)) {
            console.log('🌐 Server is available at https://localhost:' + PORT);
        }
    });
    
    child.stderr.on('data', (data) => {
        const output = data.toString();
        if (output.includes('Error') || output.includes('error')) {
            console.error('❌ Server error:', output);
        } else {
            console.log('📝 Server stderr:', output.trim());
        }
    });
    
    child.on('error', (error) => {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    });
    
    child.on('exit', (code) => {
        console.log(`🛑 Server process exited with code ${code}`);
        if (!serverReady) {
            console.error('❌ Server exited before becoming ready');
            process.exit(1);
        }
    });
    
    writePidFile(child.pid);
    console.log(`📋 Server PID: ${child.pid}`);
    
    // Wait for server to be ready
    waitForServer()
        .then(() => {
            serverReady = true;
            console.log('✅ React server started successfully and is ready');
            console.log(`🌐 Server URL: https://localhost:${PORT}`);
            
            // In CI, we want to keep the process alive but also signal readiness
            if (isCI) {
                console.log('🔄 Keeping server alive for integration tests...');
                // Keep the process alive
                process.stdin.resume();
            } else {
                // For local development, keep alive
                process.stdin.resume();
            }
        })
        .catch((error) => {
            console.error('❌ Server startup failed:', error.message);
            console.error('🔍 Server process status:', child.killed ? 'killed' : 'running');
            console.error('🔍 Webpack compiled:', webpackCompiled);
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

function waitForServerOnly() {
    console.log('⏳ Waiting for React server to be ready...');
    
    const isCI = process.env.CI === 'true' || process.env.GITHUB_ACTIONS === 'true' || process.env.QQQ_SELENIUM_HEADLESS === 'true';
    const maxAttempts = isCI ? 60 : 30;
    const interval = isCI ? 2000 : 1000;
    
    if (isCI) {
        console.log('🔍 CI environment detected - using extended wait parameters');
    }
    
    waitForServer(maxAttempts, interval)
        .then(() => {
            console.log('✅ React server is ready for integration tests');
            process.exit(0);
        })
        .catch((error) => {
            console.error('❌ Server wait failed:', error.message);
            process.exit(1);
        });
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
    case 'wait':
        waitForServerOnly();
        break;
    default:
        console.log('Usage: node server-manager.js [start|stop|wait]');
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