import { NextResponse } from "next/server";

const ALLOWED = (process.env.ALLOWED_ORIGINS ?? "http://localhost:3000")
  .split(",")
  .map(s => s.trim())
  .filter(Boolean);

export function requireOrigin(req: Request) {
  const origin = req.headers.get("origin");

  // Postman, server-to-server → dozvoli
  if (!origin) return null;

  if (!ALLOWED.includes(origin)) {
    return NextResponse.json(
      { error: "CORS blocked" },
      { status: 403 }
    );
  }

  return null;
}