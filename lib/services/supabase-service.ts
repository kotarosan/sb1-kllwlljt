import { supabase } from '@/lib/supabase';
import type { Service, Staff, Appointment, AppointmentWithDetails } from '@/types/database';
import type { Database } from '@/types/supabase';

type ServiceResponse<T> = {
  data: T | null;
  error: Error | null;
};

export class SupabaseService {
  private static instance: SupabaseService;
  
  private constructor() {}
  
  static getInstance(): SupabaseService {
    if (!SupabaseService.instance) {
      SupabaseService.instance = new SupabaseService();
    }
    return SupabaseService.instance;
  }

  async getServices(): Promise<ServiceResponse<Service[]>> {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .order('name');

      if (error) throw error;
      
      if (!data) {
        throw new Error('No data returned from services query');
      }

      return { data, error: null };
    } catch (error) {
      console.error('Error fetching services:', error);
      return { data: null, error: error as Error };
    }
  }

  async getStaff(): Promise<ServiceResponse<Staff[]>> {
    try {
      const { data, error } = await supabase
        .from('staff')
        .select('*')
        .order('name');

      if (error) throw error;
      
      if (!data) {
        throw new Error('No data returned from staff query');
      }

      return { data, error: null };
    } catch (error) {
      console.error('Error fetching staff:', error);
      return { data: null, error: error as Error };
    }
  }

  async getAppointments(date: Date, staffId?: string): Promise<ServiceResponse<Appointment[]>> {
    try {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      let query = supabase
        .from('appointments')
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
        .gte('start_time', startOfDay.toISOString())
        .lte('start_time', endOfDay.toISOString());

      if (staffId) {
        query = query.eq('staff_id', staffId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching appointments:', error);
      return { data: null, error: error as Error };
    }
  }

  async createAppointment(appointment: Omit<Appointment, 'id' | 'created_at'>): Promise<ServiceResponse<Appointment>> {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .insert([appointment])
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error creating appointment:', error);
      return { data: null, error: error as Error };
    }
  }

  async updateAppointmentStatus(
    appointmentId: string, 
    status: 'pending' | 'confirmed' | 'cancelled'
  ): Promise<ServiceResponse<Appointment>> {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .update({ status })
        .eq('id', appointmentId)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error updating appointment status:', error);
      return { data: null, error: error as Error };
    }
  }

  subscribeToAppointments(
    userId: string,
    callback: (appointments: AppointmentWithDetails[]) => void
  ) {
    return supabase
      .channel('appointments')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'appointments',
          filter: `user_id=eq.${userId}`
        },
        async () => {
          const { data } = await supabase
            .from('appointments')
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
            .eq('user_id', userId)
            .order('start_time', { ascending: false });

          if (data) {
            callback(data);
          }
        }
      )
      .subscribe();
  }
}