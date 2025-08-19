import type { Env } from "../../types";
import { authenticator } from "otplib";

interface VerifyBody {
  username: string;
  code: string;
  secret: string;
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  let body: VerifyBody;
  try {
    body = await request.json();
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }
  // Verify TOTP code
  const isValid = authenticator.check(body.code, body.secret);
  if (!isValid) {
    return new Response(JSON.stringify({ success: false, error: "Invalid code" }), { status: 400 });
  }
  // Store secret in DB for the user
  await env.DB.prepare(
    `UPDATE users SET totp_secret = ?1 WHERE username = ?2`
  ).bind(body.secret, body.username).run();
  return new Response(JSON.stringify({ success: true }), { headers: { "Content-Type": "application/json" } });
}; 