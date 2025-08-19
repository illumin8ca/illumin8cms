// This file is never executed directly.
// It's a placeholder for wrangler.toml configuration.
// Pages Functions are auto-detected from the directory structure.

export default {
  fetch() {
    return new Response("This endpoint should never be called directly", { status: 404 });
  }
}; 