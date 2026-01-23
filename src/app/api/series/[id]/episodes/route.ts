import { db } from "@/db";
import { episodes } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> } // Definišemo kao Promise
) {
  try {
    // 1. Moramo uraditi AWAIT za params
    const resolvedParams = await params;
    const seriesId = resolvedParams.id;

    if (!seriesId) {
      return NextResponse.json({ error: "ID serije nije prosleđen" }, { status: 400 });
    }

    // 2. Sada tražimo u bazi
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