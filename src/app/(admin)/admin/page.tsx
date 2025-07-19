// app/admin/page.tsx
import { KeyBundleManager } from "@/components/admin/KeyBundleManager";
import { verifyAdmin } from "@/lib/admin-auth";
import { redirect } from "next/navigation";

export default async function AdminDashboard() {
  const { error } = await verifyAdmin();
  if (error) {
    redirect("/admin/login");
  }

  return (
    <div className="space-y-6">
      <div className="lg:flex justify-between items-center">
        <h1 className="text-2xl font-bold">Key Bundle Management</h1>
        <div className="text-sm text-gray-500">
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </div>
      </div>
      <KeyBundleManager />
    </div>
  );
}
