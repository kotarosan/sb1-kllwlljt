"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { BookingForm } from "@/components/booking/booking-form";

export default function BookingPage({
  searchParams,
}: {
  searchParams: { service?: string };
}) {
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/auth");
      }
    };
    checkAuth();
  }, [router]);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">予約</h1>
        <BookingForm selectedServiceId={searchParams.service} />
      </div>
    </div>
  );
}