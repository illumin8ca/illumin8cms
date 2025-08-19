#!/usr/bin/env node
/**
 * Illumin8 Cloudflare Launcher - Backend Server
 * Handles Cloudflare API calls to avoid CORS issues
 */

import express from 'express';
import cors from 'cors';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import os from 'os';

// Load variables from .env if present
dotenv.config();

const app = express();
const PORT = 5001;

app.use(cors());
app.use(express.json());

// Expose env-configured credentials so the frontend wizard can pick them up
app.get('/api/env', (req, res) => {
  const raw = process.env.GLOBAL_ADMIN_EMAIL || process.env.GLOBAL_ADMIN || '';
  const email = raw.includes('=') ? raw.split('=')[raw.split('=').length - 1] : raw;
  const globalKey = process.env.GLOBAL_API_KEY || '';
  res.json({ email, globalKey });
});

// Add request logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.url}`);
  next();
});

app.use(express.static('.'));

// Serve the setup wizard
app.get('/', (req, res) => {
  res.sendFile(path.resolve('setup-wizard.html'));
});

// Get account ID using Global API Key
app.post('/api/account', async (req, res) => {
  try {
    const { email, globalKey } = req.body;
    
    const response = await fetch('https://api.cloudflare.com/client/v4/accounts', {
      headers: {
        'X-Auth-Email': email,
        'X-Auth-Key': globalKey
      }
    });
    
    const result = await response.json();
    if (!result.success) {
      return res.status(400).json({ error: 'Failed to get account info', details: result.errors });
    }
    
    res.json({ accountId: result.result[0].id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create scoped API token
app.post('/api/token', async (req, res) => {
  try {
    const { email, globalKey, accountId } = req.body;
    
    console.log(`[${new Date().toISOString()}] Creating API token for account: ${accountId}`);
    
    // Get user ID
    const userResponse = await fetch('https://api.cloudflare.com/client/v4/user', {
        headers: {
            'X-Auth-Email': email,
            'X-Auth-Key': globalKey
        }
    });
    const userData = await userResponse.json();
    if (!userData.success) {
      return res.status(400).json({ error: 'Failed to fetch user details for token creation', details: userData.errors });
    }
    const userId = userData.result.id;

    // First, let's get the correct permission group IDs
    console.log(`[${new Date().toISOString()}] Fetching permission groups...`);
    
    const permissionsResponse = await fetch('https://api.cloudflare.com/client/v4/user/tokens/permission_groups', {
      headers: {
        'X-Auth-Email': email,
        'X-Auth-Key': globalKey
      }
    });
    
    const permissionsResult = await permissionsResponse.json();
    console.log(`[${new Date().toISOString()}] Available permission groups:`, JSON.stringify(permissionsResult, null, 2));
    
    if (!permissionsResult.success) {
      console.error(`[${new Date().toISOString()}] Failed to get permission groups:`, permissionsResult.errors);
      return res.status(400).json({ 
        error: 'Failed to get permission groups', 
        details: permissionsResult.errors 
      });
    }
    
    // Access permissions
    const accessAppsWrite = permissionsResult.result.find(p => 
      (p.name === 'Access: Apps and Policies Write' || p.name === 'Access: Apps and Policies Edit') &&
      p.scopes.includes('com.cloudflare.api.account')
    );
    const accessAppsRead = permissionsResult.result.find(p => 
      p.name === 'Access: Apps and Policies Read' &&
      p.scopes.includes('com.cloudflare.api.account')
    );

    // Pages write permission
    let pagesWrite = permissionsResult.result.find(p =>
      p.name === 'Pages Write' && p.scopes.includes('com.cloudflare.api.account')
    );
    if (!pagesWrite) {
      // fallback: any permission containing "Pages" and "Write"
      pagesWrite = permissionsResult.result.find(p => p.name.includes('Pages') && p.name.includes('Write') && p.scopes.includes('com.cloudflare.api.account'));
    }
    
    // Pages read permission
    let pagesRead = permissionsResult.result.find(p =>
      p.name === 'Pages Read' && p.scopes.includes('com.cloudflare.api.account')
    );
    if (!pagesRead) {
      // fallback: any permission containing "Pages" and "Read"
      pagesRead = permissionsResult.result.find(p => p.name.includes('Pages') && p.name.includes('Read') && p.scopes.includes('com.cloudflare.api.account'));
    }
    
    // Workers Scripts Write permission (sometimes needed for Pages Functions)
    let workersWrite = permissionsResult.result.find(p =>
      p.name === 'Workers Scripts Write' && p.scopes.includes('com.cloudflare.api.account')
    );
    
    // Zone Read permission (sometimes needed for DNS validation)
    let zoneRead = permissionsResult.result.find(p =>
      p.name === 'Zone Read' && p.scopes.includes('com.cloudflare.api.account')
    );
    
    // DNS Write permission (needed for DNS record creation)
    let dnsWrite = permissionsResult.result.find(p =>
      p.name === 'DNS Write' && p.scopes.includes('com.cloudflare.api.account.zone')
    );
    
    // R2 Storage Write permission (needed for R2 bucket creation)
    let r2Write = permissionsResult.result.find(p =>
      p.name === 'Workers R2 Storage Write' && p.scopes.includes('com.cloudflare.api.account')
    );
    
    // R2 Storage Read permission (needed for R2 bucket listing)
    let r2Read = permissionsResult.result.find(p =>
      p.name === 'Workers R2 Storage Read' && p.scopes.includes('com.cloudflare.api.account')
    );
    
    // D1 Database Write permission (needed for D1 database creation)
    let d1Write = permissionsResult.result.find(p =>
      p.name === 'Workers D1 Database Write' && p.scopes.includes('com.cloudflare.api.account')
    );
    
    // Fallback: if we don't have the specific R2 Storage permissions, try to find any R2 Storage permissions
    if (!r2Write) {
      r2Write = permissionsResult.result.find(p =>
        p.name.includes('R2') && p.name.includes('Write') && p.scopes.includes('com.cloudflare.api.account')
      );
    }
    
    if (!r2Read) {
      r2Read = permissionsResult.result.find(p =>
        p.name.includes('R2') && p.name.includes('Read') && p.scopes.includes('com.cloudflare.api.account')
      );
    }
    
    // Fallback: if we don't have the specific D1 permissions, try to find any D1 permissions
    if (!d1Write) {
      d1Write = permissionsResult.result.find(p =>
        p.name.includes('D1') && p.name.includes('Write') && p.scopes.includes('com.cloudflare.api.account')
      );
    }
    
    const userRead = permissionsResult.result.find(p => p.name === 'User Details Read' && p.scopes.includes('com.cloudflare.api.user'));
    const userMembershipsRead = permissionsResult.result.find(p => p.name === 'Memberships Read' && p.scopes.includes('com.cloudflare.api.user'));
    
    console.log(`[${new Date().toISOString()}] Found permissions:`, {
      accessWrite: accessAppsWrite,
      accessRead: accessAppsRead,
      pagesWrite: pagesWrite,
      pagesRead: pagesRead,
      workersWrite: workersWrite,
      zoneRead: zoneRead,
      dnsWrite: dnsWrite,
      r2Write: r2Write,
      r2Read: r2Read,
      d1Write: d1Write
    });
    
    let tokenPayload;
    
    if (!accessAppsWrite || !accessAppsRead) {
      // Try to find Zero Trust permissions as fallback
      const zeroTrustWrite = permissionsResult.result.find(p => 
        p.name === 'Zero Trust Write' && p.scopes.includes('com.cloudflare.api.account')
      );
      
      if (zeroTrustWrite) {
        console.log(`[${new Date().toISOString()}] Using Zero Trust Write permission as fallback`);
        tokenPayload = {
          name: `Quilts Setup Token - ${new Date().toISOString().split('T')[0]}`,
          policies: [
            {
              effect: 'allow',
              resources: {
                [`com.cloudflare.api.account.${accountId}`]: '*'
              },
              permission_groups: [
                {
                  id: zeroTrustWrite.id
                }
              ]
            }
          ]
        };
      } else {
        // Final fallback to basic account access
        console.log(`[${new Date().toISOString()}] No Access/Zero Trust permissions found, using basic account access`);
        tokenPayload = {
          name: `Quilts Setup Token - ${new Date().toISOString().split('T')[0]}`,
          policies: [
            {
              effect: 'allow',
              resources: {
                [`com.cloudflare.api.account.${accountId}`]: '*'
              },
              permission_groups: [
                {
                  id: 'c8fed203ed3043cba015a93ad1616f1f'
                }
              ]
            }
          ]
        };
      }
    } else {
      console.log(`[${new Date().toISOString()}] Using Access permissions for token`);
      
      // Add Account Settings Read group (required for Pages API)
      const accountSettingsRead = permissionsResult.result.find(p =>
        p.name === 'Account Settings Read' && p.scopes.includes('com.cloudflare.api.account')
      );

      const accountPermissionGroups = [
        pagesWrite ? { id: pagesWrite.id } : null,
        pagesRead ? { id: pagesRead.id } : null,
        workersWrite ? { id: workersWrite.id } : null,
        zoneRead ? { id: zoneRead.id } : null,
        dnsWrite ? { id: dnsWrite.id } : null,
        r2Write ? { id: r2Write.id } : null,
        r2Read ? { id: r2Read.id } : null,
        d1Write ? { id: d1Write.id } : null,
        accessAppsWrite ? { id: accessAppsWrite.id } : null,
        accessAppsRead ? { id: accessAppsRead.id } : null,
        accountSettingsRead ? { id: accountSettingsRead.id } : null,
      ].filter(Boolean);

      const userPermissionGroups = [
        userRead ? { id: userRead.id } : null,
        userMembershipsRead ? { id: userMembershipsRead.id } : null,
      ].filter(Boolean);
      
      const policies = [];

      if (accountPermissionGroups.length > 0) {
        policies.push({
          effect: 'allow',
          resources: {
            [`com.cloudflare.api.account.${accountId}`]: '*',
          },
          permission_groups: accountPermissionGroups
        });
      }

      if (userPermissionGroups.length > 0) {
        policies.push({
          effect: 'allow',
          resources: {
            [`com.cloudflare.api.user.${userId}`]: '*'
          },
          permission_groups: userPermissionGroups
        });
      }

      tokenPayload = {
        name: `Quilts Setup Token - ${new Date().toISOString().split('T')[0]}`,
        policies: policies
      };
    }
    
    console.log(`[${new Date().toISOString()}] Token payload:`, JSON.stringify(tokenPayload, null, 2));
    
    const response = await fetch('https://api.cloudflare.com/client/v4/user/tokens', {
      method: 'POST',
      headers: {
        'X-Auth-Email': email,
        'X-Auth-Key': globalKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(tokenPayload)
    });
    
    const result = await response.json();
    console.log(`[${new Date().toISOString()}] Cloudflare API response:`, JSON.stringify(result, null, 2));
    
    if (!result.success) {
      console.error(`[${new Date().toISOString()}] API token creation failed:`, result.errors);
      return res.status(400).json({ 
        error: 'Failed to create API token', 
        details: result.errors,
        messages: result.messages 
      });
    }
    
    console.log(`[${new Date().toISOString()}] API token created successfully`);
    // PATCH: Return both token value and token ID
    res.json({ token: result.result.value, tokenId: result.result.id });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Server error creating token:`, error);
    res.status(500).json({ error: error.message });
  }
});

// Execute build commands
app.post('/api/build', async (req, res) => {
  try {
    const { command } = req.body;
    
    console.log(`Executing: ${command}`);
    execSync(command, { stdio: 'inherit' });
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Configure Cloudflare Access
app.post('/api/access', async (req, res) => {
  try {
    const { apiToken, accountId, adminEmails } = req.body;
    
    // Get existing apps
    const appsResponse = await fetch(`https://api.cloudflare.com/client/v4/accounts/${accountId}/access/apps`, {
      headers: {
        'Authorization': `Bearer ${apiToken}`
      }
    });
    
    const appsResult = await appsResponse.json();
    console.log(`[${new Date().toISOString()}] Access apps API response:`, JSON.stringify(appsResult, null, 2));
    
    if (!appsResult.success) {
      console.error(`[${new Date().toISOString()}] Failed to get Access apps:`, appsResult.errors);
      return res.status(400).json({ 
        error: 'Failed to get Access apps', 
        details: appsResult.errors,
        messages: appsResult.messages,
        statusCode: appsResponse.status
      });
    }
    
    // Find or create Quilts Admin app
    let app = appsResult.result.find(a => a.name === 'Quilts Admin' || a.domain === '/admin/*');
    
    if (!app) {
      console.log(`[${new Date().toISOString()}] Attempting to create Access app for account: ${accountId}`);
      try {
        const createResponse = await fetch(`https://api.cloudflare.com/client/v4/accounts/${accountId}/access/apps`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            name: 'Quilts Admin',
            // Use production hostname with path wildcard
            domain: 'scenicvalleyquilting.com/admin/*',
            // Cloudflare expects hours/minutes, not days (see error 12130)
            session_duration: '720h', // 30 days
            type: 'self_hosted'
          })
        });
        const createResult = await createResponse.json();
        console.log(`[${new Date().toISOString()}] Create Access App response:`, JSON.stringify(createResult, null, 2), 'Status:', createResponse.status);
        if (!createResult.success) {
          return res.status(400).json({ error: 'Failed to create Access app', details: createResult.errors, status: createResponse.status, body: createResult });
        }
        app = createResult.result;
      } catch (err) {
        console.error(`[${new Date().toISOString()}] Error during Access app creation:`, err);
        return res.status(500).json({ error: 'Exception during Access app creation', details: err.message });
      }
    }
    
    // Configure policy
    const policiesResponse = await fetch(`https://api.cloudflare.com/client/v4/accounts/${accountId}/access/apps/${app.id}/policies`, {
      headers: {
        'Authorization': `Bearer ${apiToken}`
      }
    });
    
    const policiesResult = await policiesResponse.json();
    if (!policiesResult.success) {
      return res.status(400).json({ error: 'Failed to get policies', details: policiesResult.errors });
    }
    
    const ownersPolicy = policiesResult.result.find(p => p.name === 'Owners');
    
    if (!ownersPolicy) {
      await fetch(`https://api.cloudflare.com/client/v4/accounts/${accountId}/access/apps/${app.id}/policies`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: 'Owners',
          decision: 'allow',
          include: [{ email: adminEmails }]
        })
      });
    } else {
      await fetch(`https://api.cloudflare.com/client/v4/accounts/${accountId}/access/apps/${app.id}/policies/${ownersPolicy.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${apiToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...ownersPolicy,
          include: [{ email: adminEmails }]
        })
      });
    }
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Wrangler login status endpoint
app.get('/api/wrangler-login', (req, res) => {
  // Use project-local .wrangler/config/default.toml
  const wranglerConfigPath = path.join(process.cwd(), '.wrangler', 'config', 'default.toml');
  const exists = fs.existsSync(wranglerConfigPath);
  let fileContent = '';
  if (exists) {
    try {
      fileContent = fs.readFileSync(wranglerConfigPath, 'utf8').split('\n').slice(0, 5).join('\n');
    } catch (e) {
      fileContent = 'Error reading file: ' + e.message;
    }
  }
  console.log('[Wrangler Login Check] Path:', wranglerConfigPath, '| Exists:', exists, '| Content (first 5 lines):', fileContent);
  res.json({ loggedIn: exists });
});

// Wrangler login trigger endpoint
app.post('/api/wrangler-login/start', (req, res) => {
  try {
    execSync('wrangler login', { stdio: 'inherit' });
    // Wait for the file to exist (max 10s)
    const wranglerConfigPath = path.join(os.homedir(), '.wrangler', 'config', 'default.toml');
    let waited = 0;
    while (!fs.existsSync(wranglerConfigPath) && waited < 10000) {
      Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 200); // Sleep 200ms
      waited += 200;
    }
    const exists = fs.existsSync(wranglerConfigPath);
    res.json({ started: exists });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Check if Pages project exists
app.post('/api/pages/check', async (req, res) => {
  try {
    let { apiToken, accountId, projectName, useWranglerLogin } = req.body;
    projectName = projectName || 'scenic-valley-quilting';
    
    if (!useWranglerLogin && !apiToken) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }
    
    let env = { ...process.env };
    if (!useWranglerLogin) {
      env.CLOUDFLARE_API_TOKEN = apiToken;
      env.CLOUDFLARE_ACCOUNT_ID = accountId;
    }
    
    try {
      const listOutput = execSync(`wrangler pages project list`, { env, encoding: 'utf8' });
      // Parse the table output to check if our project exists
      const lines = listOutput.split('\n');
      const projectExists = lines.some(line => line.includes(projectName));
      
      res.json({ 
        exists: projectExists,
        projectName,
        projects: [], // Can't easily parse project list from table output
        message: projectExists ? 'Project found' : 'Project not found'
      });
    } catch (e) {
      res.json({ 
        exists: false,
        projectName,
        error: e.message,
        projects: []
      });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Deploy to Cloudflare Pages (create project if needed, deploy, add custom domain)
app.post('/api/pages', async (req, res) => {
  let tokenRevoked = false;
  let deployError = null;
  try {
    let { apiToken, tokenId, accountId, projectName, distPath, productionBranch = 'main', customDomain, useWranglerLogin } = req.body;
    projectName = projectName || 'scenic-valley-quilting';
    distPath = distPath || './frontend/dist';
    if (!useWranglerLogin && !apiToken) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }
    let env = { ...process.env };
    if (!useWranglerLogin) {
      env.CLOUDFLARE_API_TOKEN = apiToken;
      env.CLOUDFLARE_ACCOUNT_ID = accountId;
      delete env.CF_API_TOKEN;
      delete env.CF_ACCOUNT_ID;
    } else {
      delete env.CLOUDFLARE_API_TOKEN;
      delete env.CLOUDFLARE_ACCOUNT_ID;
      delete env.CF_API_TOKEN;
      delete env.CF_ACCOUNT_ID;
    }
    // --- R2 bucket automation ---
    const r2BucketName = 'quilts-uploads';
    const r2ApiUrl = `https://api.cloudflare.com/client/v4/accounts/${accountId}/r2/buckets`;
    const r2Headers = {
      'Authorization': `Bearer ${apiToken}`,
      'Content-Type': 'application/json'
    };
    
    console.log(`[${new Date().toISOString()}] Checking R2 bucket: ${r2BucketName}`);
    console.log(`[${new Date().toISOString()}] R2 API URL: ${r2ApiUrl}`);
    
    // Check if bucket exists
    try {
      const r2ListResp = await fetch(r2ApiUrl, { headers: r2Headers });
      const r2List = await r2ListResp.json();
      
      console.log(`[${new Date().toISOString()}] R2 list response status: ${r2ListResp.status}`);
      console.log(`[${new Date().toISOString()}] R2 list response:`, JSON.stringify(r2List, null, 2));
      
      if (!r2List.success) {
        console.error(`[${new Date().toISOString()}] Failed to list R2 buckets:`, r2List.errors);
        
        // Check if R2 is not enabled
        const r2NotEnabled = r2List.errors && r2List.errors.some(error => 
          error.code === 10042 || error.message.includes('enable R2')
        );
        
        if (r2NotEnabled) {
          return res.status(400).json({ 
            error: 'R2 Storage is not enabled', 
            details: r2List.errors,
            instructions: [
              'Please enable R2 Storage in your Cloudflare Dashboard:',
              '1. Go to https://dash.cloudflare.com/',
              '2. Select your account',
              '3. Click on "R2 Object Storage" in the left sidebar',
              '4. Click "Enable R2" and follow the setup process',
              '5. Once enabled, return here and try again'
            ],
            statusCode: r2ListResp.status,
            response: r2List
          });
        }
        
        return res.status(500).json({ 
          error: 'Failed to list R2 buckets', 
          details: r2List.errors,
          statusCode: r2ListResp.status,
          response: r2List
        });
      }
      
      const bucketExists = r2List.result.buckets && r2List.result.buckets.some(b => b.name === r2BucketName);
      console.log(`[${new Date().toISOString()}] Bucket ${r2BucketName} exists: ${bucketExists}`);
      
      if (!bucketExists) {
        console.log(`[${new Date().toISOString()}] Creating R2 bucket: ${r2BucketName}`);
        // Create the bucket
        const createResp = await fetch(r2ApiUrl, {
          method: 'POST',
          headers: r2Headers,
          body: JSON.stringify({ name: r2BucketName })
        });
        const createResult = await createResp.json();
        
        console.log(`[${new Date().toISOString()}] R2 create response status: ${createResp.status}`);
        console.log(`[${new Date().toISOString()}] R2 create response:`, JSON.stringify(createResult, null, 2));
        
        if (!createResult.success) {
          console.error(`[${new Date().toISOString()}] Failed to create R2 bucket:`, createResult.errors);
          return res.status(500).json({ 
            error: 'Failed to create R2 bucket', 
            details: createResult.errors,
            statusCode: createResp.status,
            response: createResult
          });
        }
        console.log(`[${new Date().toISOString()}] Successfully created R2 bucket: ${r2BucketName}`);
      } else {
        console.log(`[${new Date().toISOString()}] R2 bucket ${r2BucketName} already exists - skipping creation`);
      }
    } catch (error) {
      console.error(`[${new Date().toISOString()}] Exception during R2 bucket operations:`, error);
      return res.status(500).json({ 
        error: 'Exception during R2 bucket operations', 
        details: error.message 
      });
    }
    console.log(`[${new Date().toISOString()}] R2 bucket automation completed - bucket '${r2BucketName}' is ready for file uploads`);
    // --- End R2 bucket automation ---
    
    // --- D1 database automation ---
    console.log(`[${new Date().toISOString()}] Checking D1 database...`);
    
    // Set the API token for wrangler commands
    const wranglerEnv = { ...env, CLOUDFLARE_API_TOKEN: apiToken };
    
    // Check if D1 database exists by trying to list databases
    try {
      const d1ListOutput = execSync(`wrangler d1 list`, { env: wranglerEnv, encoding: 'utf8' });
      console.log(`[${new Date().toISOString()}] D1 list output:`, d1ListOutput);
      
      // Check if our database exists
      const dbExists = d1ListOutput.includes('scenic-valley-quilts');
      console.log(`[${new Date().toISOString()}] D1 database scenic-valley-quilts exists: ${dbExists}`);
      
      if (!dbExists) {
        console.log(`[${new Date().toISOString()}] Creating D1 database: scenic-valley-quilts`);
        const createDbOutput = execSync(`wrangler d1 create scenic-valley-quilts`, { env: wranglerEnv, encoding: 'utf8' });
        console.log(`[${new Date().toISOString()}] D1 create output:`, createDbOutput);
        
        // Extract database ID from the output
        const dbIdMatch = createDbOutput.match(/database_id\s*=\s*"([^"]+)"/);
        if (dbIdMatch) {
          const dbId = dbIdMatch[1];
          console.log(`[${new Date().toISOString()}] Created D1 database with ID: ${dbId}`);
          
          // Update wrangler.toml with the new database ID
          const wranglerPath = './wrangler.toml';
          let wranglerConfig = fs.readFileSync(wranglerPath, 'utf-8');
          
          // Replace the placeholder database_id in both sections
          wranglerConfig = wranglerConfig.replace(
            /database_id\s*=\s*"[^"]*"/g,
            `database_id = "${dbId}"`
          );
          
          fs.writeFileSync(wranglerPath, wranglerConfig);
          console.log(`[${new Date().toISOString()}] Updated wrangler.toml with database ID: ${dbId}`);
        }
      } else {
        console.log(`[${new Date().toISOString()}] D1 database scenic-valley-quilts already exists`);
      }
    } catch (error) {
      console.error(`[${new Date().toISOString()}] Error checking/creating D1 database:`, error.message);
      console.error(`[${new Date().toISOString()}] Full error:`, error);
      // Continue anyway - the database might already exist
    }
    // --- End D1 database automation ---
    
    const run = (cmd) => execSync(cmd, { env: wranglerEnv, stdio: 'inherit', shell: true });
    
    // Check if project exists to determine if this is a fresh deployment or update
    let isNewProject = false;
    try {
      // Try to list projects (without --json flag which may not be supported)
      const listOutput = execSync(`wrangler pages project list`, { env, encoding: 'utf8' });
      // Parse the table output to check if our project exists
      const lines = listOutput.split('\n');
      const projectExists = lines.some(line => line.includes(projectName));
      isNewProject = !projectExists;
      console.log(`[${new Date().toISOString()}] Project ${projectName} exists: ${projectExists}, isNewProject: ${isNewProject}`);
    } catch (e) {
      console.log(`[${new Date().toISOString()}] Could not list projects, assuming new deployment: ${e.message}`);
      isNewProject = true;
    }
    
    // Create project if it doesn't exist
    if (isNewProject) {
      console.log(`[${new Date().toISOString()}] Creating new Pages project: ${projectName}`);
      try {
        run(`wrangler pages project create ${projectName} --production-branch=${productionBranch}`);
        console.log(`[${new Date().toISOString()}] Successfully created Pages project: ${projectName}`);
      } catch (e) {
        console.log(`[${new Date().toISOString()}] Project creation failed, may already exist: ${e.message}`);
      }
    } else {
      console.log(`[${new Date().toISOString()}] Updating existing Pages project: ${projectName}`);
    }
    
    // Deploy the project
    console.log(`[${new Date().toISOString()}] Deploying to Pages project: ${projectName}`);
    run(`wrangler pages deploy ${distPath} --project-name ${projectName} --branch=${productionBranch} --commit-dirty=true --commit-message="Automated deploy"`);
    
    // Add custom domain to Pages project if provided
    if (customDomain) {
      console.log(`[${new Date().toISOString()}] Adding custom domain to Pages project: ${customDomain}`);
      try {
        // Add the custom domain via Cloudflare API
        const domainResponse = await fetch(`https://api.cloudflare.com/client/v4/accounts/${accountId}/pages/projects/${projectName}/domains`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            name: customDomain
          })
        });
        
        const domainResult = await domainResponse.json();
        if (domainResult.success) {
          console.log(`[${new Date().toISOString()}] Successfully added custom domain: ${customDomain}`);
        } else {
          console.log(`[${new Date().toISOString()}] Custom domain may already exist or failed to add:`, domainResult.errors);
        }
        
        // Also add www subdomain
        const wwwDomain = `www.${customDomain}`;
        console.log(`[${new Date().toISOString()}] Adding www subdomain: ${wwwDomain}`);
        const wwwResponse = await fetch(`https://api.cloudflare.com/client/v4/accounts/${accountId}/pages/projects/${projectName}/domains`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            name: wwwDomain
          })
        });
        
        const wwwResult = await wwwResponse.json();
        if (wwwResult.success) {
          console.log(`[${new Date().toISOString()}] Successfully added www subdomain: ${wwwDomain}`);
        } else {
          console.log(`[${new Date().toISOString()}] www subdomain may already exist or failed to add:`, wwwResult.errors);
        }
      } catch (domainError) {
        console.log(`[${new Date().toISOString()}] Error adding custom domains (continuing anyway):`, domainError.message);
      }
    }
    
    const url = customDomain ? `https://${customDomain}` : `https://${projectName}.pages.dev`;
    res.json({ 
      success: true, 
      url,
      isNewProject,
      projectName,
      deploymentType: isNewProject ? 'fresh' : 'update',
      customDomainAdded: !!customDomain
    });
  } catch (error) {
    deployError = error;
    console.error('Pages deployment error:', error);
    res.status(500).json({ error: error.message });
  } finally {
    // PATCH: Always revoke the token if tokenId and apiToken are present
    const { apiToken, tokenId } = req.body;
    if (apiToken && tokenId && !tokenRevoked) {
      try {
        const revokeResp = await fetch(`https://api.cloudflare.com/client/v4/user/tokens/${tokenId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${apiToken}`,
            'Content-Type': 'application/json'
          }
        });
        const revokeResult = await revokeResp.json();
        if (revokeResult.success) {
          console.log(`[${new Date().toISOString()}] Revoked API token ${tokenId}`);
        } else {
          console.error(`[${new Date().toISOString()}] Failed to revoke API token ${tokenId}:`, revokeResult.errors);
        }
        tokenRevoked = true;
      } catch (revokeErr) {
        console.error(`[${new Date().toISOString()}] Exception while revoking API token:`, revokeErr);
      }
    }
  }
});

// Add DNS CNAME records for custom domain (www only)
app.post('/api/dns', async (req, res) => {
  try {
    const { apiToken, zoneName, target } = req.body;
    if (!apiToken || !zoneName || !target) return res.status(400).json({ error: 'Missing params' });

    const headers = {
      Authorization: `Bearer ${apiToken}`,
      'Content-Type': 'application/json'
    };

    // Find zone ID
    const zonesResp = await fetch(`https://api.cloudflare.com/client/v4/zones?name=${zoneName}` , { headers });
    const zones = await zonesResp.json();
    if (!zones.success || !zones.result.length) {
      console.error('DNS add error: Zone not found', { zoneName, apiResp: zones });
      return res.status(400).json({ error: 'Zone not found in account', details: zones });
    }
    const zoneId = zones.result[0].id;

    // Check for existing DNS records and update/create CNAME for www.<domain>
    const handleCname = async (name) => {
      // First, check if a record already exists
      const listResp = await fetch(`https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records?name=${name}`, {
        headers
      });
      const listData = await listResp.json();
      
      if (listData.success && listData.result.length > 0) {
        // Record exists, update it
        const existingRecord = listData.result[0];
        console.log(`[${new Date().toISOString()}] Updating existing DNS record: ${name}`);
        
        const updateResp = await fetch(`https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records/${existingRecord.id}`, {
          method: 'PUT',
          headers,
          body: JSON.stringify({
            type: 'CNAME',
            name,
            content: target,
            ttl: 3600,
            proxied: true // Enable orange cloud (proxied)
          })
        });
        const updateData = await updateResp.json();
        if (!updateData.success) {
          console.error('DNS update error: Failed to update CNAME', { name, error: updateData });
        }
        return updateData;
      } else {
        // Record doesn't exist, create it
        console.log(`[${new Date().toISOString()}] Creating new DNS record: ${name}`);
        
        const createResp = await fetch(`https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            type: 'CNAME',
            name,
            content: target,
            ttl: 3600,
            proxied: true // Enable orange cloud (proxied)
          })
        });
        const createData = await createResp.json();
        if (!createData.success) {
          console.error('DNS create error: Failed to create CNAME', { name, error: createData });
        }
        return createData;
      }
    };

    // Handle www CNAME
    const wwwResult = await handleCname(`www.${zoneName}`);

    if (!wwwResult.success) {
      return res.status(500).json({ error: 'Failed to add/update www CNAME record', wwwResult });
    }

    // Tell the user to manually configure the root domain
    res.json({ success: true, manualRoot: true, message: 'CNAME for www created. Please manually configure the root domain in Cloudflare.' });
  } catch (err) {
    console.error('DNS add error', err);
    res.status(500).json({ error: err.message });
  }
});

// Get all accounts for account selection (with pagination)
app.post('/api/accounts', async (req, res) => {
  try {
    const { email, globalKey, useWranglerLogin } = req.body;
    if (useWranglerLogin) {
      let output = '';
      let accounts = [];
      try {
        // Try JSON output first
        try {
          output = execSync('wrangler accounts list --json', { encoding: 'utf8' });
          if (!output) throw new Error('No output from wrangler CLI');
          let data = JSON.parse(output);
          if (!Array.isArray(data)) throw new Error('Wrangler accounts output is not an array');
          accounts = data.map(acc => ({ id: acc.id, name: acc.name }));
        } catch (jsonErr) {
          // Fallback: parse table output
          output = execSync('wrangler accounts list', { encoding: 'utf8' });
          // Parse lines like: │ Account Name │ Account ID │
          const lines = output.split('\n').filter(line => /\|/.test(line) && !/─/.test(line) && !/Account Name/.test(line));
          for (const line of lines) {
            const match = line.match(/\|\s*(.*?)\s*\|\s*([a-z0-9]{32})\s*\|/i);
            if (match) {
              accounts.push({ name: match[1], id: match[2] });
            }
          }
          if (!accounts.length) throw new Error('No accounts found in wrangler output');
        }
        // Get email from wrangler whoami
        let whoami = '';
        let wranglerEmail = '';
        try {
          whoami = execSync('wrangler whoami', { encoding: 'utf8' });
          const match = whoami.match(/associated with the email ([^\.]+)\./);
          if (match) wranglerEmail = match[1].trim();
        } catch (e) {
          try {
            const configPath = path.join(os.homedir(), '.wrangler', 'config', 'default.toml');
            if (fs.existsSync(configPath)) {
              const content = fs.readFileSync(configPath, 'utf8');
              const emailMatch = content.match(/email\s*=\s*"([^"]+)"/);
              if (emailMatch) wranglerEmail = emailMatch[1];
            }
          } catch {}
        }
        return res.json({ accounts, email: wranglerEmail });
      } catch (err) {
        return res.status(400).json({ error: err.message || 'Failed to fetch accounts with wrangler' });
      }
    }
    // API key flow (default)
    if (!email || !globalKey) {
      return res.status(400).json({ error: 'Missing email or globalKey' });
    }
    let accounts = [];
    let page = 1;
    let totalPages = 1;
    do {
      const response = await fetch(`https://api.cloudflare.com/client/v4/accounts?per_page=50&page=${page}&order=name&direction=asc`, {
        headers: {
          'X-Auth-Email': email,
          'X-Auth-Key': globalKey,
          'Content-Type': 'application/json',
        }
      });
      const data = await response.json();
      if (!data.success || !Array.isArray(data.result)) {
        return res.status(400).json({ error: data.errors?.[0]?.message || 'Failed to fetch accounts' });
      }
      accounts = accounts.concat(data.result.map(acc => ({ id: acc.id, name: acc.name })));
      if (data.result_info && data.result_info.total_pages) {
        totalPages = data.result_info.total_pages;
      } else {
        break;
      }
      page++;
    } while (page <= totalPages);
    res.json({ accounts, email });
  } catch (err) {
    res.status(400).json({ error: err.message || 'Unknown error' });
  }
});

// Get zones (domains) for the selected account
app.post('/api/zones', async (req, res) => {
  try {
    const { email, globalKey, accountId } = req.body;
    if (!email || !globalKey || !accountId) {
      return res.status(400).json({ error: 'Missing email, globalKey, or accountId' });
    }
    
    let zones = [];
    let page = 1;
    let totalPages = 1;
    
    do {
      const response = await fetch(`https://api.cloudflare.com/client/v4/zones?account.id=${accountId}&per_page=50&page=${page}&order=name&direction=asc`, {
        headers: {
          'X-Auth-Email': email,
          'X-Auth-Key': globalKey,
          'Content-Type': 'application/json',
        }
      });
      const data = await response.json();
      if (!data.success || !Array.isArray(data.result)) {
        return res.status(400).json({ error: data.errors?.[0]?.message || 'Failed to fetch zones' });
      }
      zones = zones.concat(data.result.map(zone => ({ id: zone.id, name: zone.name })));
      if (data.result_info && data.result_info.total_pages) {
        totalPages = data.result_info.total_pages;
      } else {
        break;
      }
      page++;
    } while (page <= totalPages);
    
    res.json({ zones });
  } catch (err) {
    res.status(400).json({ error: err.message || 'Unknown error' });
  }
});

app.listen(PORT, () => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] 🚀 Illumin8 Cloudflare Launcher running at http://localhost:${PORT}`);
  console.log(`[${timestamp}] 📖 Open your browser to start the setup wizard`);
  console.log(`[${timestamp}] 🔧 Available endpoints:`);
  console.log(`[${timestamp}]    GET  /                 - Setup wizard`);
  console.log(`[${timestamp}]    POST /api/account      - Get account ID`);
  console.log(`[${timestamp}]    POST /api/token        - Create API token`);
  console.log(`[${timestamp}]    POST /api/build        - Run build commands`);
  console.log(`[${timestamp}]    POST /api/access       - Configure Cloudflare Access`);
  console.log(`[${timestamp}]    POST /api/accounts     - Get all accounts`);
}); 