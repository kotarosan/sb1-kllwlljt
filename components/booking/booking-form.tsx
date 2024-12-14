"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { generateTimeSlots, validateBooking } from "@/lib/booking-utils";
import { TimeSlotButton } from "./time-slot-button";
import { Calendar } from "@/components/ui/calendar";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { sendBookingConfirmationEmail } from "@/lib/email";
import { getServices, getStaff, getAppointments } from "@/lib/queries";
import type { Service, Staff, Appointment } from "@/types/database";

export function BookingForm({ selectedServiceId }: { selectedServiceId?: string }) {
  const router = useRouter();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = useState<string>();
  const [selectedService, setSelectedService] = useState<string>(selectedServiceId || "");
  const [selectedStaff, setSelectedStaff] = useState<string>();
  const [services, setServices] = useState<Service[]>([]);
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 選択されたサービスとスタッフの詳細情報を取得
  const selectedServiceDetails = services.find(s => s.id === selectedService);
  const selectedStaffDetails = staffList.find(s => s.id === selectedStaff);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [servicesData, staffData] = await Promise.all([
          getServices(),
          getStaff()
        ]);
        setServices(servicesData);
        setStaffList(staffData);
      } catch (error: any) {
        toast({
          title: "エラー",
          description: "データの読み込みに失敗しました",
          variant: "destructive",
        });
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    if (date) {
      const loadAppointments = async () => {
        try {
          const appointmentsData = await getAppointments(date);
          setAppointments(appointmentsData);
        } catch (error: any) {
          toast({
            title: "エラー",
            description: "予約データの読み込みに失敗しました",
            variant: "destructive",
          });
        }
      };
      loadAppointments();
    }
  }, [date]);

  useEffect(() => {
    if (date && selectedStaff) {
      const loadAppointments = async () => {
        const appointmentsData = await getAppointments(date, selectedStaff);
        setAppointments(appointmentsData);
      };
      loadAppointments();
    }
  }, [date, selectedStaff]);

  useEffect(() => {
    if (date && appointments) {
      const slots = generateTimeSlots(
        date,
        appointments,
        selectedServiceDetails,
        selectedStaffDetails
      );
      setTimeSlots(slots);
    }
  }, [date, appointments, selectedService, selectedStaff]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!date || !selectedTime || !selectedService || !selectedStaff) {
      toast({
        title: "エラー",
        description: "すべての項目を選択してください",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        toast({
          title: "エラー",
          description: "予約にはログインが必要です",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      // 予約時間の作成
      const [hours, minutes] = selectedTime.split(":");
      const startTime = new Date(date);
      startTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

      const endTime = new Date(startTime.getTime() + (selectedServiceDetails?.duration || 60) * 60 * 1000);

      // 予約のバリデーション
      const validationError = await validateBooking(
        user.id,
        startTime,
        endTime,
        appointments
      );

      if (validationError) {
        toast({
          title: "予約エラー",
          description: validationError.message,
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      const { data: appointment, error } = await supabase
        .from("appointments")
        .insert({
          user_id: user.id,
          service_id: selectedService,
          staff_id: selectedStaff,
          start_time: startTime.toISOString(),
          end_time: endTime.toISOString(),
          status: 'confirmed',
          price: selectedServiceDetails?.price
        })
        .select(`
          *,
          services (name, price),
          staff (name)
        `)
        .single();

      if (error) throw error;

      // 予約確認メールの送信
      try {
        await sendBookingConfirmationEmail(user.email!, {
          start_time: appointment.start_time,
          service_name: appointment.services.name,
          staff_name: appointment.staff.name,
          price: appointment.services.price,
        });
      } catch (emailError) {
        console.error('Failed to send email:', emailError);
        // メール送信失敗は予約自体の失敗とはしない
      }

      toast({
        title: "予約完了",
        description: "予約が完了しました。確認メールをお送りしました。",
      });
      
      // マイページへリダイレクト
      router.push("/mypage");
    } catch (error: any) {
      toast({
        title: "エラー",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">日付を選択</h2>
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            locale={ja}
            className="rounded-md border"
          />
        </Card>

        <Card className="p-6 space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">時間を選択</h2>
            <div className="grid grid-cols-3 gap-2">
              {timeSlots.map((slot) => (
                <TimeSlotButton
                  key={slot.time}
                  time={slot.time}
                  available={slot.available}
                  selected={selectedTime === slot.time}
                  onClick={() => setSelectedTime(slot.time)}
                />
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">メニューを選択</h2>
            <Select onValueChange={setSelectedService}>
              <SelectTrigger>
                <SelectValue placeholder="メニューを選択してください" />
              </SelectTrigger>
              <SelectContent>
                {services.map((service) => (
                  <SelectItem key={service.id} value={service.id}>
                    {service.name} ({service.duration}分 - ¥{service.price.toLocaleString()})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedServiceDetails && (
              <p className="mt-2 text-sm text-muted-foreground">
                所要時間: {selectedServiceDetails.duration}分
              </p>
            )}
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">スタッフを選択</h2>
            <Select onValueChange={setSelectedStaff}>
              <SelectTrigger>
                <SelectValue placeholder="スタッフを選択してください" />
              </SelectTrigger>
              <SelectContent>
                {staffList.map((staff) => (
                  <SelectItem key={staff.id} value={staff.id}>
                    {staff.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </Card>
      </div>

      <Button type="submit" className="w-full md:w-auto" disabled={isSubmitting}>
        {isSubmitting ? "予約処理中..." : "予約する"}
      </Button>
    </form>
  );
}