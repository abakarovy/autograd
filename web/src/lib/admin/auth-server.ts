import { cookies } from "next/headers";
import { ADMIN_COOKIE, verifyAdminSession } from "./session";

export async function isAdminAuthenticated(): Promise<boolean> {
  const jar = await cookies();
  const token = jar.get(ADMIN_COOKIE)?.value;
  return verifyAdminSession(token);
}
