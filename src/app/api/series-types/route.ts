export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { db } from "@/db";
import { seriesTypes } from "@/db/schema";

export async function GET() {
  const data = await db.select().from(seriesTypes);
  return NextResponse.json(data);
}
