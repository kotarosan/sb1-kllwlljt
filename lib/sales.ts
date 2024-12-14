import { supabase } from './supabase';
import { startOfDay, endOfDay, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, format } from 'date-fns';
import { ja } from 'date-fns/locale';
import type { SalesOverviewData, SalesChartData, SalesByServiceData, SalesByStaffData } from '@/types/sales';

export async function getSalesOverview(period: "daily" | "weekly" | "monthly") {
  try {
    const now = new Date();
    let startDate: Date;
    let prevStartDate: Date;

    switch (period) {
      case "daily":
        startDate = startOfDay(now);
        prevStartDate = subDays(startDate, 1);
        break;
      case "weekly":
        startDate = startOfWeek(now, { locale: ja });
        prevStartDate = subDays(startDate, 7);
        break;
      case "monthly":
        startDate = startOfMonth(now);
        prevStartDate = startOfMonth(subDays(startDate, 1));
        break;
    }

    const { data: currentData, error: currentError } = await supabase
      .from('appointments')
      .select(`
        id,
        user_id,
        services (
          price
        )
      `)
      .gte('start_time', startDate.toISOString())
      .lte('start_time', now.toISOString())
      .eq('status', 'completed');

    if (currentError) throw currentError;

    const { data: prevData, error: prevError } = await supabase
      .from('appointments')
      .select(`
        id,
        user_id,
        services (
          price
        )
      `)
      .gte('start_time', prevStartDate.toISOString())
      .lt('start_time', startDate.toISOString())
      .eq('status', 'completed');

    if (prevError) throw prevError;

    // 現在期間の集計
    const currentSales = currentData?.reduce((sum, appointment) => 
      sum + (appointment.services?.price || 0), 0) || 0;
    const currentAppointments = currentData?.length || 0;
    const currentCustomers = new Set(currentData?.map(a => a.user_id)).size;
    const currentAOV = currentAppointments > 0 ? currentSales / currentAppointments : 0;

    // 前期間の集計
    const prevSales = prevData?.reduce((sum, appointment) => 
      sum + (appointment.services?.price || 0), 0) || 0;
    const prevAppointments = prevData?.length || 0;
    const prevCustomers = new Set(prevData?.map(a => a.user_id)).size;
    const prevAOV = prevAppointments > 0 ? prevSales / prevAppointments : 0;

    // 成長率の計算
    const calculateGrowth = (current: number, previous: number) => 
      previous === 0 ? 0 : Math.round((current - previous) / previous * 100);

    return {
      data: {
        totalSales: currentSales,
        salesGrowth: calculateGrowth(currentSales, prevSales),
        totalAppointments: currentAppointments,
        appointmentsGrowth: calculateGrowth(currentAppointments, prevAppointments),
        uniqueCustomers: currentCustomers,
        customersGrowth: calculateGrowth(currentCustomers, prevCustomers),
        averageOrderValue: Math.round(currentAOV),
        aovGrowth: calculateGrowth(currentAOV, prevAOV),
      },
      error: null
    };
  } catch (error) {
    console.error('Error in getSalesOverview:', error);
    return { data: null, error };
  }
}

export async function getSalesChart(period: "daily" | "weekly" | "monthly") {
  try {
    const now = new Date();
    let startDate: Date;
    let dateFormat: string;

    switch (period) {
      case "daily":
        startDate = subDays(now, 7);
        dateFormat = "M/d";
        break;
      case "weekly":
        startDate = subDays(now, 28);
        dateFormat = "M/d";
        break;
      case "monthly":
        startDate = subDays(now, 180);
        dateFormat = "yyyy/M";
        break;
    }

    const { data, error } = await supabase
      .from('appointments')
      .select(`
        start_time,
        services (
          price
        )
      `)
      .gte('start_time', startDate.toISOString())
      .lte('start_time', now.toISOString())
      .eq('status', 'completed');

    if (error) throw error;

    // 日付ごとの売上を集計
    const salesByDate = data?.reduce((acc, appointment) => {
      const date = format(new Date(appointment.start_time), dateFormat, { locale: ja });
      acc[date] = (acc[date] || 0) + (appointment.services?.price || 0);
      return acc;
    }, {} as Record<string, number>);

    // 日付順にソートしてチャートデータを作成
    const chartData = Object.entries(salesByDate || {})
      .map(([date, sales]) => ({ date, sales }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return { data: chartData, error: null };
  } catch (error) {
    console.error('Error in getSalesChart:', error);
    return { data: [], error };
  }
}

export async function getSalesByService(period: "daily" | "weekly" | "monthly") {
  try {
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case "daily":
        startDate = startOfDay(now);
        break;
      case "weekly":
        startDate = startOfWeek(now, { locale: ja });
        break;
      case "monthly":
        startDate = startOfMonth(now);
        break;
    }

    const { data, error } = await supabase
      .from('appointments')
      .select(`
        services (
          id,
          name,
          price
        )
      `)
      .gte('start_time', startDate.toISOString())
      .lte('start_time', now.toISOString())
      .eq('status', 'completed');

    if (error) throw error;

    // サービスごとの売上を集計
    const salesByService = data?.reduce((acc, appointment) => {
      const service = appointment.services;
      if (!service) return acc;

      if (!acc[service.id]) {
        acc[service.id] = {
          name: service.name,
          sales: 0,
          count: 0
        };
      }
      acc[service.id].sales += service.price;
      acc[service.id].count += 1;
      return acc;
    }, {} as Record<string, { name: string; sales: number; count: number }>);

    // 売上順にソート
    const sortedData = Object.values(salesByService || {})
      .sort((a, b) => b.sales - a.sales);

    return { data: sortedData, error: null };
  } catch (error) {
    console.error('Error in getSalesByService:', error);
    return { data: [], error };
  }
}

export async function getSalesByStaff(period: "daily" | "weekly" | "monthly") {
  try {
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case "daily":
        startDate = startOfDay(now);
        break;
      case "weekly":
        startDate = startOfWeek(now, { locale: ja });
        break;
      case "monthly":
        startDate = startOfMonth(now);
        break;
    }

    const { data, error } = await supabase
      .from('appointments')
      .select(`
        staff (
          id,
          name
        ),
        services (
          price
        )
      `)
      .gte('start_time', startDate.toISOString())
      .lte('start_time', now.toISOString())
      .eq('status', 'completed');

    if (error) throw error;

    // スタッフごとの売上を集計
    const salesByStaff = data?.reduce((acc, appointment) => {
      const staff = appointment.staff;
      if (!staff) return acc;

      if (!acc[staff.id]) {
        acc[staff.id] = {
          name: staff.name,
          sales: 0,
          count: 0
        };
      }
      acc[staff.id].sales += appointment.services?.price || 0;
      acc[staff.id].count += 1;
      return acc;
    }, {} as Record<string, { name: string; sales: number; count: number }>);

    // 売上順にソート
    const sortedData = Object.values(salesByStaff || {})
      .sort((a, b) => b.sales - a.sales);

    return { data: sortedData, error: null };
  } catch (error) {
    console.error('Error in getSalesByStaff:', error);
    return { data: [], error };
  }
}