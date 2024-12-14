// Add "use client" directive at the top
"use client";

import { useState } from "react";
import { PriceCard } from "./price-card";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { subscribeToPlan } from "@/lib/subscription";

export function PricingSection() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubscribe = async (plan: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      toast({
        title: "ログインが必要です",
        description: "プランを選択するにはログインが必要です",
      });
      router.push("/auth");
      return;
    }

    try {
      setIsLoading(true);
      const { error } = await subscribeToPlan(user.id, plan);
      
      if (error) throw error;

      toast({
        title: "サブスクリプション登録完了",
        description: `${plan}プランへの登録が完了しました`,
      });
      
      router.push('/mypage');
    } catch (error: any) {
      toast({
        title: "エラー",
        description: error.message || "サブスクリプションの登録に失敗しました",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const plans = [
    {
      title: "ベーシック",
      price: 9800,
      description: "美容サロン向けの基本機能が揃ったプラン",
      features: [
        "オンライン予約システム",
        "LINE連携",
        "顧客管理基本機能",
        "売上レポート（月次）",
        "メール・LINE サポート"
      ]
    },
    {
      title: "スタンダード",
      price: 19800,
      description: "成長するサロン向けの充実機能",
      features: [
        "ベーシックの全機能",
        "AIアシスタント",
        "顧客分析レポート",
        "売上レポート（日次・週次）",
        "優先サポート",
        "スタッフ管理機能"
      ],
      isPopular: true
    },
    {
      title: "プレミアム",
      price: 39800,
      description: "大規模サロン向けのプレミアム機能",
      features: [
        "スタンダードの全機能",
        "複数店舗管理",
        "カスタマイズ可能なBI機能",
        "専任サポート担当者",
        "API連携",
        "スタッフトレーニング"
      ]
    }
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">料金プラン</h2>
          <p className="text-xl text-gray-600">
            サロンの規模や目的に合わせて最適なプランをお選びいただけます
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan) => (
            <PriceCard
              key={plan.title}
              {...plan}
              onSubscribe={() => handleSubscribe(plan.title)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}