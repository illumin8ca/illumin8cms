import type { Env } from "../types";

export const onRequestGet: PagesFunction<Env> = async ({ env }) => {
  const { results } = await env.DB.prepare(
    `SELECT id, title, slug, description, price, image, stock, category FROM products ORDER BY id`
  ).all();
  return new Response(JSON.stringify(results), {
    headers: { "Content-Type": "application/json" },
  });
};

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  let body;
  try {
    body = await request.json();
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }
  if (!body.title || !body.slug || !body.price) {
    return new Response("Missing title, slug, or price", { status: 400 });
  }
  const { title, slug, description, price, image, stock, category } = body;
  const result = await env.DB.prepare(
    `INSERT INTO products (title, slug, description, price, image, stock, category) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)`
  ).bind(title, slug, description || '', price, image || '', stock || 0, category || '').run();
  return new Response(JSON.stringify({ id: result.lastRowId }), {
    headers: { "Content-Type": "application/json" },
  });
}; 