import { NextResponse } from "next/server";

const ALLOWED = (process.env.ALLOWED_ORIGINS ?? "https://internet-tehnologije-2025-podcastplatforma2022-production.up.railway.app/")
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
{/*"http://localhost:3000"*/}