import { MyPageContent } from "@/components/mypage/mypage-content";

export default function MyPage() {
  return (
    <div className="min-h-screen bg-background pt-20">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">マイページ</h1>
        <MyPageContent />
      </div>
    </div>
  );
}