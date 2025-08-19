import type { Env } from "../../types";
import { authenticator } from "otplib";

interface ValidateBody {
  username: string;
  code: string;
}

// CORS headers helper
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400',
};

// Handle OPTIONS requests for CORS preflight
export const onRequestOptions: PagesFunction<Env> = async () => {
  return new Response(null, {
    status: 200,
    headers: corsHeaders,
  });
};

// Handle POST requests for 2FA validation
export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  let body: ValidateBody;
  try {
    body = await request.json();
  } catch {
    return new Response("Invalid JSON", { 
      status: 400,
      headers: corsHeaders,
    });
  }
  // Get user's TOTP secret
  const row = await env.DB.prepare(
    `SELECT totp_secret FROM users WHERE username = ?1 LIMIT 1`
  ).bind(body.username).first<{ totp_secret: string }>();
  if (!row || !row.totp_secret) {
    return new Response(JSON.stringify({ success: false, error: "2FA not enabled" }), { 
      status: 400,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      }
    });
  }
  // Validate code
  const isValid = authenticator.check(body.code, row.totp_secret);
  if (!isValid) {
    return new Response(JSON.stringify({ success: false, error: "Invalid code" }), { 
      status: 400,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      }
    });
  }
  return new Response(JSON.stringify({ success: true }), { 
    headers: { 
      "Content-Type": "application/json",
      ...corsHeaders,
    } 
  });
}; 