import { SignJWT, jwtVerify } from "jose";

export const AUTH_COOKIE = "auth";
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) throw new Error("Missing JWT_SECRET in env file");
const key = new TextEncoder().encode(JWT_SECRET);

export type JwtUserClaims = {
  sub: string;
  email: string;
  name?: string; // ovde smestimo "First Last"
};

const EXPIRES_SECONDS = 60 * 60 * 24 * 30; // 30 dana

export async function signAuthToken(claims: JwtUserClaims) {
  return await new SignJWT({ email: claims.email, name: claims.name })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(claims.sub)
    .setIssuedAt()
    .setExpirationTime(Math.floor(Date.now() / 1000) + EXPIRES_SECONDS)
    .sign(key);
}

export async function verifyAuthToken(token: string): Promise<JwtUserClaims> {
  const { payload } = await jwtVerify(token, key, { algorithms: ["HS256"] });

  if (!payload?.sub || typeof payload.sub !== "string") throw new Error("Invalid token");
  if (!payload?.email || typeof payload.email !== "string") throw new Error("Invalid token");

  const name = payload.name;
  return {
    sub: payload.sub,
    email: payload.email,
    name: typeof name === "string" ? name : undefined,
  };
}

export function cookieOpts() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: EXPIRES_SECONDS,
  };
}
