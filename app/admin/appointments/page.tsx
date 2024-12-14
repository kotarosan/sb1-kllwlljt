"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { appointmentStatuses } from "@/lib/appointment-status";
import { getAppointments } from "@/lib/queries";
import { useToast } from "@/hooks/use-toast";
import type { AppointmentWithDetails } from "@/types/database";

export default function AdminAppointmentsPage() {
  const [date, setDate] = useState<Date>(new Date());
  const [appointments, setAppointments] = useState<AppointmentWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadAppointments = async (selectedDate: Date) => {
    try {
      setLoading(true);
      const data = await getAppointments(selectedDate);
      setAppointments(data);
    } catch (error) {
      console.error('Error loading appointments:', error);
      toast({
        title: "エラー",
        description: "予約データの読み込みに失敗しました",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAppointments(date);
  }, [date]);

  const getStatusBadge = (status: string) => {
    const statusConfig = appointmentStatuses[status as keyof typeof appointmentStatuses];
    return statusConfig ? (
      <Badge variant={statusConfig.color}>{statusConfig.label}</Badge>
    ) : null;
  };

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">予約管理</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">日付を選択</h2>
          <Calendar
            mode="single"
            selected={date}
            onSelect={(date) => date && setDate(date)}
            locale={ja}
            className="rounded-md border"
          />
        </Card>

        <div className="md:col-span-2">
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">
              {format(date, 'yyyy年M月d日(E)', { locale: ja })}の予約一覧
            </h2>
            {loading ? (
              <div className="text-center py-8">読み込み中...</div>
            ) : appointments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                予約はありません
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>時間</TableHead>
                    <TableHead>メニュー</TableHead>
                    <TableHead>担当</TableHead>
                    <TableHead>料金</TableHead>
                    <TableHead>ステータス</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {appointments.map((appointment) => (
                    <TableRow key={appointment.id}>
                      <TableCell>
                        {format(new Date(appointment.start_time), 'HH:mm')}
                      </TableCell>
                      <TableCell>{appointment.services.name}</TableCell>
                      <TableCell>{appointment.staff.name}</TableCell>
                      <TableCell>
                        ¥{appointment.services.price.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(appointment.status)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}