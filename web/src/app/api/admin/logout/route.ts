import { NextResponse } from "next/server";
import { ADMIN_COOKIE, isSecureAdminCookie } from "@/lib/admin/session";

export async function POST(req: Request) {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
    secure: isSecureAdminCookie(req),
  });
  return res;
}
