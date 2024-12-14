"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabase";
import type { AppointmentWithDetails } from "@/types/database";

export function RecentAppointments() {
  const [appointments, setAppointments] = useState<AppointmentWithDetails[]>([]);

  useEffect(() => {
    const loadAppointments = async () => {
      const { data, error } = await supabase
        .from("appointments")
        .select(`
          *,
          services (name),
          staff (name),
          profiles (full_name, email)
        `)
        .order("start_time", { ascending: false })
        .limit(5);

      if (!error && data) {
        setAppointments(data);
      }
    };

    loadAppointments();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>最近の予約</CardTitle>
        <CardDescription>直近の予約5件を表示しています</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {appointments.map((appointment) => (
            <div
              key={appointment.id}
              className="flex items-center justify-between space-x-4"
            >
              <div className="space-y-1">
                <p className="text-sm font-medium">
                  {format(new Date(appointment.start_time), "M/d(E) HH:mm", {
                    locale: ja,
                  })}
                </p>
                <p className="text-sm text-muted-foreground">
                  {appointment.services.name} - {appointment.staff.name}
                </p>
              </div>
              <Badge
                variant={
                  appointment.status === "confirmed"
                    ? "default"
                    : appointment.status === "cancelled"
                    ? "destructive"
                    : "secondary"
                }
              >
                {appointment.status === "confirmed"
                  ? "確定"
                  : appointment.status === "cancelled"
                  ? "キャンセル"
                  : "予約待ち"}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}