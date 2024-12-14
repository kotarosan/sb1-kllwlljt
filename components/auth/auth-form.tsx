"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { signIn, signUp, getProfile } from "@/lib/auth";
import type { AuthApiError } from '@supabase/supabase-js';

interface AuthFormProps {
  redirectTo: string;
}

export function AuthForm({ redirectTo }: AuthFormProps) {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const { toast } = useToast();

  const handleRedirect = async (userId: string) => {
    const { data: profile } = await getProfile(userId);

    if (profile?.role === 'admin') {
      router.push('/admin');
    } else {
      router.push('/mypage');
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (!email || !password) {
        throw new Error('メールアドレスとパスワードを入力してください');
      }

      if (password.length < 6) {
        throw new Error('パスワードは6文字以上で入力してください');
      }

      const { error } = await signUp(email, password);

      if (error) throw error;

      toast({
        title: "確認メールを送信しました",
        description: "メールに記載されたリンクから登録を完了してください",
      });
    } catch (error: any) {
      toast({
        title: "エラーが発生しました",
        description: getErrorMessage(error),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!email || !password) {
        toast({
          title: "入力エラー",
          description: "メールアドレスとパスワードを入力してください",
          variant: "destructive",
        });
        return;
      }

      setLoading(true);
      const { user, error } = await signIn(email, password);

      if (error) throw error;

      if (user) {
        toast({
          title: "ログインしました",
        });
        router.push(redirectTo);
      } else {
        throw new Error('ログインに失敗しました');
      }
    } catch (error: any) {
      toast({
        title: "エラーが発生しました",
        description: getErrorMessage(error),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getErrorMessage = (error: AuthApiError | Error): string => {
    if ('status' in error) {
      switch (error.status) {
        case 400:
          return 'メールアドレスまたはパスワードが正しくありません';
        case 401:
          return 'メールアドレスまたはパスワードが正しくありません';
        case 422:
          return 'メールアドレスの形式が正しくありません';
        default:
          return 'エラーが発生しました。しばらく時間をおいて再度お試しください';
      }
    }
    return error.message;
  };

  return (
    <Tabs defaultValue="signin" className="w-full max-w-md">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="signin">ログイン</TabsTrigger>
        <TabsTrigger value="signup">新規登録</TabsTrigger>
      </TabsList>

      <TabsContent value="signin">
        <form onSubmit={handleSignIn} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">メールアドレス</Label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">パスワード</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "処理中..." : "ログイン"}
          </Button>
        </form>
      </TabsContent>

      <TabsContent value="signup">
        <form onSubmit={handleSignUp} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="signup-email">メールアドレス</Label>
            <Input
              id="signup-email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="signup-password">パスワード</Label>
            <Input
              id="signup-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "処理中..." : "アカウント作成"}
          </Button>
        </form>
      </TabsContent>
    </Tabs>
  );
}