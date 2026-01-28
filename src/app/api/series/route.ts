export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyAuthToken } from "@/lib/auth";
import { db } from "@/db";
import { users, series } from "@/db/schema";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";


// 🔓 GET /api/series – svi mogu da vide serijale
export async function GET() {
  const data = await db.select().from(series);
  return NextResponse.json(data);
}

// 🔒 POST /api/series – samo ADMIN
export async function POST(req: Request) {
  const token = (await cookies()).get("auth")?.value;
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

  const {
    title,
    description,
    imageUrlSer,
    typeId,
  } = await req.json();

  const [created] = await db.insert(series).values({
    id: randomUUID(),
    title,
    description,
    imageUrlSer,
    typeId,
    totalDurationSec: 0,
    episodesCount: 0,
  }).returning();

  return NextResponse.json(created);
}

