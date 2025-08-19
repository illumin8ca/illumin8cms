#!/usr/bin/env node

/**
 * Scenic Valley Quilts - Local Development Helper
 * 
 * This script helps with setting up and running the local development environment.
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  red: '\x1b[31m'
};

console.log(`${colors.cyan}
╔══════════════════════════════════════════════════════════╗
║                                                          ║
║    Scenic Valley Quilts - Local Development Helper       ║
║                                                          ║
╚══════════════════════════════════════════════════════════╝
${colors.reset}`);

// Check if wrangler is installed
try {
  const wranglerVersion = execSync('wrangler --version').toString().trim();
  console.log(`${colors.green}✓ Wrangler detected: ${wranglerVersion}${colors.reset}`);
} catch (error) {
  console.error(`${colors.red}✗ Wrangler not found. Please install it with: npm install -g wrangler${colors.reset}`);
  process.exit(1);
}

// Check if frontend/dist exists
const distPath = path.join(__dirname, 'frontend', 'dist');
if (!fs.existsSync(distPath)) {
  console.log(`${colors.yellow}⚠ Frontend build not found at ${distPath}${colors.reset}`);
  console.log(`${colors.blue}Building frontend...${colors.reset}`);
  
  try {
    const frontendPath = path.join(__dirname, 'frontend');
    
    // Check if package.json exists in frontend directory
    if (!fs.existsSync(path.join(frontendPath, 'package.json'))) {
      console.log(`${colors.red}✗ Frontend package.json not found. Please ensure the frontend directory is set up correctly.${colors.reset}`);
      process.exit(1);
    }
    
    // Install dependencies if node_modules doesn't exist
    if (!fs.existsSync(path.join(frontendPath, 'node_modules'))) {
      console.log(`${colors.blue}Installing frontend dependencies...${colors.reset}`);
      execSync('npm install', { cwd: frontendPath, stdio: 'inherit' });
    }
    
    // Build the frontend
    console.log(`${colors.blue}Building frontend...${colors.reset}`);
    execSync('npm run build', { cwd: frontendPath, stdio: 'inherit' });
    
    console.log(`${colors.green}✓ Frontend built successfully${colors.reset}`);
  } catch (error) {
    console.error(`${colors.red}✗ Failed to build frontend: ${error.message}${colors.reset}`);
    process.exit(1);
  }
}

// Start the development server
console.log(`${colors.blue}Starting local development server...${colors.reset}`);
console.log(`${colors.magenta}> wrangler pages dev ./frontend/dist --d1=DB --r2=R2${colors.reset}`);

try {
  // This will keep running until Ctrl+C
  execSync('wrangler pages dev ./frontend/dist --d1=DB --r2=R2', { stdio: 'inherit' });
} catch (error) {
  // This will execute when the user presses Ctrl+C
  console.log(`\n${colors.green}Development server stopped${colors.reset}`);
}

rl.close(); 