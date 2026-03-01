// src/lib/requireAdmin.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyAuthToken } from "@/lib/auth";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

type AdminUser = typeof users.$inferSelect;


export async function requireAdmin(): Promise<{
  ok: true;
  admin: AdminUser;
} | {
  ok: false;
  res: NextResponse;
}> {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth")?.value;

  if (!token) {
    return {
      ok: false,
      res: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  let claims;
  try {
    claims = await verifyAuthToken(token);
  } catch {
    return {
      ok: false,
      res: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  const [admin] = await db.select().from(users).where(eq(users.id, claims.sub));

  if (!admin || admin.role !== "ADMIN") {
    return {
      ok: false,
      res: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    };
  }

  return { ok: true, admin };
}