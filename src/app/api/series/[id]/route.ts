export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyAuthToken } from "@/lib/auth";
import { db } from "@/db";
import { users, series } from "@/db/schema";
import { eq } from "drizzle-orm";

// 🔒 PUT /api/series/:id – ADMIN
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
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

  const data = await req.json();

  const [updated] = await db
    .update(series)
    .set(data)
    .where(eq(series.id, params.id))
    .returning();

  return NextResponse.json(updated);
}

// 🔒 DELETE /api/series/:id – ADMIN
export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  // 🔑 1. await params
  const { id } = await context.params;

  // 🔐 auth
  const token = (await cookies()).get("auth")?.value;
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

  // 🗑️ delete
  await db.delete(series).where(eq(series.id, id));

  return NextResponse.json({ ok: true });
}

