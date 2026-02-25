export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { getOrSetCsrfToken } from "@/lib/csrf";

export async function GET() {
  const token = await getOrSetCsrfToken();
  return NextResponse.json({ token });
}