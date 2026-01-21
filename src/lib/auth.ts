import * as jwt from "jsonwebtoken"

export const AUTH_COOKIE = "auth";
const JWT_SECRET = process.env.JWT_SECRET!;

if (!JWT_SECRET) {
    throw new Error("Missing JWT_SECRET in env file")
}

//definisemo kako ce token izgledati
export type JwtUserClaims = {
    sub: string; //subject, neki id
    email: string;
    name?: string;
}

export function signAuthToken(claims: JwtUserClaims) {
    return jwt.sign(claims, JWT_SECRET, { algorithm: "HS256", expiresIn: "7d" })
}

export function verifyAuthToken(token: string) {
    const payload = jwt.verify(token, JWT_SECRET) as jwt.JwtPayload & JwtUserClaims;

    if (!payload || !payload.sub || !payload.email) {
        throw new Error("Invalid token")
    }

    return {
        sub: payload.sub,
        email: payload.email,
        name: payload.name
    }
}

export function cookieOpts() {
    return {
        httpOnly: true, // ne moze da se pristupi kroz JS, stiti od XSS
        sameSite: "lax" as const, // stiti od CSRF
        secure: process.env.NODE_ENV === "production", // samo HTTPS na produkciji
        path: "/",
        maxAge: 60 * 60 * 24 * 7
    }
}