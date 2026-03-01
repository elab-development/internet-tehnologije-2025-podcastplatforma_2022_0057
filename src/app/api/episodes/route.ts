export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyAuthToken } from "@/lib/auth";
import { db } from "@/db";
import { users, episodes, series } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { randomUUID } from "crypto";
import path from "path";
import { writeFile, mkdir } from "fs/promises";
import { processPodcastAudio } from "@/lib/assemblyai";



async function recalcSeries(seriesId: string) {
  const [stats] = await db
    .select({
      count: sql<number>`count(*)`.mapWith(Number),
      total: sql<number>`coalesce(sum(${episodes.durationSec}), 0)`.mapWith(Number),
    })
    .from(episodes)
    .where(eq(episodes.seriesId, seriesId));

  await db
    .update(series)
    .set({
      episodesCount: stats?.count ?? 0,
      totalDurationSec: stats?.total ?? 0,
      updatedAt: new Date(),
    })
    .where(eq(series.id, seriesId));
}

async function saveUpload(file: File, folder: string) {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const ext = path.extname(file.name) || "";
  const filename = `${randomUUID()}${ext}`;

  const uploadDir = path.join(process.cwd(), "public", folder);
  await mkdir(uploadDir, { recursive: true });

  const filepath = path.join(uploadDir, filename);
  await writeFile(filepath, buffer);

  return filename; 
}



export async function POST(req: Request) {
  try {
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

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const form = await req.formData();

    const seriesId = String(form.get("seriesId") ?? "");
    const title = String(form.get("title") ?? "");
    const durationSec = Number(form.get("durationSec") ?? "");
    const image = form.get("image");
    const audio = form.get("audio");

    if (!seriesId || !title || !Number.isFinite(durationSec) || durationSec <= 0) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    if (!(image instanceof File) || !(audio instanceof File)) {
      return NextResponse.json(
        { error: "Image and audio are required" },
        { status: 400 }
      );
    }

    
    const imageFilename = await saveUpload(image, "episodes");
    const imageUrlEp = `/episodes/${imageFilename}`;

    const audioFilename = await saveUpload(audio, "audios");
    const fullAudioPath = path.join(process.cwd(), "public", "audios", audioFilename);
    
    
    const newEpisodeId = randomUUID();

    
    const [created] = await db
      .insert(episodes)
      .values({
        id: newEpisodeId,
        seriesId,
        title,
        durationSec,
        imageUrlEp,
        mediaPath: audioFilename,
        transcript: "Obrada je u toku...",
        summary: "Obrada je u toku...",
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    
    (async () => {
      try {
        console.log("⏳ POZADINA: Krećem AI obradu za:", audioFilename);
        const aiData = await processPodcastAudio(fullAudioPath);
        
        if (aiData) {
          await db.update(episodes)
            .set({
              transcript: String(aiData.text),
              summary: String(aiData.summary),
              updatedAt: new Date()
            })
            .where(eq(episodes.id, newEpisodeId));
          console.log("POZADINA: Uspešno ažurirana epizoda:", title);
        }
      } catch (e: any) {
        console.error("POZADINA GREŠKA:", e.message);
      }
    })();

    
    await recalcSeries(seriesId);

    
    return NextResponse.json(created);

  } catch (globalErr: any) {
    console.error("GLOBALNA GREŠKA U RUTI:", globalErr.message);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}



export async function GET() {
  const data = await db.select().from(episodes);
  return NextResponse.json(data);
}