import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative h-[90vh] flex items-center justify-center bg-gradient-to-r from-pink-50 to-purple-50">
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-10"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80')"
        }}
      />
      <div className="container mx-auto px-4 text-center relative z-10">
        <h1 className="text-5xl md:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-600 to-purple-600 mb-6">
          Beauty Connection
        </h1>
        <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-2xl mx-auto">
          美容とメンタリングの融合で、あなたの内側と外側の美しさを引き出します
        </p>
        <div className="flex gap-4 justify-center">
          <Button size="lg" className="bg-gradient-to-r from-pink-600 to-purple-600">
            予約する <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          <Button size="lg" variant="outline">
            詳しく見る
          </Button>
        </div>
      </div>
    </section>
  );
}