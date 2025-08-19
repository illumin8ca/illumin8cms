interface ContactPayload {
  name: string;
  email: string;
  message: string;
}

export const onRequestPost: PagesFunction = async ({ request, env }) => {
  let data: ContactPayload;
  try {
    data = await request.json();
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }

  const mailRes = await fetch("https://api.mailchannels.net/tx/v1/send", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      personalizations: [
        {
          to: [{ email: env.CONTACT_EMAIL || "info@scenicvalleyquilting.com" }],
          dkim_domain: env.MAILCHANNELS_DOMAIN,
          dkim_selector: "mailchannels",
          dkim_private_key: env.MAILCHANNELS_PRIVATE_KEY
        }
      ],
      from: { email: data.email, name: data.name },
      subject: `Contact form message from ${data.name}`,
      content: [{ type: "text/plain", value: data.message }]
    })
  });

  if (!mailRes.ok) {
    return new Response("Failed to send", { status: 502 });
  }

  return new Response("OK", { status: 200 });
}; 