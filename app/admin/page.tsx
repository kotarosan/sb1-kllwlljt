import { DashboardStats } from "@/components/admin/dashboard/dashboard-stats";
import { RecentAppointments } from "@/components/admin/dashboard/recent-appointments";
import { SalesChart } from "@/components/admin/dashboard/sales-chart";

export default function AdminDashboard() {
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">ダッシュボード</h1>
      <DashboardStats />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <SalesChart />
        <RecentAppointments />
      </div>
    </div>
  );
}