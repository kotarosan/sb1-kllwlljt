import { ProfileForm } from "@/components/mypage/profile-form";

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-background pt-20">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">プロフィール</h1>
        <ProfileForm />
      </div>
    </div>
  );
}