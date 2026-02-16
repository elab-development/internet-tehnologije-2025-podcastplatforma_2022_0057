export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyAuthToken } from "@/lib/auth";
import { db } from "@/db";
import { users, episodes, series } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { randomUUID } from "crypto";

async function recalcSeries(seriesId: string) {
  const [stats] = await db
    .select({
      count: sql<number>`count(*)`.mapWith(Number),
      total: sql<number>`coalesce(sum(${episodes.durationSec}), 0)`.mapWith(Number),
    })
    .from(episodes)
    .where(eq(episodes.seriesId, seriesId));

  await db
    .update(series)
    .set({
      episodesCount: stats?.count ?? 0,
      totalDurationSec: stats?.total ?? 0,
      updatedAt: new Date(),
    })
    .where(eq(series.id, seriesId));
}

export async function POST(req: Request) {
   const cookieStore = await cookies();
  const token = cookieStore.get("auth")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const claims = await verifyAuthToken(token);
  const [user] = await db.select().from(users).where(eq(users.id, claims.sub));
  if (!user || user.role !== "ADMIN")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();

  const [created] = await db
    .insert(episodes)
    .values({
      id: randomUUID(),
      ...body,
    })
    .returning();

  await recalcSeries(body.seriesId);

  return NextResponse.json(created);
}

export async function GET() {
  const data = await db.select().from(episodes);
  return NextResponse.json(data);
}

