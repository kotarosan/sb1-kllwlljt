"use client";

import { AuthForm } from "@/components/auth/auth-form";
import { useSearchParams } from 'next/navigation';

export default function AuthPage() {
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirectTo');

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            アカウント
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Beauty Connectionの各種サービスをご利用いただくには、
            アカウントの作成が必要です
          </p>
        </div>
        <AuthForm redirectTo={redirectTo || '/mypage'} />
      </div>
    </div>
  );
}