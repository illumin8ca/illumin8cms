import type { Env } from "../types";

export const onRequestGet: PagesFunction<Env> = async ({ env }) => {
  const { results } = await env.DB.prepare(
    `SELECT id, title, slug, content, status, meta_title, meta_description, meta_keywords FROM pages ORDER BY menu_order, id`
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
  if (!body.title || !body.slug) {
    return new Response("Missing title or slug", { status: 400 });
  }
  const { title, slug, content, status, meta_title, meta_description, meta_keywords } = body;
  const result = await env.DB.prepare(
    `INSERT INTO pages (title, slug, content, status, meta_title, meta_description, meta_keywords) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)`
  ).bind(title, slug, content || '', status || 'draft', meta_title || '', meta_description || '', meta_keywords || '').run();
  return new Response(JSON.stringify({ id: result.lastRowId }), {
    headers: { "Content-Type": "application/json" },
  });
}; 