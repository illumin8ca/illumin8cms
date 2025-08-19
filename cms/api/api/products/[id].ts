import type { Env } from "../../types";

export const onRequestGet: PagesFunction<Env> = async ({ env, params }) => {
  const id = params.id as string;
  const row = await env.DB.prepare(
    `SELECT id, title, slug, description, price, image, stock, category FROM products WHERE id = ?1`
  ).bind(id).first();
  if (!row) {
    return new Response("Not found", { status: 404 });
  }
  return new Response(JSON.stringify(row), {
    headers: { "Content-Type": "application/json" },
  });
};

export const onRequestPut: PagesFunction<Env> = async ({ request, env, params }) => {
  const id = params.id as string;
  let body;
  try {
    body = await request.json();
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }
  const { title, slug, description, price, image, stock, category } = body;
  await env.DB.prepare(
    `UPDATE products SET title = ?1, slug = ?2, description = ?3, price = ?4, image = ?5, stock = ?6, category = ?7 WHERE id = ?8`
  ).bind(title, slug, description, price, image, stock, category, id).run();
  return new Response(JSON.stringify({ success: true }), {
    headers: { "Content-Type": "application/json" },
  });
};

export const onRequestDelete: PagesFunction<Env> = async ({ env, params }) => {
  const id = params.id as string;
  await env.DB.prepare(
    `DELETE FROM products WHERE id = ?1`
  ).bind(id).run();
  return new Response(JSON.stringify({ success: true }), {
    headers: { "Content-Type": "application/json" },
  });
}; 