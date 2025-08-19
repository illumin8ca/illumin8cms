import type { PagesFunction } from '@cloudflare/workers-types';

export const onRequestGet: PagesFunction = () => {
  return new Response(
    JSON.stringify({ status: 'healthy', timestamp: new Date().toISOString() }),
    { headers: { 'Content-Type': 'application/json' } }
  );
}; 