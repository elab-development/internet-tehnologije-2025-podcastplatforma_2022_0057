export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyAuthToken } from "@/lib/auth";
import { db } from "@/db";
import { users, series } from "@/db/schema";
import { eq } from "drizzle-orm";

type UpdateSeriesBody = {
  id?: string; // zabranjeno
  title?: string;
  description?: string;
  imageUrlSer?: string;
  typeId?: string;

  // ⛔ zabranjeno jer se računa iz epizoda
  totalDurationSec?: number;
  episodesCount?: number;
};

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
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const data = await req.json();

  // blokiraj polja
  if ("id" in data) delete data.id;
  if ("totalDurationSec" in data) delete data.totalDurationSec;
  if ("episodesCount" in data) delete data.episodesCount;

  const patch: Partial<typeof series.$inferInsert> = {
    ...(data.title !== undefined ? { title: data.title } : {}),
    ...(data.description !== undefined ? { description: data.description } : {}),
    ...(data.imageUrlSer !== undefined ? { imageUrlSer: data.imageUrlSer } : {}),
    ...(data.typeId !== undefined ? { typeId: data.typeId } : {}),
    updatedAt: new Date(),
  };

  const [updated] = await db
    .update(series)
    .set(patch)
    .where(eq(series.id, id))
    .returning();

  return NextResponse.json(updated);
}


export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

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

  await db.delete(series).where(eq(series.id, id));

  return NextResponse.json({ ok: true });
}
