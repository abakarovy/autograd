import { createHmac, timingSafeEqual } from "node:crypto";

export const ADMIN_COOKIE = "ag_admin";

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
