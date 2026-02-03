export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { db } from "@/db";
import { seriesTypes } from "@/db/schema";


export async function GET() {
  const data = await db
    .select({
      id: seriesTypes.id,
      name: seriesTypes.name,
    })
    .from(seriesTypes)
    .orderBy(seriesTypes.name); 

  return NextResponse.json(data);
}
