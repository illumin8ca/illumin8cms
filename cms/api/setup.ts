import type { Env } from "./types";
import bcrypt from "bcryptjs";

interface SetupBody {
  username: string;
  password: string;
  email?: string;
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  // Check if admin user already exists
  const existing = await env.DB.prepare(
    `SELECT id FROM users WHERE role = 'admin' LIMIT 1`
  ).first<{ id: number }>();
  if (existing) {
    return new Response(
      JSON.stringify({ error: "Admin user already exists" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  let body: SetupBody;
  try {
    body = await request.json();
  } catch {
    return new Response(
      JSON.stringify({ error: "Invalid JSON" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  if (!body.username || !body.password) {
    return new Response(
      JSON.stringify({ error: "Username and password are required" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  // Hash password
  const password_hash = await bcrypt.hash(body.password, 12);

  // Insert admin user
  await env.DB.prepare(
    `INSERT INTO users (username, password_hash, email, role, is_active) VALUES (?1, ?2, ?3, 'admin', 1)`
  ).bind(body.username, password_hash, body.email || null).run();

  return new Response(
    JSON.stringify({ success: true }),
    { headers: { "Content-Type": "application/json" } }
  );
}; 