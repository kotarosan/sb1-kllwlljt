"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handlePasswordChange = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const currentPassword = formData.get("currentPassword") as string;
    const newPassword = formData.get("newPassword") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (newPassword !== confirmPassword) {
      toast({
        title: "エラー",
        description: "新しいパスワードと確認用パスワードが一致しません",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      toast({
        title: "更新完了",
        description: "パスワードを更新しました",
      });

      // フォームをリセット
      e.currentTarget.reset();
    } catch (error) {
      console.error("Error updating password:", error);
      toast({
        title: "エラー",
        description: "パスワードの更新に失敗しました",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">設定</h1>

      <Tabs defaultValue="security">
        <TabsList>
          <TabsTrigger value="security">セキュリティ</TabsTrigger>
          <TabsTrigger value="notifications">通知</TabsTrigger>
          <TabsTrigger value="system">システム</TabsTrigger>
        </TabsList>

        <TabsContent value="security" className="space-y-4">
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">パスワード変更</h2>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">現在のパスワード</Label>
                <Input
                  id="currentPassword"
                  name="currentPassword"
                  type="password"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">新しいパスワード</Label>
                <Input
                  id="newPassword"
                  name="newPassword"
                  type="password"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">新しいパスワード（確認）</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                />
              </div>
              <Button type="submit" disabled={loading}>
                {loading ? "更新中..." : "パスワードを変更"}
              </Button>
            </form>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">通知設定</h2>
            <p className="text-muted-foreground">
              通知設定は近日公開予定です
            </p>
          </Card>
        </TabsContent>

        <TabsContent value="system">
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">システム設定</h2>
            <p className="text-muted-foreground">
              システム設定は近日公開予定です
            </p>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}