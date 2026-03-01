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
  firstName: string;
  lastName: string;
  birthDate?: string;
};

export async function POST(req: Request) {
  const { email, password, firstName, lastName, birthDate } = (await req.json()) as Body;

  
  if (!email || !password || !firstName || !lastName) {
    return NextResponse.json({ error: "Morate uneti sve podatke" }, { status: 400 });
  }

 
  if (password.length < 8) {
    return NextResponse.json(
      { error: "Lozinka mora imati najmanje 8 karaktera" },
      { status: 400 }
    );
  }


  const allowedDomains = ["@gmail.com", "@yahoo.com", "@outlook.com", "@hotmail.com"];
  const isValidDomain = allowedDomains.some((domain) => email.toLowerCase().endsWith(domain));

  if (!isValidDomain) {
    return NextResponse.json(
      { error: "Dozvoljeni domeni za gmail su: gmail, yahoo, outlook i hotmail." },
      { status: 400 }
    );
  }


  if (birthDate) {
    const selectedDate = new Date(birthDate);
    const today = new Date();
    
    if (selectedDate > today) {
      return NextResponse.json(
        { error: "Datum rođenja ne može biti u budućnosti" },
        { status: 400 }
      );
    }
  }

 
  const exists = await db.select({ id: users.id }).from(users).where(eq(users.email, email));
  if (exists.length) {
    return NextResponse.json({ error: "Email već postoji u bazi" }, { status: 400 });
  }

  
  const passwordHash = await bcrypt.hash(password, 10);
  const id = crypto.randomUUID();

 
  const [u] = await db
    .insert(users)
    .values({
      id,
      email,
      firstName,
      lastName,
      passwordHash,
      birthDate: birthDate ? new Date(birthDate) : null,
      role: "USER", 
    })
    .returning({
      id: users.id,
      email: users.email,
      firstName: users.firstName,
      lastName: users.lastName,
      role: users.role,
      createdAt: users.createdAt,
    });

  
  const fullName = `${u.firstName} ${u.lastName}`.trim();

  const token = await signAuthToken({
    sub: u.id,
    email: u.email,
    name: fullName,
  });

  const res = NextResponse.json(u);
  res.cookies.set(AUTH_COOKIE, token, cookieOpts());
  
  return res;
}
