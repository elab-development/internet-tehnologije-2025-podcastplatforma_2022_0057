export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyAuthToken } from "@/lib/auth";
import { db } from "@/db";
import { users, series } from "@/db/schema";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";
import path from "path";
import fs from "fs/promises";

async function requireAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth")?.value;
  if (!token) {
    return { ok: false as const, res: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  const claims = await verifyAuthToken(token);
  const [user] = await db.select().from(users).where(eq(users.id, claims.sub));

  if (!user || user.role !== "ADMIN") {
    return { ok: false as const, res: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }

  return { ok: true as const, user };
}

async function saveUploadToPublic(file: File) {
  // public/uploads
  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  await fs.mkdir(uploadsDir, { recursive: true });

  const ext = path.extname(file.name || "") || ".jpg";
  const filename = `${randomUUID()}${ext}`;
  const fullPath = path.join(uploadsDir, filename);

  const arrayBuffer = await file.arrayBuffer();
  await fs.writeFile(fullPath, Buffer.from(arrayBuffer));

  // putanja koja se čuva u bazi i koristi u <img src="...">
  return `/uploads/${filename}`;
}

export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.res;

  // ✅ Next.js 15: params je Promise
  const { id } = await context.params;
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  // uzmi postojeći serijal (da zadrži staru sliku ako nema nove)
  const [existing] = await db.select().from(series).where(eq(series.id, id));
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const form = await req.formData();

  // tekstualna polja
  const title = (form.get("title") as string | null) ?? undefined;
  const description = (form.get("description") as string | null) ?? undefined;
  const typeId = (form.get("typeId") as string | null) ?? undefined;

  // slika (opciono)
  const image = form.get("image");
  let imageUrlSer: string | undefined = undefined;

  if (image && image instanceof File && image.size > 0) {
    imageUrlSer = await saveUploadToPublic(image);
  }

  // PATCH: dozvoli samo ova polja
  const patch: Partial<typeof series.$inferInsert> = {
    ...(title !== undefined ? { title } : {}),
    ...(description !== undefined ? { description } : {}),
    ...(typeId !== undefined ? { typeId } : {}),
    ...(imageUrlSer !== undefined ? { imageUrlSer } : {}),
    updatedAt: new Date(),
  };

  // Ako neko pošalje prazno sve (npr. ništa ne menja) — i dalje setuje updatedAt, OK.

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
  const auth = await requireAdmin();
  if (!auth.ok) return auth.res;

  // ✅ Next.js 15: params je Promise
  const { id } = await context.params;
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  await db.delete(series).where(eq(series.id, id));
  return NextResponse.json({ ok: true });
}