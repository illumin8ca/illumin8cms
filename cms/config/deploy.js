#!/usr/bin/env node

/**
 * Scenic Valley Quilts - Cloudflare Deployment Helper
 * 
 * This script helps with setting up the required Cloudflare resources
 * and updating the wrangler.toml file with the correct IDs.
 */

const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');
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
║    Scenic Valley Quilts - Cloudflare Deployment Tool     ║
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

const steps = [
  {
    title: 'Create D1 Database',
    command: 'wrangler d1 create scenic-valley-quilts',
    extractId: (output) => {
      const match = output.match(/database_id\s*=\s*"([^"]+)"/);
      return match ? match[1] : null;
    },
    updateConfig: (id) => {
      if (!id) return false;
      
      const wranglerPath = path.join(__dirname, 'wrangler.toml');
      let config = fs.readFileSync(wranglerPath, 'utf-8');
      
      // Replace the placeholder database_id
      config = config.replace(
        /database_id\s*=\s*"[^"]*"/,
        `database_id = "${id}"`
      );
      
      fs.writeFileSync(wranglerPath, config);
      return true;
    }
  },
  {
    title: 'Create R2 Bucket',
    command: 'wrangler r2 bucket create quilts-uploads',
    extractId: () => 'quilts-uploads', // R2 doesn't return an ID, just use the name
    updateConfig: () => true // No config update needed for R2
  },
  {
    title: 'Import Database Schema',
    command: 'wrangler d1 execute scenic-valley-quilts --file ./db/schema.sql',
    extractId: () => null,
    updateConfig: () => true
  },
  {
    title: 'Seed Database with Initial Data',
    command: 'wrangler d1 execute scenic-valley-quilts --file ./db/seed.sql',
    extractId: () => null,
    updateConfig: () => true
  },
  {
    title: 'Set JWT Secret',
    command: () => {
      const secret = generateRandomString(64);
      console.log(`${colors.yellow}Generated JWT Secret: ${secret}${colors.reset}`);
      return `wrangler secret put JWT_SECRET --value "${secret}"`;
    },
    extractId: () => null,
    updateConfig: () => true
  },
  {
    title: 'Set Contact Email',
    command: (email) => `wrangler secret put CONTACT_EMAIL --value "${email}"`,
    promptText: 'Enter contact email address: ',
    extractId: () => null,
    updateConfig: () => true
  }
];

// Generate a random string for secrets
function generateRandomString(length) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

// Run steps sequentially
async function runSteps() {
  for (const [index, step] of steps.entries()) {
    console.log(`\n${colors.blue}[${index + 1}/${steps.length}] ${step.title}${colors.reset}`);
    
    try {
      let cmd = step.command;
      
      // If command is a function, execute it with prompt if needed
      if (typeof cmd === 'function') {
        if (step.promptText) {
          const input = await new Promise(resolve => {
            rl.question(`${colors.yellow}${step.promptText}${colors.reset}`, resolve);
          });
          cmd = cmd(input);
        } else {
          cmd = cmd();
        }
      }
      
      console.log(`${colors.magenta}> ${cmd}${colors.reset}`);
      const output = execSync(cmd, { stdio: ['inherit', 'pipe', 'inherit'] }).toString();
      console.log(output);
      
      // Extract ID if needed
      const id = step.extractId(output);
      if (id) {
        const updated = step.updateConfig(id);
        if (updated) {
          console.log(`${colors.green}✓ Configuration updated with ID: ${id}${colors.reset}`);
        }
      }
      
      console.log(`${colors.green}✓ Step completed successfully${colors.reset}`);
    } catch (error) {
      console.error(`${colors.red}✗ Step failed: ${error.message}${colors.reset}`);
      console.log(`${colors.yellow}Continue to next step? (y/n)${colors.reset}`);
      
      const answer = await new Promise(resolve => {
        rl.question('', resolve);
      });
      
      if (answer.toLowerCase() !== 'y') {
        console.log(`${colors.red}Deployment aborted.${colors.reset}`);
        process.exit(1);
      }
    }
  }
  
  console.log(`\n${colors.green}
╔══════════════════════════════════════════════════════════╗
║                                                          ║
║    Cloudflare resources setup complete!                  ║
║                                                          ║
║    Next steps:                                           ║
║    1. Build the frontend: cd frontend && npm run build   ║
║    2. Deploy to Cloudflare: wrangler pages deploy        ║
║    3. Set up GitHub integration for auto-deployments     ║
║                                                          ║
╚══════════════════════════════════════════════════════════╝
${colors.reset}`);
  
  rl.close();
}

runSteps().catch(err => {
  console.error(`${colors.red}Error: ${err.message}${colors.reset}`);
  process.exit(1);
}); 