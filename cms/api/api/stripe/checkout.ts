import type { Env } from "../../types";

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const items = await request.json(); // Expect [{id, quantity}]

  // TODO: map item IDs to price data via env.DB, then call Stripe API
  const session = { id: "cs_test_placeholder" };

  return new Response(JSON.stringify({ sessionId: session.id }), {
    headers: { "Content-Type": "application/json" }
  });
}; 