export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyAuthToken } from "@/lib/auth";
import { db } from "@/db";
import { listenProgress } from "@/db/schema";
import { eq, and } from "drizzle-orm";


export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const token = (await cookies()).get("auth")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const claims = await verifyAuthToken(token);
    const userId = claims.sub;

    const [progress] = await db
      .select()
      .from(listenProgress)
      .where(
        and(
          eq(listenProgress.userId, userId),
          eq(listenProgress.episodeId, id)
        )
      );

    if (!progress) {
      
      return NextResponse.json({
        positionSec: 0,
        completed: false,
      });
    }

    return NextResponse.json(progress);

  } catch (err) {
    console.error("EPISODE PROGRESS GET ERROR:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}


export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const token = (await cookies()).get("auth")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const claims = await verifyAuthToken(token);
    const userId = claims.sub;

    const body = await req.json();
    const positionSec = Math.floor(body.positionSec ?? 0);
    const completed = Boolean(body.completed);

    await db
      .insert(listenProgress)
      .values({
        userId,
        episodeId: id,
        positionSec,
        completed,
      })
      .onConflictDoUpdate({
        target: [listenProgress.userId, listenProgress.episodeId],
        set: {
          positionSec,
          completed,
          updatedAt: new Date(),
        },
      });

    return NextResponse.json({ ok: true });

  } catch (err) {
    console.error("EPISODE PROGRESS PUT ERROR:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}