// NOTE: This file must be run in a local Node.js environment, not edge/serverless. child_process is not available in edge/serverless runtimes.
import type { NextRequest } from 'next/server';

export const config = {
  runtime: 'nodejs', // not edge
};

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  }

  let bodyRaw = '';
  let parsedBody = {};
  try {
    bodyRaw = await req.text();
    parsedBody = JSON.parse(bodyRaw);
    console.log('[DEBUG /api/accounts] Request body:', parsedBody);
  } catch (e) {
    console.log('[DEBUG /api/accounts] Failed to parse request body:', bodyRaw);
  }

  try {
    const { email, globalKey, useWranglerLogin } = parsedBody;
    console.log('[DEBUG /api/accounts] useWranglerLogin:', useWranglerLogin);
    
    if (useWranglerLogin) {
      let output = '';
      try {
        const { execSync } = await import('child_process');
        output = execSync('wrangler api GET /accounts', { encoding: 'utf8' });
        if (!output) throw new Error('No output from wrangler CLI');
        let data;
        try {
          data = JSON.parse(output);
        } catch (parseErr) {
          throw new Error('Failed to parse wrangler output: ' + output);
        }
        if (!data.success || !Array.isArray(data.result)) {
          throw new Error('Wrangler error: ' + JSON.stringify(data.errors));
        }
        const accounts = data.result.map((acc: any) => ({ id: acc.id, name: acc.name }));

        // Get email from wrangler whoami
        let whoami = '';
        let wranglerEmail = '';
        try {
          whoami = execSync('wrangler whoami', { encoding: 'utf8' });
          const match = whoami.match(/associated with the email ([^\.]+)\./);
          if (match) wranglerEmail = match[1].trim();
        } catch (e) {
          try {
            const fs = await import('fs');
            const os = await import('os');
            const configPath = `${os.homedir()}/.wrangler/config/default.toml`;
            if (fs.existsSync(configPath)) {
              const content = fs.readFileSync(configPath, 'utf8');
              const emailMatch = content.match(/email\s*=\s*"([^"]+)"/);
              if (emailMatch) wranglerEmail = emailMatch[1];
            }
          } catch {}
        }

        return new Response(JSON.stringify({ accounts, email: wranglerEmail }), { status: 200 });
      } catch (err: any) {
        return new Response(JSON.stringify({ error: err.message || 'Failed to fetch accounts with wrangler' }), { status: 400 });
      }
    } else {
      if (!email || !globalKey) {
        return new Response(JSON.stringify({ error: 'Missing email or globalKey' }), { status: 400 });
      }

      const resp = await fetch('https://api.cloudflare.com/client/v4/accounts', {
        headers: {
          'X-Auth-Email': email,
          'X-Auth-Key': globalKey,
          'Content-Type': 'application/json',
        },
      });
      const data = await resp.json();
      if (!data.success || !Array.isArray(data.result)) {
        return new Response(JSON.stringify({ error: data.errors?.[0]?.message || 'Failed to fetch accounts' }), { status: 400 });
      }
      const accounts = data.result.map((acc: any) => ({ id: acc.id, name: acc.name }));
      return new Response(JSON.stringify({ accounts, email }), { status: 200 });
    }
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || 'Unknown error' }), { status: 400 });
  }
} 