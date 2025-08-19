import type { PagesFunction } from '@cloudflare/workers-types';

// Reusable helper to protect admin endpoints behind Cloudflare Access.
// If the request is not authenticated by Access, the necessary headers will be missing.
export function requireAdmin(request: Request): string | Response {
  const email = request.headers.get('cf-access-user');
  if (!email) {
    return new Response('Unauthorized', { status: 401 });
  }
  return email;
} 