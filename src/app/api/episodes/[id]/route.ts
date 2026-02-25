export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyAuthToken } from "@/lib/auth";
import { db } from "@/db";
import { users, episodes, series } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { randomUUID } from "crypto";
import path from "path";
import { writeFile, mkdir } from "fs/promises";
import { requireOrigin } from "@/lib/security";
import { requireCsrf } from "@/lib/csrf";

/* ----------------------- POMOĆNE FUNKCIJE ----------------------- */

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

async function saveUpload(file: File, folder: string) {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const ext = path.extname(file.name) || "";
  const filename = `${randomUUID()}${ext}`;

  const uploadDir = path.join(process.cwd(), "public", folder);
  await mkdir(uploadDir, { recursive: true });

  const filepath = path.join(uploadDir, filename);
  await writeFile(filepath, buffer);

  return filename; // ⚠ vraćamo samo ime fajla
}

async function requireAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth")?.value;
  if (!token) {
    return {
      ok: false as const,
      res: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  const claims = await verifyAuthToken(token);
  const [user] = await db.select().from(users).where(eq(users.id, claims.sub));

  if (!user || user.role !== "ADMIN") {
    return {
      ok: false as const,
      res: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    };
  }

  return { ok: true as const };
}


export async function PUT(req: Request, context: { params: Promise<{ id: string }> }) {

  

  const auth = await requireAdmin();
  if (!auth.ok) return auth.res;
  // ✅ CORS zaštita
  const cors = requireOrigin(req);
  if (cors) return cors;

  // ✅ CSRF zaštita
  const csrf = await requireCsrf(req);
  if (csrf) return csrf;

  const { id } = await context.params;

  const [before] = await db
    .select()
    .from(episodes)
    .where(eq(episodes.id, id));

  if (!before)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  const form = await req.formData();

  const nextSeriesIdRaw = form.get("seriesId");
  const titleRaw = form.get("title");
  const durationRaw = form.get("durationSec");
  const image = form.get("image");
  const audio = form.get("audio");

  const patch: Partial<typeof episodes.$inferInsert> = {
    updatedAt: new Date(),
  };

  if (typeof nextSeriesIdRaw === "string" && nextSeriesIdRaw.trim()) {
    patch.seriesId = nextSeriesIdRaw.trim();
  }

  if (typeof titleRaw === "string" && titleRaw.trim()) {
    patch.title = titleRaw.trim();
  }

  if (typeof durationRaw === "string" && durationRaw !== "") {
    const n = Number(durationRaw);
    if (!Number.isFinite(n) || n <= 0) {
      return NextResponse.json(
        { error: "Invalid durationSec" },
        { status: 400 }
      );
    }
    patch.durationSec = n;
  }

  // ✅ SLUČAJ 1: Upload slike
  if (image instanceof File && image.size > 0) {
    const imageFilename = await saveUpload(image, "episodes");
    patch.imageUrlEp = `/episodes/${imageFilename}`;
  }

  // ✅ SLUČAJ 2: Upload audio fajla
  if (audio instanceof File && audio.size > 0) {
    const audioFilename = await saveUpload(audio, "audios");
    patch.mediaPath = audioFilename; // samo ime fajla
  }

  const [updated] = await db
    .update(episodes)
    .set(patch)
    .where(eq(episodes.id, id))
    .returning();

  const oldSeriesId = before.seriesId;
  const newSeriesId = updated.seriesId;

  if (oldSeriesId !== newSeriesId) {
    await recalcSeries(oldSeriesId);
    await recalcSeries(newSeriesId);
  } else {
    await recalcSeries(newSeriesId);
  }

  return NextResponse.json(updated);
}


export async function DELETE(req: Request, context: { params: Promise<{ id: string }> }) {
  // ✅ CORS zaštita
  const cors = requireOrigin(req);
  if (cors) return cors;

  // ✅ CSRF zaštita
  const csrf = await requireCsrf(req);
  if (csrf) return csrf;

  const auth = await requireAdmin();
  if (!auth.ok) return auth.res;

  const { id } = await context.params;

  const [before] = await db
    .select()
    .from(episodes)
    .where(eq(episodes.id, id));

  if (!before)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  await db.delete(episodes).where(eq(episodes.id, id));

  await recalcSeries(before.seriesId);

  return NextResponse.json({ ok: true });
}