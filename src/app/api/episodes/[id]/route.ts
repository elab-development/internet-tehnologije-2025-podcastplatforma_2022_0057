export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyAuthToken } from "@/lib/auth";
import { db } from "@/db";
import { users, episodes, series } from "@/db/schema";
import { eq, sql } from "drizzle-orm";


export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params; 

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

  const [episode] = await db
    .select()
    .from(episodes)
    .where(eq(episodes.id, id));

  if (!episode) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  
  await db.delete(episodes).where(eq(episodes.id, id));

  
  const stats = await db
    .select({
      count: sql<number>`count(*)`,
      total: sql<number>`coalesce(sum(${episodes.durationSec}), 0)`,
    })
    .from(episodes)
    .where(eq(episodes.seriesId, episode.seriesId));

 
  await db
    .update(series)
    .set({
      episodesCount: stats[0].count,
      totalDurationSec: stats[0].total,
      updatedAt: new Date(),
    })
    .where(eq(series.id, episode.seriesId));

  return NextResponse.json({ ok: true });
}
