"use client";

import { useState, useEffect, useCallback } from "react";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { CancelDialog } from "./cancel-dialog";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { appointmentStatuses } from "@/lib/appointment-status";
import type { AppointmentWithDetails } from "@/types/database";

export function MyPageContent() {
  const [appointments, setAppointments] = useState<AppointmentWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentWithDetails | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const loadAppointments = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          router.push("/auth");
          return;
        }

        const { data, error } = await supabase
          .from("appointments")
          .select(`
            id,
            user_id,
            service_id,
            staff_id,
            start_time,
            end_time,
            status,
            created_at,
            services!appointments_service_id_fkey (
              name,
              duration,
              price
            ),
            staff!appointments_staff_id_fkey (
              name,
              role
            )
          `)
          .eq("user_id", user.id)
          .order("start_time", { ascending: false });

        if (error) throw error;
        setAppointments(data || []);

        // リアルタイム更新をサブスクライブ
        const subscription = supabase
          .channel('appointments')
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'appointments',
              filter: `user_id=eq.${user.id}`
            },
            async (payload) => {
              // 変更があった場合は再度データを取得
              const { data: updatedData } = await supabase
                .from("appointments")
                .select(`
                  id,
                  user_id,
                  service_id,
                  staff_id,
                  start_time,
                  end_time,
                  status,
                  created_at,
                  services (
                    name,
                    duration,
                    price
                  ),
                  staff (
                    name,
                    role
                  )
                `)
                .eq("user_id", user.id)
                .order("start_time", { ascending: false });

              if (updatedData) {
                setAppointments(updatedData);
              }
            }
          )
          .subscribe();

        return () => {
          subscription.unsubscribe();
        };
      } catch (error: any) {
        console.error("Error loading appointments:", error);
        toast({
          title: "エラー",
          description: "予約データの取得に失敗しました",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadAppointments();

    return () => {
      supabase.removeAllChannels();
    };
  }, [router, toast]);

  const handleCancelAppointment = async () => {
    if (!selectedAppointment) return;

    try {
      const { error } = await supabase
        .from("appointments")
        .update({ status: "cancelled" })
        .eq("id", selectedAppointment.id);

      if (error) throw error;

      toast({
        title: "キャンセル完了",
        description: "予約をキャンセルしました",
      });
    } catch (error: any) {
      toast({
        title: "エラー",
        description: "キャンセルに失敗しました",
        variant: "destructive",
      });
    } finally {
      setSelectedAppointment(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = appointmentStatuses[status as keyof typeof appointmentStatuses];
    return statusConfig ? (
      <Badge variant={statusConfig.color}>{statusConfig.label}</Badge>
    ) : null;
  };

  if (loading) {
    return <div>読み込み中...</div>;
  }

  return (
    <div className="space-y-8">
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">予約履歴</h2>
        {appointments.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>予約日時</TableHead>
                <TableHead>メニュー</TableHead>
                <TableHead>担当スタッフ</TableHead>
                <TableHead>料金</TableHead>
                <TableHead>ステータス</TableHead>
                <TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {appointments.map((appointment) => (
                <TableRow key={appointment.id}>
                  <TableCell>
                    {format(new Date(appointment.start_time), "yyyy年M月d日(E) HH:mm", { locale: ja })}
                  </TableCell>
                  <TableCell>{appointment.services.name}</TableCell>
                  <TableCell>{appointment.staff.name}</TableCell>
                  <TableCell>¥{appointment.services.price.toLocaleString()}</TableCell>
                  <TableCell>
                    <div className="group relative">
                      {getStatusBadge(appointment.status)}
                      <div className="absolute left-0 top-6 z-50 hidden group-hover:block w-64 p-2 bg-popover text-popover-foreground text-sm rounded-md shadow-lg">
                        {appointmentStatuses[appointment.status as keyof typeof appointmentStatuses]?.description}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {(appointment.status === "confirmed" || appointment.status === "pending") && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => setSelectedAppointment(appointment)}
                      >
                        キャンセル
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            予約履歴がありません
          </div>
        )}
      </Card>

      <div className="flex justify-center">
        <Button
          onClick={() => router.push("/booking")}
          className="bg-gradient-to-r from-pink-600 to-purple-600"
        >
          新規予約
        </Button>
      </div>
      
      {selectedAppointment && (
        <CancelDialog
          open={!!selectedAppointment}
          onOpenChange={(open) => !open && setSelectedAppointment(null)}
          onConfirm={handleCancelAppointment}
          appointment={selectedAppointment}
        />
      )}
    </div>
  );
}