import { NextResponse } from "next/server";

export function requireOrigin(req: Request) {
  const origin = req.headers.get("origin");

  // Dozvoli ako nema origina (npr. serverski pozivi ili Postman)
  if (!origin) return null;

  // Fleksibilna provera: dozvoli ako domen sadrži railway.app ili localhost
  const isAllowed = origin.includes("railway.app") || origin.includes("localhost");

  if (!isAllowed) {
    return NextResponse.json(
      { error: "CORS blocked" },
      { status: 403 }
    );
  }

  return null;
}
{/*"http://localhost:3000"*/}