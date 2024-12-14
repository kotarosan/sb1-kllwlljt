import { MyPageNav } from "@/components/mypage/mypage-nav";
import { Header } from "@/components/layout/header";

export default function MyPageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <div className="min-h-screen bg-background pt-20">
        <div className="container mx-auto px-4 py-8">
          <MyPageNav />
          {children}
        </div>
      </div>
    </>
  );
}