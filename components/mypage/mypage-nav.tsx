"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar, UserCircle2, Sparkles, CreditCard } from "lucide-react";

const navigation = [
  { name: "予約履歴", href: "/mypage", icon: Calendar },
  { name: "プロフィール", href: "/mypage/profile", icon: UserCircle2 },
  { name: "特典履歴", href: "/mypage/rewards", icon: Trophy },
  { name: "サービス一覧", href: "/services", icon: Sparkles },
  { name: "料金プラン", href: "/pricing", icon: CreditCard },
];

export function MyPageNav() {
  const pathname = usePathname();

  return (
    <nav className="flex gap-2 mb-8">
      {navigation.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link key={item.name} href={item.href}>
            <Button
              variant={isActive ? "default" : "ghost"}
              className={cn(
                "gap-2",
                isActive && "bg-primary text-primary-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.name}
            </Button>
          </Link>
        );
      })}
    </nav>
  );
}