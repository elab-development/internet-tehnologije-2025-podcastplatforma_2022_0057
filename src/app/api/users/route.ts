export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyAuthToken } from "@/lib/auth";
import { requireOrigin } from "@/lib/security";
import { db } from "@/db";
import { users, paidProfiles } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(req: Request) {
  // ✅ CORS zaštita (opciono ali preporučeno)
  const cors = requireOrigin(req);
  if (cors) return cors;

  const cookieStore = await cookies();
  const token = cookieStore.get("auth")?.value;
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const claims = await verifyAuthToken(token);
  const [admin] = await db.select().from(users).where(eq(users.id, claims.sub));

  if (!admin || admin.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const data = await db
    .select({
      id: users.id,
      email: users.email,
      firstName: users.firstName,
      lastName: users.lastName,
      role: users.role,
      createdAt: users.createdAt,
      accountNumber: paidProfiles.accountNumber,
    })
    .from(users)
    .leftJoin(paidProfiles, eq(users.id, paidProfiles.userId));

  return NextResponse.json(data);
}