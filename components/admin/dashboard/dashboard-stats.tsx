"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Calendar, TrendingUp } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface Stats {
  totalCustomers: number;
  totalAppointments: number;
  totalRevenue: number;
}

export function DashboardStats() {
  const [stats, setStats] = useState<Stats>({
    totalCustomers: 0,
    totalAppointments: 0,
    totalRevenue: 0,
  });

  useEffect(() => {
    const loadStats = async () => {
      const [customersData, appointmentsData] = await Promise.all([
        supabase.from("profiles").select("count"),
        supabase.from("appointments").select("*"),
      ]);

      const totalCustomers = customersData.count || 0;
      const totalAppointments = appointmentsData.data?.length || 0;
      const totalRevenue = appointmentsData.data?.reduce((acc, curr) => acc + (curr.price || 0), 0) || 0;

      setStats({
        totalCustomers,
        totalAppointments,
        totalRevenue,
      });
    };

    loadStats();
  }, []);

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">総顧客数</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {stats.totalCustomers.toLocaleString()}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">総予約数</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {stats.totalAppointments.toLocaleString()}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">総売上</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            ¥{stats.totalRevenue.toLocaleString()}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}