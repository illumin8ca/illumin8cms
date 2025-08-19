import type { NextRequest } from 'next/server';

export const config = {
  runtime: 'edge',
};

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  }

  try {
    const { email, globalKey, accountId, useWranglerLogin } = await req.json();
    if (useWranglerLogin) {
      // Use wrangler CLI to list zones for the logged-in user
      const { execSync } = await import('child_process');
      try {
        // Get all zones for all accounts
        const output = execSync('wrangler api GET /zones', { encoding: 'utf8' });
        const data = JSON.parse(output);
        if (!data.success || !Array.isArray(data.result)) {
          return new Response(JSON.stringify({ error: data.errors?.[0]?.message || 'Failed to fetch zones' }), { status: 400 });
        }
        const zones = data.result.map((zone: any) => ({ id: zone.id, name: zone.name, account: zone.account?.name || '' }));
        return new Response(JSON.stringify({ zones }), { status: 200 });
      } catch (err: any) {
        return new Response(JSON.stringify({ error: err.message || 'Failed to fetch zones with wrangler' }), { status: 400 });
      }
    } else {
      if (!email || !globalKey || !accountId) {
        return new Response(JSON.stringify({ error: 'Missing email, globalKey, or accountId' }), { status: 400 });
      }
      const resp = await fetch(`https://api.cloudflare.com/client/v4/accounts/${accountId}/zones`, {
        headers: {
          'X-Auth-Email': email,
          'X-Auth-Key': globalKey,
          'Content-Type': 'application/json',
        },
      });
      const data = await resp.json();
      if (!data.success || !Array.isArray(data.result)) {
        return new Response(JSON.stringify({ error: data.errors?.[0]?.message || 'Failed to fetch zones' }), { status: 400 });
      }
      const zones = data.result.map((zone: any) => ({ id: zone.id, name: zone.name }));
      return new Response(JSON.stringify({ zones }), { status: 200 });
    }
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || 'Unknown error' }), { status: 400 });
  }
} 