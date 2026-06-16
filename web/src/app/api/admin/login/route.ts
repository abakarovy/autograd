import { NextResponse } from "next/server";
import { ADMIN_COOKIE, signAdminSession } from "@/lib/admin/session";

const DEFAULT_PASSWORD = "autograd2026";

export async function POST(req: Request) {
  let body: { password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Некорректный запрос" }, { status: 400 });
  }

  const expected = process.env.ADMIN_PASSWORD || DEFAULT_PASSWORD;
  if (!body.password || body.password !== expected) {
    return NextResponse.json({ error: "Неверный пароль" }, { status: 401 });
  }

  const token = signAdminSession();
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
    secure: process.env.NODE_ENV === "production",
  });
  return res;
}
