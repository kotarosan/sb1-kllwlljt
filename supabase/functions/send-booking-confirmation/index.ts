import { serve } from 'https://deno.fresh.dev/std/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.8';
import { format } from 'https://esm.sh/date-fns@2.30.0';
import { ja } from 'https://esm.sh/date-fns@2.30.0/locale';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EmailData {
  to: string;
  appointment: {
    start_time: string;
    service_name: string;
    staff_name: string;
    price: number;
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { appointment, to } = await req.json() as EmailData;

    const formattedDate = format(
      new Date(appointment.start_time),
      'yyyy年M月d日(E) HH:mm',
      { locale: ja }
    );

    const emailContent = `
      Beauty Connection予約確認

      以下の内容で予約を承りました。

      日時：${formattedDate}
      メニュー：${appointment.service_name}
      担当：${appointment.staff_name}
      料金：¥${appointment.price.toLocaleString()}

      ご予約の変更やキャンセルは、マイページから行うことができます。
      
      ご来店をお待ちしております。

      Beauty Connection
    `;

    const { error: emailError } = await supabase.auth.admin.sendRawEmail({
      to,
      from: 'noreply@beautyconnection.com',
      subject: '【Beauty Connection】ご予約確認',
      text: emailContent,
    });

    if (emailError) throw emailError;

    return new Response(
      JSON.stringify({ message: 'Email sent successfully' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});