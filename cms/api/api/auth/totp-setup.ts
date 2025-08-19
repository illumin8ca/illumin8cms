import type { Env } from "../../types";
import { authenticator } from "otplib";

export const onRequestPost: PagesFunction<Env> = async ({ env }) => {
  // TODO: Authenticate admin session (for now, allow)
  // Generate TOTP secret
  const secret = authenticator.generateSecret();
  const otpauth = authenticator.keyuri(
    "admin@illumin8cms",
    "Illumin8CMS",
    secret
  );
  // TODO: Store secret in DB for the admin user (encrypted)
  return new Response(
    JSON.stringify({ secret, otpauth }),
    { headers: { "Content-Type": "application/json" } }
  );
}; 