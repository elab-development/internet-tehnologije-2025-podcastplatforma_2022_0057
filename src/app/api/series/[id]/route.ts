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
import { requireOrigin } from "@/lib/security";
import { requireCsrf } from "@/lib/csrf";


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
  
  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  await fs.mkdir(uploadsDir, { recursive: true });

  const ext = path.extname(file.name || "") || ".jpg";
  const filename = `${randomUUID()}${ext}`;
  const fullPath = path.join(uploadsDir, filename);

  const arrayBuffer = await file.arrayBuffer();
  await fs.writeFile(fullPath, Buffer.from(arrayBuffer));

  
  return `/uploads/${filename}`;
}

export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  
  const cors = requireOrigin(req);
  if (cors) return cors;

  
  const csrf = await requireCsrf(req);
  if (csrf) return csrf;
  const auth = await requireAdmin();
  if (!auth.ok) return auth.res;

  
  const { id } = await context.params;
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  
  const [existing] = await db.select().from(series).where(eq(series.id, id));
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const form = await req.formData();

  
  const title = (form.get("title") as string | null) ?? undefined;
  const description = (form.get("description") as string | null) ?? undefined;
  const typeId = (form.get("typeId") as string | null) ?? undefined;

  
  const image = form.get("image");
  let imageUrlSer: string | undefined = undefined;

  if (image && image instanceof File && image.size > 0) {
    imageUrlSer = await saveUploadToPublic(image);
  }

  
  const patch: Partial<typeof series.$inferInsert> = {
    ...(title !== undefined ? { title } : {}),
    ...(description !== undefined ? { description } : {}),
    ...(typeId !== undefined ? { typeId } : {}),
    ...(imageUrlSer !== undefined ? { imageUrlSer } : {}),
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
  
  const cors = requireOrigin(req);
  if (cors) return cors;

  
  const csrf = await requireCsrf(req);
  if (csrf) return csrf;
  const auth = await requireAdmin();
  if (!auth.ok) return auth.res;

  
  const { id } = await context.params;
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  await db.delete(series).where(eq(series.id, id));
  return NextResponse.json({ ok: true });
}