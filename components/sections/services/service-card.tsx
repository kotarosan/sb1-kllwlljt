"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

interface ServiceCardProps {
  id: string;
  title: string;
  description: string;
  price: string;
  duration: string;
  imageUrl: string;
}

export function ServiceCard({
  id,
  title,
  description,
  price,
  duration,
  imageUrl
}: ServiceCardProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleBooking = async (e: React.MouseEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      toast({
        title: "ログインが必要です",
        description: "予約するにはログインが必要です。ログインページに移動します。",
      });
      router.push("/auth");
      return;
    }

    router.push(`/booking?service=${id}`);
    setIsLoading(false);
  };

  return (
    <Card className="overflow-hidden transition-all hover:shadow-lg">
      <div className="relative h-48">
        <Image
          src={imageUrl}
          alt={title}
          fill
          className="object-cover"
        />
      </div>
      <div className="p-6">
        <h3 className="text-xl font-semibold mb-2">{title}</h3>
        <p className="text-gray-600 mb-4">{description}</p>
        <div className="flex justify-between items-center mb-4">
          <span className="text-lg font-bold">{price}</span>
          <span className="text-sm text-gray-500">{duration}</span>
        </div>
        <Button 
          className="w-full bg-gradient-to-r from-pink-600 to-purple-600"
          onClick={handleBooking}
          disabled={isLoading}
        >
          {isLoading ? "処理中..." : "予約する"}
        </Button>
      </div>
    </Card>
  );
}