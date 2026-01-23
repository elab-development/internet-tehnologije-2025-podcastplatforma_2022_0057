export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyAuthToken } from "@/lib/auth";
import { db } from "@/db";
import { users, paidProfiles } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth")?.value;

 
  if (!token) {
    return NextResponse.json({ error: "Niste prijavljeni" }, { status: 401 });
  }

  const claims = await verifyAuthToken(token);
  const userId = claims.sub;

  if (!userId) {
    return NextResponse.json({ error: "Nevažeći token" }, { status: 401 });
  }

  const { accountNumber } = await req.json();

  
  const accountRegex = /^\d{3}-\d{1,13}-\d{2}$/;

  if (!accountNumber || !accountRegex.test(accountNumber)) {
    return NextResponse.json(
      { error: "Neispravan format računa. Primer: 160-12345678-90" },
      { status: 400 }
    );
  }

  
  const existingUser = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });

  if (existingUser?.role === "PAID") {
    return NextResponse.json({ error: "Već ste pretplaćeni korisnik" }, { status: 400 });
  }

  try {
    
    await db.transaction(async (tx) => {
      
      await tx.insert(paidProfiles).values({
        userId,
        accountNumber,
      });

      
      await tx
        .update(users)
        .set({ role: "PAID" })
        .where(eq(users.id, userId));
    });

    return NextResponse.json({ ok: true, message: "Pretplata uspešna!" });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Greška prilikom obrade pretplate" }, { status: 500 });
  }
}