"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ServiceCard } from "./service-card";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { getServiceImage } from "@/lib/utils";
import type { Service } from "@/types/database";

export function ServicesSection() {
  const [beautyServices, setBeautyServices] = useState<Service[]>([]);
  const [mentoringServices, setMentoringServices] = useState<Service[]>([]);

  useEffect(() => {
    const loadServices = async () => {
      const { data: services } = await supabase
        .from('services')
        .select('*')
        .order('name');

      if (services) {
        setBeautyServices(services.filter(s => s.category === 'beauty'));
        setMentoringServices(services.filter(s => s.category === 'mentoring'));
      }
    };

    loadServices();
  }, []);

  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">サービス内容</h2>
          <p className="text-xl text-gray-600">
            美容施術とメンタリングを組み合わせた、トータルビューティーケア
          </p>
        </div>

        <Tabs defaultValue="beauty" className="max-w-6xl mx-auto">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="beauty">ビューティーケア</TabsTrigger>
            <TabsTrigger value="mentoring">メンタリング</TabsTrigger>
          </TabsList>
          <TabsContent value="beauty">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {beautyServices.map((service) => (
                <ServiceCard
                  key={service.id}
                  id={service.id}
                  title={service.name}
                  description={service.description || ""}
                  price={`¥${service.price.toLocaleString()}`}
                  duration={`${service.duration}分`}
                  imageUrl={getServiceImage(service.category, service.name)}
                />
              ))}
            </div>
          </TabsContent>
          <TabsContent value="mentoring">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {mentoringServices.map((service) => (
                <ServiceCard
                  key={service.id}
                  id={service.id}
                  title={service.name}
                  description={service.description || ""}
                  price={`¥${service.price.toLocaleString()}`}
                  duration={`${service.duration}分`}
                  imageUrl={getServiceImage(service.category, service.name)}
                />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
}