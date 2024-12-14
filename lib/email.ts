const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVwZWdlcHJtY3hhcGRzdnF0emV5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMzkyNzEzNiwiZXhwIjoyMDQ5NTAzMTM2fQ.CtnhKQGHbsVcguZL9MmiqHQMH1HX2tGIXJ2tLVD0Rbo';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';

export async function sendBookingConfirmationEmail(
  email: string,
  appointment: {
    start_time: string;
    service_name: string;
    staff_name: string;
    price: number;
  }
) {
  try {
    const formattedDate = format(
      new Date(appointment.start_time),
      'yyyy年M月d日(E) HH:mm',
      { locale: ja }
    );

    const response = await fetch(`${SUPABASE_URL}/functions/v1/send-booking-confirmation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`
      },
      body: JSON.stringify({
        to: email,
        appointment
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to send email');
    }

    return await response.json();
  } catch (error) {
    console.error('Failed to send email:', error);
    throw error;
  }
}