const { spawn } = require('child_process');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

// Colors for console output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  reset: '\x1b[0m',
  bright: '\x1b[1m'
};

function log(message, color = 'white') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkPortInUse(port) {
  return new Promise((resolve) => {
    exec(`lsof -i :${port}`, (error, stdout, stderr) => {
      resolve(stdout.includes(`${port}`));
    });
  });
}

function killProcessOnPort(port) {
  return new Promise((resolve) => {
    exec(`lsof -ti :${port} | xargs kill -9`, (error) => {
      // Ignore errors - process might not exist
      resolve();
    });
  });
}

async function killExistingProcesses() {
  log('🧹 Cleaning up existing processes...', 'yellow');
  
  // Kill by process name
  exec('pkill -f "wrangler"', () => {});
  exec('pkill -f "vite"', () => {});
  
  // Kill by port
  await killProcessOnPort(5174);
  await killProcessOnPort(8788);
  
  // Wait a moment for cleanup
  await new Promise(resolve => setTimeout(resolve, 2000));
}

async function checkDependencies() {
  log('🔍 Checking dependencies...', 'cyan');
  
  // Check if admin node_modules exists
  const adminNodeModules = path.join(__dirname, 'cms', 'admin', 'node_modules');
  if (!fs.existsSync(adminNodeModules)) {
    log('📦 Installing admin UI dependencies...', 'yellow');
    return new Promise((resolve, reject) => {
      const npmInstall = spawn('npm', ['install'], {
        cwd: path.join(__dirname, 'cms', 'admin'),
        stdio: 'inherit'
      });
      
      npmInstall.on('close', (code) => {
        if (code === 0) {
          log('✅ Dependencies installed successfully!', 'green');
          resolve();
        } else {
          reject(new Error('Failed to install dependencies'));
        }
      });
    });
  }
}

async function startServers() {
  log('🚀 Starting Illumin8CMS Development Environment...', 'bright');
  
  await killExistingProcesses();
  await checkDependencies();
  
  // Check if ports are still in use
  const vitePortInUse = await checkPortInUse(5174);
  const wranglerPortInUse = await checkPortInUse(8788);
  
  if (vitePortInUse || wranglerPortInUse) {
    log('⚠️  Ports still in use after cleanup. Waiting...', 'yellow');
    await new Promise(resolve => setTimeout(resolve, 3000));
  }
  
  log('📱 Starting Admin UI (Vite)...', 'cyan');
  const vite = spawn('npm', ['run', 'dev'], {
    cwd: path.join(__dirname, 'cms', 'admin'),
    stdio: 'pipe'
  });
  
  vite.stdout.on('data', (data) => {
    const output = data.toString();
    if (output.includes('Local:') || output.includes('ready')) {
      log(`📱 Admin UI: ${output.trim()}`, 'green');
    }
  });
  
  vite.stderr.on('data', (data) => {
    const error = data.toString();
    if (!error.includes('experimental')) {
      log(`📱 Admin UI Error: ${error.trim()}`, 'red');
    }
  });
  
  // Wait for Vite to start
  await new Promise(resolve => setTimeout(resolve, 3000));
  
     log('⚡ Starting Backend API (Wrangler)...', 'magenta');
   const wrangler = spawn('npx', [
     'wrangler', 'pages', 'dev', 'cms/admin/dist',
     '--compatibility-date=2024-07-01',
     '--port', '8788'
   ], {
     cwd: __dirname,
     stdio: 'pipe'
   });
  
  wrangler.stdout.on('data', (data) => {
    const output = data.toString();
    log(`⚡ Backend: ${output.trim()}`, 'magenta');
  });
  
  wrangler.stderr.on('data', (data) => {
    const error = data.toString();
    if (!error.includes('experimental') && !error.includes('deprecated')) {
      log(`⚡ Backend Error: ${error.trim()}`, 'red');
    }
  });
  
  // Wait for Wrangler to start
  await new Promise(resolve => setTimeout(resolve, 5000));
  
  log('', 'white');
  log('🎉 Illumin8CMS is ready!', 'bright');
  log('', 'white');
  log('📱 Admin UI:     http://localhost:5174', 'cyan');
  log('⚡ Backend API:  http://localhost:8788', 'magenta');
  log('', 'white');
  log('💡 First time? Visit the admin UI to set up your account.', 'yellow');
  log('', 'white');
  log('🔧 Troubleshooting:', 'white');
  log('   • If you see CORS errors, make sure both servers are running', 'white');
  log('   • If login fails, check the backend logs above', 'white');
  log('   • Press Ctrl+C to stop both servers', 'white');
  log('', 'white');
  
  // Handle graceful shutdown
  process.on('SIGINT', () => {
    log('', 'white');
    log('🛑 Shutting down Illumin8CMS...', 'yellow');
    vite.kill();
    wrangler.kill();
    process.exit(0);
  });
  
  // Keep the process alive
  process.stdin.resume();
}

startServers().catch((error) => {
  log(`❌ Failed to start CMS: ${error.message}`, 'red');
  process.exit(1);
}); 