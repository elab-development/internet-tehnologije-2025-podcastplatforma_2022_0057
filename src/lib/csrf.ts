// src/lib/csrf.ts
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { randomUUID } from "crypto";

export const CSRF_COOKIE = "csrf";

export async function getOrSetCsrfToken() {
  const store = await cookies();
  let token = store.get(CSRF_COOKIE)?.value;

  if (!token) {
    token = randomUUID();
    store.set(CSRF_COOKIE, token, {
      httpOnly: false, // FE mora da procita token i posalje u header
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
  }

  return token;
}

export async function requireCsrf(req: Request) {
  const store = await cookies();
  const cookieToken = store.get(CSRF_COOKIE)?.value;
  const headerToken = req.headers.get("x-csrf-token");

  if (!cookieToken || !headerToken || cookieToken !== headerToken) {
    return NextResponse.json({ error: "CSRF blocked" }, { status: 403 });
  }

  return null;
}