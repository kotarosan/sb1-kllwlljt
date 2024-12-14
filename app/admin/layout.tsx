import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminHeader } from "@/components/admin/admin-header";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <AdminHeader />
      <div className="flex transition-all duration-300">
        <AdminSidebar />
        <main className="flex-1 p-8 pt-24 ml-[70px] md:ml-64">{children}</main>
      </div>
    </div>
  );
}