export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyAuthToken } from "@/lib/auth";
import { db } from "@/db";
import { users, series } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const token = (await cookies()).get("auth")?.value;
  const claims = await verifyAuthToken(token!);

  const [user] = await db.select().from(users).where(eq(users.id, claims.sub));
  if (user.role !== "ADMIN") return NextResponse.json({}, { status: 403 });

  const data = await req.json();

  const [updated] = await db
    .update(series)
    .set(data)
    .where(eq(series.id, params.id))
    .returning();

  return NextResponse.json(updated);
}
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const token = (await cookies()).get("auth")?.value;
  const claims = await verifyAuthToken(token!);

  const [user] = await db.select().from(users).where(eq(users.id, claims.sub));
  if (user.role !== "ADMIN") return NextResponse.json({}, { status: 403 });

  await db.delete(series).where(eq(series.id, params.id));
  return NextResponse.json({ ok: true });
}