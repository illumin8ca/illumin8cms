import type { Env } from "../../types";

export const onRequestGet: PagesFunction<Env> = async ({ env, params }) => {
  const slug = params.slug as string;
  const statement = env.DB.prepare(
    `SELECT * FROM products WHERE slug = ?1 AND is_active = 1 LIMIT 1`
  ).bind(slug);
  const { results } = await statement.all();
  if (results.length === 0) {
    return new Response("Not found", { status: 404 });
  }
  return new Response(JSON.stringify(results[0]), {
    headers: { "Content-Type": "application/json" }
  });
}; 