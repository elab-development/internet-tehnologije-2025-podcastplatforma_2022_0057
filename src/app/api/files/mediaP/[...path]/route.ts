import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { Readable } from "stream";

export const runtime = "nodejs";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> } 
) {
  try {
    const resolvedParams = await params;
    
    const segments = resolvedParams.path;
    
    
    const filename = segments[segments.length - 1];
    
    const filePath = path.join(process.cwd(), "public/audios", filename);

    if (!fs.existsSync(filePath)) {
      return new NextResponse("Audio nije pronađen", { status: 404 });
    }

    const stats = fs.statSync(filePath);
    const nodeStream = fs.createReadStream(filePath);
    
    
    const webStream = Readable.toWeb(nodeStream);

    return new NextResponse(webStream as ReadableStream, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": stats.size.toString(),
        "Accept-Ranges": "bytes", 
      },
    });
  } catch (err) {
    console.error("Audio streaming error:", err);
    return new NextResponse("Greška pri učitavanju audia", { status: 500 });
  }
}