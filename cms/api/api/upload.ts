import type { Env } from "../types";

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const form = await request.formData();
  const file = form.get("file") as File | null;
  if (!file) return new Response("file field missing", { status: 400 });

  const key = Date.now() + "-" + file.name.replace(/[^a-zA-Z0-9._-]/g, "");
  const putRes = await env.R2.put(key, file.stream());

  if (!putRes) return new Response("upload failed", { status: 500 });

  const publicUrl = `https://${env.R2.bucket_name}.r2.cloudflarestorage.com/${key}`;
  return new Response(JSON.stringify({ url: publicUrl }), {
    headers: { "Content-Type": "application/json" }
  });
}; 