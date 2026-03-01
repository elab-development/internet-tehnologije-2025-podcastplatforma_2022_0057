import { NextResponse } from "next/server";

export function requireOrigin(req: Request) {
  const origin = req.headers.get("origin");

  
  if (!origin) return null;

  
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