export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyAuthToken } from "@/lib/auth";
import { db } from "@/db";
import { users, paidProfiles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { requireOrigin } from "@/lib/security";
import { requireCsrf } from "@/lib/csrf";


export async function POST() {
 
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

  if (!user || user.role !== "PAID") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

 
  await db
    .delete(paidProfiles)
    .where(eq(paidProfiles.userId, claims.sub));

  
  await db
    .update(users)
    .set({ role: "USER" })
    .where(eq(users.id, claims.sub));

  return NextResponse.json({ ok: true });
}