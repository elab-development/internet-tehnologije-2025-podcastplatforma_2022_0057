export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyAuthToken } from "@/lib/auth";
import { db } from "@/db";
import { users, series, seriesTypes } from "@/db/schema";
import { eq, ilike, and } from "drizzle-orm";
import { randomUUID } from "crypto";
import path from "path";
import fs from "fs/promises";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const q = searchParams.get("q") ?? "";
  const type = searchParams.get("type");
  const page = Number(searchParams.get("page") ?? 1);
  const limit = Number(searchParams.get("limit") ?? 6);
  const offset = (page - 1) * limit;

  const conditions: any[] = [];

  if (q) conditions.push(ilike(series.title, `%${q}%`));
  if (type) conditions.push(eq(series.typeId, type));

  const data = await db
    .select({
      id: series.id,
      title: series.title,
      description: series.description,
      imageUrlSer: series.imageUrlSer,
      totalDurationSec: series.totalDurationSec,
      episodesCount: series.episodesCount,
      typeName: seriesTypes.name,
    })
    .from(series)
    .leftJoin(seriesTypes, eq(series.typeId, seriesTypes.id))
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(series.title)
    .limit(limit)
    .offset(offset);

  return NextResponse.json(data);
}

export async function POST(req: Request) {
  // auth
  const cookieStore = await cookies();
  const token = cookieStore.get("auth")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const claims = await verifyAuthToken(token);
  const [user] = await db.select().from(users).where(eq(users.id, claims.sub));
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // ✅ formData (upload)
  const form = await req.formData();
  const title = String(form.get("title") ?? "").trim();
  const description = String(form.get("description") ?? "").trim();
  const typeId = String(form.get("typeId") ?? "").trim();
  const image = form.get("image") as File | null;

  if (!title || !description || !typeId || !image) {
    return NextResponse.json({ error: "Nedostaju podaci ili slika." }, { status: 400 });
  }

  // snimi sliku u /public/uploads
  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  await fs.mkdir(uploadsDir, { recursive: true });

  const ext = (image.name.split(".").pop() || "jpg").toLowerCase();
  const fileName = `${randomUUID()}.${ext}`;
  const filePath = path.join(uploadsDir, fileName);

  const buffer = Buffer.from(await image.arrayBuffer());
  await fs.writeFile(filePath, buffer);

  const imageUrlSer = `/uploads/${fileName}`;

  const [created] = await db
    .insert(series)
    .values({
      id: randomUUID(),
      title,
      description,
      imageUrlSer,
      typeId,
      totalDurationSec: 0,
      episodesCount: 0,
    })
    .returning();

  return NextResponse.json(created);
}