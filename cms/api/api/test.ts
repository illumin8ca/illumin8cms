import type { PagesFunction } from '@cloudflare/workers-types';

export const onRequestGet: PagesFunction = () => {
  return new Response(
    JSON.stringify({ 
      status: 'ok', 
      message: 'API test endpoint is working', 
      timestamp: new Date().toISOString() 
    }),
    { headers: { 'Content-Type': 'application/json' } }
  );
}; 