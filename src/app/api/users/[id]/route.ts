export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyAuthToken } from "@/lib/auth";
import { db } from "@/db";
import { users, paidProfiles } from "@/db/schema";
import { eq } from "drizzle-orm";

// 🔒 PUT – promena uloge + paid_profiles sync
export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  const cookieStore = await cookies();
  const token = cookieStore.get("auth")?.value;
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const claims = await verifyAuthToken(token);
  const [admin] = await db
    .select()
    .from(users)
    .where(eq(users.id, claims.sub));

  if (!admin || admin.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { role, accountNumber } = await req.json();

  // 1️⃣ uvek ažuriraj ulogu
  await db.update(users).set({ role }).where(eq(users.id, id));

  // 2️⃣ sync paid_profiles
  if (role === "PAID") {
    if (!accountNumber) {
      return NextResponse.json(
        { error: "Account number is required for PAID users" },
        { status: 400 }
      );
    }

    // insert ili update
    await db
      .insert(paidProfiles)
      .values({
        userId: id,
        accountNumber,
      })
      .onConflictDoUpdate({
        target: paidProfiles.userId,
        set: { accountNumber },
      });
  } else {
    // 👇 KLJUČNI DEO – brišemo pretplatu
    await db
      .delete(paidProfiles)
      .where(eq(paidProfiles.userId, id));
  }

  return NextResponse.json({ ok: true });
}
