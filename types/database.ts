export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: string;
  created_at: string;
  updated_at: string;
}

export type AppointmentStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';

export interface AppointmentStatusConfig {
  label: string;
  color: 'default' | 'secondary' | 'destructive' | 'success';
  description: string;
}

export interface Appointment {
  id: string;
  user_id: string;
  service_id: string;
  staff_id: string;
  start_time: string;
  end_time: string;
  status: AppointmentStatus;
  created_at: string;
}

export interface AppointmentWithDetails extends Appointment {
  services: {
    name: string;
    duration: number;
    price: number;
  };
  staff: {
    name: string;
    role: string;
  };
}