import type { Env } from "../types";
import { requireAdmin } from "./_auth";

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const auth = requireAdmin(request);
  if (auth instanceof Response) return auth;

  const { results } = await env.DB.prepare(
    "SELECT * FROM products ORDER BY id"
  ).all();

  return new Response(JSON.stringify(results), {
    headers: { "Content-Type": "application/json" },
  });
}; 