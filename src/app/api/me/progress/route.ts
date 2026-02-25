export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { requireOrigin } from "@/lib/security";
import { requireCsrf } from "@/lib/csrf";
import { requireUser } from "@/lib/requireUser";
import { db } from "@/db";
import { listenProgress } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(req: Request) {
  const cors = requireOrigin(req);
  if (cors) return cors;

  const auth = await requireUser();
  if (!auth.ok) return auth.res;

  const data = await db
    .select()
    .from(listenProgress)
    .where(eq(listenProgress.userId, auth.user.id));

  return NextResponse.json(data);
}

export async function PUT(req: Request) {
  const cors = requireOrigin(req);
  if (cors) return cors;

  const csrf = await requireCsrf(req);
  if (csrf) return csrf;

  const auth = await requireUser();
  if (!auth.ok) return auth.res;

  const { episodeId, positionSec, completed } = await req.json();

  if (!episodeId) {
    return NextResponse.json({ error: "Missing episodeId" }, { status: 400 });
  }

  // ✅ IDOR: userId je ALWAYS auth.user.id
  await db
    .insert(listenProgress)
    .values({
      userId: auth.user.id,
      episodeId,
      positionSec: Number(positionSec ?? 0),
      completed: Boolean(completed ?? false),
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: [listenProgress.userId, listenProgress.episodeId],
      set: {
        positionSec: Number(positionSec ?? 0),
        completed: Boolean(completed ?? false),
        updatedAt: new Date(),
      },
    });

  return NextResponse.json({ ok: true });
}