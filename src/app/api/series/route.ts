export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyAuthToken } from "@/lib/auth";
import { db } from "@/db";
import { users, series } from "@/db/schema";
import { eq } from "drizzle-orm";

// 🔓 GET /api/series – svi mogu da vide serijale
export async function GET() {
  const data = await db.select().from(series);
  return NextResponse.json(data);
}

// 🔒 POST /api/series – samo ADMIN
export async function POST(req: Request) {

 const cookieStore = await cookies();
  const token = cookieStore.get("auth")?.value;
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const claims = await verifyAuthToken(token);
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, claims.sub));

  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const [created] = await db.insert(series).values(body).returning();

  return NextResponse.json(created);
}
