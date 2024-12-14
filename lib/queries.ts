import { SupabaseService } from './services/supabase-service';
import type { AppointmentWithDetails } from '@/types/database';

export async function getServices() {
  const service = SupabaseService.getInstance();
  const { data, error } = await service.getServices();
  if (error) throw error;
  return data;
}

export async function getStaff() {
  const service = SupabaseService.getInstance();
  const { data, error } = await service.getStaff();
  if (error) throw error;
  return data;
}

export async function getAppointments(date: Date, staffId?: string) {
  const service = SupabaseService.getInstance();
  const { data, error } = await service.getAppointments(date, staffId) as { data: AppointmentWithDetails[], error: Error | null };
  if (error) throw error;
  return data;
}

export async function subscribeToAppointments(
  callback: (appointments: AppointmentWithDetails[]) => void,
  userId: string
) {
  const service = SupabaseService.getInstance();
  return service.subscribeToAppointments(userId, callback);
}