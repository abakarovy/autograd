import { createHmac, timingSafeEqual } from "node:crypto";

export const ADMIN_COOKIE = "ag_admin";

/** Secure flag for admin cookie — follows HTTPS, not NODE_ENV (HTTP VPS needs secure=false). */
export function isSecureAdminCookie(req: Request): boolean {
  const override = process.env.ADMIN_COOKIE_SECURE;
  if (override === "true") return true;
  if (override === "false") return false;
  const forwarded = req.headers.get("x-forwarded-proto");
  if (forwarded) return forwarded.split(",")[0].trim() === "https";
  try {
    return new URL(req.url).protocol === "https:";
  } catch {
    return false;
  }
}

export function signAdminSession(): string {
  const secret = process.env.ADMIN_SESSION_SECRET || "dev-only-change-me";
  const exp = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7;
  const payloadB64 = Buffer.from(JSON.stringify({ exp, v: 1 }), "utf8").toString(
    "base64url",
  );
  const sig = createHmac("sha256", secret).update(payloadB64).digest("base64url");
  return `${payloadB64}.${sig}`;
}

export function verifyAdminSession(token: string | undefined): boolean {
  if (!token?.includes(".")) return false;
  const i = token.lastIndexOf(".");
  const payloadB64 = token.slice(0, i);
  const sig = token.slice(i + 1);
  const secret = process.env.ADMIN_SESSION_SECRET || "dev-only-change-me";
  const expected = createHmac("sha256", secret).update(payloadB64).digest("base64url");
  try {
    const a = Buffer.from(sig, "utf8");
    const b = Buffer.from(expected, "utf8");
    if (a.length !== b.length || !timingSafeEqual(a, b)) return false;
  } catch {
    return false;
  }
  try {
    const payload = JSON.parse(Buffer.from(payloadB64, "base64url").toString("utf8"));
    return typeof payload.exp === "number" && payload.exp > Math.floor(Date.now() / 1000);
  } catch {
    return false;
  }
}
