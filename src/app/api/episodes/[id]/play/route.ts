export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyAuthToken } from "@/lib/auth";
import { db } from "@/db";
import { users, episodes } from "@/db/schema";
import { eq } from "drizzle-orm";
import path from "path";
import fs from "fs";

// ✅ POPRAVLJENO: Koristimo direktnu destrukturizaciju { params } umesto context: { params }
// Ovo je jedini način da Next.js 15+ TypeScript prepozna validnu rutu
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // ✅ POPRAVLJENO: Await-ujemo params direktno
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "Missing episode id" },
        { status: 400 }
      );
    }

    const token = (await cookies()).get("auth")?.value;
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

    const [episode] = await db
      .select()
      .from(episodes)
      .where(eq(episodes.id, id));

    if (!episode) {
      return NextResponse.json(
        { error: "Episode not found" },
        { status: 404 }
      );
    }

    const filePath = path.join(
      process.cwd(),
      "public",
      "audios",
      episode.mediaPath
    );

    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { error: "Audio file not found" },
        { status: 404 }
      );
    }

    const stat = fs.statSync(filePath);
    const fileSize = stat.size;
    const range = req.headers.get("range");

    const ext = path.extname(filePath).toLowerCase();
    let contentType = "audio/mpeg";
    if (ext === ".m4a") contentType = "audio/mp4";
    if (ext === ".wav") contentType = "audio/wav";

    // 🔥 RANGE SUPPORT
    if (range) {
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunkSize = end - start + 1;

      // @ts-ignore - fs stream se konvertuje u ReadableStream
      const stream = fs.createReadStream(filePath, { start, end });

      return new NextResponse(stream as any, {
        status: 206,
        headers: {
          "Content-Range": `bytes ${start}-${end}/${fileSize}`,
          "Accept-Ranges": "bytes",
          "Content-Length": chunkSize.toString(),
          "Content-Type": contentType,
        },
      });
    }

    // @ts-ignore
    const stream = fs.createReadStream(filePath);

    return new NextResponse(stream as any, {
      headers: {
        "Content-Length": fileSize.toString(),
        "Content-Type": contentType,
      },
    });

  } catch (err) {
    console.error("Streaming error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
