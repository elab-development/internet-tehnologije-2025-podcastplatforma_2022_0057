import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/requireAdmin";
import { requireOrigin } from "@/lib/security";
import { requireCsrf } from "@/lib/csrf";

import { db } from "@/db";
import { users, paidProfiles, listenProgress } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function PUT(req: Request, context: { params: Promise<{ id: string }> }) {
  const cors = requireOrigin(req);
  if (cors) return cors;

  const csrf = await requireCsrf(req);
  if (csrf) return csrf;

  const auth = await requireAdmin();
  if (!auth.ok) return auth.res; // ✅ TS zna da je res ovde

  const { id } = await context.params;

  const { role, accountNumber } = await req.json();

  await db.update(users).set({ role }).where(eq(users.id, id));

  if (role === "PAID") {
    if (!accountNumber) {
      return NextResponse.json(
        { error: "Account number is required for PAID users" },
        { status: 400 }
      );
    }

    await db
      .insert(paidProfiles)
      .values({ userId: id, accountNumber })
      .onConflictDoUpdate({
        target: paidProfiles.userId,
        set: { accountNumber },
      });
  } else {
    await db.delete(paidProfiles).where(eq(paidProfiles.userId, id));
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request, context: { params: Promise<{ id: string }> }) {
  const cors = requireOrigin(req);
  if (cors) return cors;

  const csrf = await requireCsrf(req);
  if (csrf) return csrf;

  const auth = await requireAdmin();
  if (!auth.ok) return auth.res;

  const { id } = await context.params;

  // ne može da obriše sebe
  if (auth.admin.id === id) {
    return NextResponse.json(
      { error: "Ne možete obrisati sopstveni nalog" },
      { status: 400 }
    );
  }

  await db.delete(listenProgress).where(eq(listenProgress.userId, id));
  await db.delete(paidProfiles).where(eq(paidProfiles.userId, id));
  await db.delete(users).where(eq(users.id, id));

  return NextResponse.json({ ok: true });
}