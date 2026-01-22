export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyAuthToken } from "@/lib/auth";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const token = (await cookies()).get("auth")?.value;
  const claims = await verifyAuthToken(token!);

  const [user] = await db.select().from(users).where(eq(users.id, claims.sub));
  if (user.role !== "PAID") {
    return NextResponse.json({}, { status: 403 });
  }

  return NextResponse.json({
    message: "Streaming dozvoljen (mock)",
    episodeId: params.id,
  });
}
