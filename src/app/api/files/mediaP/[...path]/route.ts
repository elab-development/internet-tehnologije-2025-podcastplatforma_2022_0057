import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { Readable } from "stream";

export const runtime = "nodejs";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> } // Mora biti "path" jer se tako zove folder [...path]
) {
  try {
    const resolvedParams = await params;
    // Pošto je [...path], segments će biti niz (npr. ["fajl.mp3"])
    const segments = resolvedParams.path;
    
    // Uzimamo poslednji segment kao ime fajla
    const filename = segments[segments.length - 1];
    
    const filePath = path.join(process.cwd(), "public/audios", filename);

    if (!fs.existsSync(filePath)) {
      return new NextResponse("Audio nije pronađen", { status: 404 });
    }

    const stats = fs.statSync(filePath);
    const nodeStream = fs.createReadStream(filePath);
    
    // Pretvaranje u Web Stream da bi Next.js mogao da ga strimuje
    const webStream = Readable.toWeb(nodeStream);

    return new NextResponse(webStream as ReadableStream, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": stats.size.toString(),
        "Accept-Ranges": "bytes", // Ključno za premotavanje i trajanje (da ne bude 0:00)
      },
    });
  } catch (err) {
    console.error("Audio streaming error:", err);
    return new NextResponse("Greška pri učitavanju audia", { status: 500 });
  }
}