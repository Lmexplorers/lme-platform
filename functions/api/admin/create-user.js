/**
 * Admin-endpoint for å opprette nye brukere.
 * Krever at du er logget inn som owner.
 *
 * POST /api/admin/create-user
 * { email, password, name, role }
 */

import { sessionUser } from "../../_lib/access.js";

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" }
  });
}

function hex(buf) {
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}
function unhex(s) {
  const a = new Uint8Array(s.length / 2);
  for (let i = 0; i < a.length; i++) a[i] = parseInt(s.substr(i * 2, 2), 16);
  return a;
}

async function pbkdf2(password, salt) {
  const key = await crypto.subtle.importKey(
    "raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]
  );
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt, iterations: 100000, hash: "SHA-256" }, key, 256
  );
  return new Uint8Array(bits);
}

async function hashPassword(password) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  return { salt: hex(salt), hash: hex(await pbkdf2(password, salt)) };
}

export async function onRequestPost(context) {
  const { request, env } = context;

  const user = await sessionUser(context);
  if (!user || (user.role !== "owner" && user.role !== "admin")) {
    return json({ error: "Unauthorized. Must be logged in as owner." }, 403);
  }

  let body;
  try {
    body = await request.json();
  } catch (e) {
    return json({ error: "Invalid JSON" }, 400);
  }

  const { email, password, name, role = "customer" } = body;

  if (!email || !password || !name) {
    return json({ error: "Missing required fields: email, password, name" }, 400);
  }

  const emailLower = email.trim().toLowerCase();

  const existing = await env.BUILDER_KV.get("user:" + emailLower);
  if (existing) {
    return json({ error: "User already exists" }, 409);
  }

  try {
    const { salt, hash } = await hashPassword(password);

    const newUser = {
      id: crypto.randomUUID(),
      email: emailLower,
      name: name.trim(),
      salt,
      hash,
      role: role === "owner" ? "owner" : "customer",
      created_at: new Date().toISOString(),
      subscription: role === "owner" ? {
        status: "active",
        tier: "vip",
        limits: { image: 1000, video: 100 }
      } : null,
      purchases: []
    };

    await env.BUILDER_KV.put("user:" + emailLower, JSON.stringify(newUser));

    return json({
      ok: true,
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role
      },
      message: `User ${email} created successfully`
    }, 201);
  } catch (e) {
    console.error("Error creating user:", e);
    return json({ error: "Failed to create user: " + e.message }, 500);
  }
}
