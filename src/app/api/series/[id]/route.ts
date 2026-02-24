export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyAuthToken } from "@/lib/auth";
import { db } from "@/db";
import { users, series } from "@/db/schema";
import { eq } from "drizzle-orm";
import path from "path";
import fs from "fs/promises";
import { randomUUID } from "crypto";

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

  // ✅ formData: title, description, typeId, image (optional)
  const form = await req.formData();
  const title = form.get("title");
  const description = form.get("description");
  const typeId = form.get("typeId");
  const image = form.get("image") as File | null;

  // patch: menjamo samo ono što je poslato
  const patch: Partial<typeof series.$inferInsert> = {
    updatedAt: new Date(),
  };

  if (typeof title === "string" && title.trim() !== "") patch.title = title.trim();
  if (typeof description === "string" && description.trim() !== "")
    patch.description = description.trim();
  if (typeof typeId === "string" && typeId.trim() !== "") patch.typeId = typeId.trim();

  // ✅ ako je poslata nova slika → snimi i upiši novu putanju
  if (image && typeof image.name === "string" && image.size > 0) {
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    await fs.mkdir(uploadsDir, { recursive: true });

    const ext = (image.name.split(".").pop() || "jpg").toLowerCase();
    const fileName = `${randomUUID()}.${ext}`;
    const filePath = path.join(uploadsDir, fileName);

    const buffer = Buffer.from(await image.arrayBuffer());
    await fs.writeFile(filePath, buffer);

    patch.imageUrlSer = `/uploads/${fileName}`;
  }

  // ⛔ ne diramo: id, totalDurationSec, episodesCount (nema ih ni u patch-u)

  // ako user nije poslao ništa validno (osim updatedAt), možeš vratiti 400
  const keys = Object.keys(patch);
  if (keys.length === 1 && keys[0] === "updatedAt") {
    return NextResponse.json(
      { error: "Nema podataka za izmenu." },
      { status: 400 }
    );
  }

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
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const claims = await verifyAuthToken(token);
  const [user] = await db.select().from(users).where(eq(users.id, claims.sub));
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await db.delete(series).where(eq(series.id, id));
  return NextResponse.json({ ok: true });
}