import { useState, useEffect } from "react";
import { format, subDays, eachDayOfInterval } from "date-fns";
import { ja } from "date-fns/locale";
import { supabase } from "@/lib/supabase";

export interface DailySales {
  date: string;
  sales: number;
}

export function useSalesData() {
  const [data, setData] = useState<DailySales[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const loadSalesData = async () => {
      try {
        const endDate = new Date();
        const startDate = subDays(endDate, 7);

        const { data: appointments, error } = await supabase
          .from("appointments")
          .select("start_time, services (price)")
          .gte("start_time", startDate.toISOString())
          .lte("start_time", endDate.toISOString());

        if (error) throw error;

        const days = eachDayOfInterval({ start: startDate, end: endDate });
        const salesByDay = days.map((day) => {
          const dayAppointments = appointments?.filter((appointment) =>
            format(new Date(appointment.start_time), "yyyy-MM-dd") ===
            format(day, "yyyy-MM-dd")
          );
          
          const daySales = dayAppointments?.reduce(
            (acc, curr) => acc + (curr.services?.price || 0),
            0
          ) || 0;

          return {
            date: format(day, "M/d(E)", { locale: ja }),
            sales: daySales,
          };
        });

        setData(salesByDay);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to load sales data'));
      } finally {
        setLoading(false);
      }
    };

    loadSalesData();
  }, []);

  return { data, loading, error };
}