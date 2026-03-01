export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/db";
import { episodes, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { verifyAuthToken, AUTH_COOKIE } from "@/lib/auth";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> } 
) {
  try {
    
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_COOKIE)?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    
    const claims = await verifyAuthToken(token);

    
    const [u] = await db
      .select({ id: users.id, role: users.role })
      .from(users)
      .where(eq(users.id, claims.sub));

    if (!u) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    
    if (u.role !== "PAID" && u.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Subscription required" },
        { status: 403 }
      );
    }

    
    const resolvedParams = await params;
    const seriesId = resolvedParams.id;

    if (!seriesId) {
      return NextResponse.json(
        { error: "ID serije nije prosleđen" },
        { status: 400 }
      );
    }

    
    const seriesEpisodes = await db
      .select()
      .from(episodes)
      .where(eq(episodes.seriesId, seriesId));

    return NextResponse.json(seriesEpisodes);
  } catch (error) {
    console.error("Greška na serveru:", error);
    return NextResponse.json(
      { error: "Neuspešno učitavanje epizoda" },
      { status: 500 }
    );
  }
}
