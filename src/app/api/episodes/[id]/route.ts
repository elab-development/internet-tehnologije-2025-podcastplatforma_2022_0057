export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyAuthToken } from "@/lib/auth";
import { db } from "@/db";
import { users, episodes, series } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

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

export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  const cookieStore = await cookies();
  const token = cookieStore.get("auth")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const claims = await verifyAuthToken(token);
  const [user] = await db.select().from(users).where(eq(users.id, claims.sub));
  if (!user || user.role !== "ADMIN")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  // 1) uzmi epizodu pre izmene (da znaš stari seriesId)
  const [before] = await db.select().from(episodes).where(eq(episodes.id, id));
  if (!before) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const data = await req.json();

  // ne dozvoli promenu id / createdAt
  if ("id" in data) delete data.id;
  if ("createdAt" in data) delete data.createdAt;

  // PATCH — samo dozvoljena polja
  const patch: Partial<typeof episodes.$inferInsert> = {
    ...(data.seriesId !== undefined ? { seriesId: data.seriesId } : {}),
    ...(data.title !== undefined ? { title: data.title } : {}),
    ...(data.durationSec !== undefined ? { durationSec: Number(data.durationSec) } : {}),
    ...(data.imageUrlEp !== undefined ? { imageUrlEp: data.imageUrlEp } : {}),
    ...(data.mediaPath !== undefined ? { mediaPath: data.mediaPath } : {}),
    ...(data.orderIndex !== undefined ? { orderIndex: data.orderIndex } : {}),
    updatedAt: new Date(),
  };

  const [updated] = await db
    .update(episodes)
    .set(patch)
    .where(eq(episodes.id, id))
    .returning();

  // 2) preračunaj totals za novi serijal
  await recalcSeries(updated.seriesId);

  // 3) ako je prebačena u drugi serijal, preračunaj i stari
  if (before.seriesId !== updated.seriesId) {
    await recalcSeries(before.seriesId);
  }

  return NextResponse.json(updated);
}

export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  const cookieStore = await cookies();
  const token = cookieStore.get("auth")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const claims = await verifyAuthToken(token);
  const [user] = await db.select().from(users).where(eq(users.id, claims.sub));
  if (!user || user.role !== "ADMIN")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  // da znamo kom serijalu pripada pre brisanja
  const [before] = await db.select().from(episodes).where(eq(episodes.id, id));
  if (!before) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await db.delete(episodes).where(eq(episodes.id, id));

  await recalcSeries(before.seriesId);

  return NextResponse.json({ ok: true });
}

