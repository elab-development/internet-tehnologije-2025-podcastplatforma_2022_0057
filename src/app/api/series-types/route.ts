export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { db } from "@/db";
import { seriesTypes } from "@/db/schema";

// 🔓 GET /api/series-types – lista tipova serijala
export async function GET() {
  const data = await db
    .select({
      id: seriesTypes.id,
      name: seriesTypes.name,
    })
    .from(seriesTypes)
    .orderBy(seriesTypes.name); // 🔤 abecedno

  return NextResponse.json(data);
}
