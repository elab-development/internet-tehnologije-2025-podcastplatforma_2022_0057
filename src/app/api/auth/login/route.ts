export const runtime = "nodejs";

import { db } from "@/db";
import { users } from "@/db/schema";
import { AUTH_COOKIE, cookieOpts, signAuthToken } from "@/lib/auth";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

type Body = {
  email: string;
  password: string;
};

export async function POST(req: Request) {
  const { email, password } = (await req.json()) as Body;

  if (!email || !password) {
    return NextResponse.json({ error: "Morate uneti email i lozinku" }, { status: 401 });
  }

  const [u] = await db.select().from(users).where(eq(users.email, email));
  if (!u) {
    return NextResponse.json({ error: "Pogrešan email" }, { status: 401 });
  }

  const ok = await bcrypt.compare(password, u.passwordHash);
  if (!ok) {
    return NextResponse.json({ error: "Pogrešna lozinka" }, { status: 401 });
  }

  const fullName = `${u.firstName} ${u.lastName}`.trim();

  const token = await signAuthToken({
    sub: u.id,
    email: u.email,
    name: fullName,
  });

  const res = NextResponse.json({
    id: u.id,
    email: u.email,
    firstName: u.firstName,
    lastName: u.lastName,
    role: u.role,
  });

  res.cookies.set(AUTH_COOKIE, token, cookieOpts());
  return res;
}

