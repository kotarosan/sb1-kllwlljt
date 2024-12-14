import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getServiceImage(category: string, name: string): string {
  const images = {
    beauty: {
      "フルフェイシャルケア": "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881",
      "ホリスティックマッサージ": "https://images.unsplash.com/photo-1544161515-4ab6ce6db874",
      "アンチエイジングケア": "https://images.unsplash.com/photo-1512290923902-8a9f81dc236c",
    },
    mentoring: {
      "パーソナルメンタリング": "https://images.unsplash.com/photo-1516534775068-ba3e7458af70",
      "グループセッション": "https://images.unsplash.com/photo-1515187029135-18ee286d815b",
      "ライフスタイル設計": "https://images.unsplash.com/photo-1434030216411-0b793f4b4173",
    }
  };

  return `${images[category]?.[name] || "https://images.unsplash.com/photo-1544161515-4ab6ce6db874"}?auto=format&fit=crop&q=80&w=800&h=600`;
}
