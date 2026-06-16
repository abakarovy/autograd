import { redirect } from "next/navigation";
import { AdminPanel } from "@/components/admin/AdminPanel";
import { isAdminAuthenticated } from "@/lib/admin/auth-server";

export const metadata = {
  title: "Панель управления",
  robots: { index: false, follow: false },
};

export default async function AdminPage() {
  if (!(await isAdminAuthenticated())) redirect("/admin/login");

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      <AdminPanel />
    </div>
  );
}
