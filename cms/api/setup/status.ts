import type { Env } from "./types";

export const onRequestGet: PagesFunction<Env> = async ({ env }) => {
  // Check if any admin user exists
  const row = await env.DB.prepare(
    `SELECT id FROM users WHERE role = 'admin' LIMIT 1`
  ).first<{ id: number }>();
  const setupRequired = !row;
  return new Response(
    JSON.stringify({ setupRequired }),
    { headers: { "Content-Type": "application/json" } }
  );
}; 