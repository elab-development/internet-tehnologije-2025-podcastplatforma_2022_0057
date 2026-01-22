export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { verifyAuthToken } from "@/lib/auth";
import { db } from "@/db";
import { users, episodes } from "@/db/schema";

import { eq } from "drizzle-orm";




export async function POST(req: Request) {
  const token = (await cookies()).get("auth")?.value;
  const claims = await verifyAuthToken(token!);

  const [user] = await db.select().from(users).where(eq(users.id, claims.sub));
  if (user.role !== "ADMIN") return NextResponse.json({}, { status: 403 });

  const body = await req.json();
  const [created] = await db.insert(episodes).values(body).returning();

  return NextResponse.json(created);
}
