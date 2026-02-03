export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyAuthToken } from "@/lib/auth";
import { db } from "@/db";
import { users, episodes, series } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { randomUUID } from "crypto";


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

  const [created] = await db
    .insert(episodes)
    .values({
      id: randomUUID(),
      ...body,
    })
    .returning();

 
  const stats = await db
    .select({
      count: sql<number>`count(*)`,
      total: sql<number>`coalesce(sum(${episodes.durationSec}), 0)`,
    })
    .from(episodes)
    .where(eq(episodes.seriesId, body.seriesId));

  
  await db
    .update(series)
    .set({
      episodesCount: stats[0].count,
      totalDurationSec: stats[0].total,
      updatedAt: new Date(),
    })
    .where(eq(series.id, body.seriesId));

  return NextResponse.json(created);
}


export async function GET() {
  const data = await db.select().from(episodes);
  return NextResponse.json(data);
}
