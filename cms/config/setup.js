#!/usr/bin/env node
/**
 * Scenic Valley Quilts – One-click setup helper
 *
 * This script does the following:
 *   1. Ensures Wrangler CLI is present.
 *   2. Builds both storefront (frontend) and admin dashboard (frontend-admin).
 *   3. Executes schema.sql and seed.sql against the local D1 database.
 *   4. Optionally provisions a Cloudflare Access application + policy via Wrangler.
 *
 * Run once after cloning the repo:
 *   node setup.js
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';
import readline from 'readline';

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

// Ensure `fetch` is available in the current Node version (Node < 18)
if (typeof fetch === 'undefined') {
  const { default: nodeFetch } = await import('node-fetch');
  globalThis.fetch = nodeFetch;
}

// Load .env if present so users can provide CF_API_TOKEN etc.
try {
  const dotenvPath = path.resolve('.env');
  if (fs.existsSync(dotenvPath)) {
    await import('dotenv/config');
  }
} catch {
  /* ignore */
}

function prompt(question) {
  return new Promise(resolve => rl.question(question, answer => resolve(answer.trim())));
}

function run(cmd, cwd = process.cwd()) {
  console.log(`\x1b[36m> ${cmd}\x1b[0m`);
  execSync(cmd, { stdio: 'inherit', cwd, shell: true });
}

(async () => {
  console.log('\n\x1b[35mScenic Valley Quilts – Initial Setup\x1b[0m\n');

  // 1. Wrangler check
  try {
    const v = execSync('wrangler --version').toString().trim();
    console.log(`Wrangler detected: ${v}`);
  } catch {
    console.error('Wrangler CLI not found. Install with: npm i -g wrangler');
    process.exit(1);
  }

  // 2. Build frontends
  const repos = [
    { dir: 'frontend', name: 'Storefront' },
    { dir: 'frontend-admin', name: 'Admin Dashboard' },
  ];
  for (const { dir, name } of repos) {
    console.log(`\n\x1b[33mBuilding ${name}…\x1b[0m`);
    const abs = path.resolve(dir);
    if (!fs.existsSync(path.join(abs, 'node_modules'))) run('npm install', abs);
    run('npm run build', abs);
  }

  // 3. Seed database (local)
  console.log('\n\x1b[33mSeeding local D1 database…\x1b[0m');
  run('wrangler d1 execute scenic-valley-quilts --local --file ./db/schema.sql');
  run('wrangler d1 execute scenic-valley-quilts --local --file ./db/seed.sql');

  // 4. Cloudflare Access provisioning (automatic)
  console.log('\n🔐 Configuring Cloudflare Access for /admin...');

  // Create API token using Global API Key
  async function createApiToken(accountId) {
    console.log('\n🔐 Creating temporary API token for Access configuration...');
    
    // Get Global API Key credentials
    let email = process.env.CF_EMAIL || process.env.CLOUDFLARE_EMAIL;
    let globalKey = process.env.CF_API_KEY || process.env.CLOUDFLARE_API_KEY;
    
    if (!email) {
      email = await prompt('Enter your Cloudflare email: ');
    }
    if (!globalKey) {
      console.log('💡 Global API Key is found in: https://dash.cloudflare.com/profile/api-tokens');
      globalKey = await prompt('Enter your Global API Key: ');
    }
    
    if (!email || !globalKey) {
      console.error('❌ Email and Global API Key are required. Exiting.');
      process.exit(1);
    }
    
    // Create a scoped token using the Global API Key
    console.log('🔧 Creating scoped API token...');
    try {
      const response = await fetch('https://api.cloudflare.com/client/v4/user/tokens', {
        method: 'POST',
        headers: {
          'X-Auth-Email': email.trim(),
          'X-Auth-Key': globalKey.trim(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: `Quilts Setup Token - ${new Date().toISOString().split('T')[0]}`,
          policies: [
            {
              effect: 'allow',
              resources: {
                [`com.cloudflare.api.account.${accountId}`]: '*'
              },
              permission_groups: [
                {
                  id: 'c8fed203ed3043cba015a93ad1616f1f', // Access: Apps Edit
                  name: 'Access: Apps Edit'
                },
                {
                  id: '93963f02b9b84d4ba4c8d6c9b4e3e8f1', // Access: Policies Edit  
                  name: 'Access: Policies Edit'
                }
              ]
            }
          ],
          condition: {
            request_ip: {
              in: [],
              not_in: []
            }
          }
        })
      });
      
      const result = await response.json();
      if (!result.success) {
        throw new Error(JSON.stringify(result.errors, null, 2));
      }
      
      console.log('✅ Scoped API token created successfully');
      return result.result.value;
      
    } catch (error) {
      console.error('❌ Failed to create API token:', error.message);
      console.log('\n🔄 Falling back to manual token creation...');
      
      // Fallback to manual creation
      const tokenUrl = 'https://dash.cloudflare.com/profile/api-tokens';
      try {
        const { default: open } = await import('open');
        await open(tokenUrl);
        console.log('✅ Browser opened to API token page');
      } catch {
        console.log(`📋 Please open this URL manually: ${tokenUrl}`);
      }
      
      console.log('\n📝 Create a Custom Token with these permissions:');
      console.log('   • Access: Apps - Edit');
      console.log('   • Access: Policies - Edit');
      console.log(`   • Account: ${accountId}`);
      console.log('');
      
      const token = await prompt('Paste your API token here: ');
      if (!token || !token.trim()) {
        console.error('❌ API token is required to configure Access. Exiting.');
        process.exit(1);
      }
      
      return token.trim();
    }
  }

  // Get account ID - try wrangler first, then prompt
  console.log('\n📋 Getting account information...');
  let accountId = null;
  try {
    const whoOutput = execSync('wrangler whoami').toString();
    const accountIdMatch = whoOutput.match(/[0-9a-f]{32}/i);
    accountId = accountIdMatch ? accountIdMatch[0] : null;
  } catch {
    // wrangler not logged in, that's fine
  }
  
  if (!accountId) {
    console.log('💡 Account ID needed (32-character hex string from your Cloudflare dashboard)');
    accountId = await prompt('Enter your Cloudflare Account ID: ');
    if (!accountId || !accountId.trim()) {
      console.error('❌ Account ID is required. Exiting.');
      process.exit(1);
    }
    accountId = accountId.trim();
  }
  console.log(`✅ Using account: ${accountId}`);

  // Create API token for Access using Global API Key
  const authToken = await createApiToken(accountId);

  const adminEmail = await prompt('Admin email(s) to allow (comma separated): ');

  const appName = 'Quilts Admin';

  // Small wrapper that handles success/errors consistently
  async function cfApi(pathSuffix, init = {}) {
    const res = await fetch(`https://api.cloudflare.com/client/v4/accounts/${accountId}${pathSuffix}`, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        ...(init.body ? { 'Content-Type': 'application/json' } : {}),
      },
      ...init,
    });
    const json = await res.json();
    if (!json.success) {
      // Special handling for Access not enabled
      if (json.errors?.[0]?.code === 9999 && json.errors[0].message.includes('not_enabled')) {
        console.error('\n❌ Cloudflare Access is not enabled on your account.');
        console.error('Please visit https://dash.cloudflare.com/ → Zero Trust → Access');
        console.error('and click "Enable Access" first, then re-run this script.');
        process.exit(1);
      }
      throw new Error(JSON.stringify(json.errors ?? json, null, 2));
    }
    return json.result;
  }

  // Ensure the application exists (idempotent – reuse if present)
  console.log('\nQuerying existing Access applications…');
  const apps = await cfApi('/access/apps');
  let app = apps.find(a => a.name === appName || a.domain === '/admin/*');

  if (!app) {
    console.log('Creating Access application…');
    app = await cfApi('/access/apps', {
      method: 'POST',
      body: JSON.stringify({
        name: appName,
        domain: '/admin/*',
        session_duration: '30d',
        type: 'self_hosted',
      }),
    });
  } else {
    console.log('Access application already exists – skipping creation.');
  }

  const appId = app.id;

  // Check for existing policy
  const policies = await cfApi(`/access/apps/${appId}/policies`);
  const ownersPolicy = policies.find(p => p.name === 'Owners');
  if (!ownersPolicy) {
    console.log('Creating "Owners" policy…');
    await cfApi(`/access/apps/${appId}/policies`, {
      method: 'POST',
      body: JSON.stringify({
        name: 'Owners',
        decision: 'allow',
        include: [{ email: adminEmail.split(',').map(e => e.trim()) }],
      }),
    });
  } else {
    console.log('Owners policy already exists – updating allowed emails…');
    await cfApi(`/access/apps/${appId}/policies/${ownersPolicy.id}`, {
      method: 'PUT',
      body: JSON.stringify({
        ...ownersPolicy,
        include: [{ email: adminEmail.split(',').map(e => e.trim()) }],
      }),
    });
  }

  console.log('\x1b[32m✓ Cloudflare Access configured.\x1b[0m');

  rl.close();
  console.log('\n\x1b[32mSetup complete!\x1b[0m');
  console.log('Next: run "wrangler pages dev ./frontend/dist --d1=DB --r2=R2" to preview the site.');
})(); 