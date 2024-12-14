"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { createForumPost } from "@/lib/community";

interface PostFormProps {
  onPostCreated: () => void;
}

export function PostForm({ onPostCreated }: PostFormProps) {
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    try {
      setIsSubmitting(true);
      const { error } = await createForumPost(content);
      
      if (error) throw error;

      toast({
        title: "投稿完了",
        description: "投稿が作成されました",
      });
      
      setContent("");
      onPostCreated();
    } catch (error) {
      toast({
        title: "エラー",
        description: "投稿の作成に失敗しました",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="p-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Textarea
          placeholder="投稿内容を入力してください..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={4}
        />
        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting || !content.trim()}>
            {isSubmitting ? "投稿中..." : "投稿する"}
          </Button>
        </div>
      </form>
    </Card>
  );
}