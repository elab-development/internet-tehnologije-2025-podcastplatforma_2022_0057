export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyAuthToken } from "@/lib/auth";
import { db } from "@/db";
import { users, paidProfiles } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth")?.value;

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

 
  const claims = await verifyAuthToken(token);
  const userId = claims.sub;

  const { accountNumber } = await req.json();

  await db.insert(paidProfiles).values({
    userId,
    accountNumber,
  });

  await db
    .update(users)
    .set({ role: "PAID" })
    .where(eq(users.id, userId));

  return NextResponse.json({ ok: true });
}
