"use client";

import { Header } from "@/components/layout/header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ForumPost } from "@/components/community/forum-post";
import { PostForm } from "@/components/community/post-form";
import { useState, useEffect } from "react";
import { getForumPosts, likePost } from "@/lib/community";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import type { ForumPost as ForumPostType } from "@/types/community";

export default function CommunityPage() {
  const [posts, setPosts] = useState<ForumPostType[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadPosts = async () => {
    try {
      const { data, error } = await getForumPosts();
      if (error) throw error;
      if (data) setPosts(data);
    } catch (error) {
      toast({
        title: "エラー",
        description: "投稿の読み込みに失敗しました",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();

    // リアルタイム更新をサブスクライブ
    const subscription = supabase
      .channel('forum_posts')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'forum_posts'
        },
        () => {
          loadPosts();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleLike = async (postId: number) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "ログインが必要です",
          description: "いいねするにはログインが必要です",
          variant: "destructive",
        });
        return;
      }

      const { error } = await likePost(postId, user.id);
      if (error) throw error;

      // 楽観的更新
      setPosts(posts.map(post => 
        post.id === postId ? { ...post, likes: post.likes + 1 } : post
      ));
    } catch (error) {
      toast({
        title: "エラー",
        description: "いいねの処理に失敗しました",
        variant: "destructive",
      });
    }
  };

  const handleComment = (postId: number) => {
    // コメント機能の実装（モーダルを開くなど）
    console.log("Open comment modal for post:", postId);
  };

  const handleShare = (postId: number) => {
    try {
      // クリップボードにURLをコピー
      const url = `${window.location.origin}/community/post/${postId}`;
      navigator.clipboard.writeText(url);
      toast({
        title: "URLをコピーしました",
        description: "投稿のURLをクリップボードにコピーしました",
      });
    } catch (error) {
      toast({
        title: "エラー",
        description: "URLのコピーに失敗しました",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <Header />
      <main className="min-h-screen pt-24">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold mb-8">コミュニティ</h1>
          
          <Tabs defaultValue="forum" className="space-y-8">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="forum">フォーラム</TabsTrigger>
              <TabsTrigger value="events">イベント</TabsTrigger>
              <TabsTrigger value="groups">グループ</TabsTrigger>
            </TabsList>

            <TabsContent value="forum" className="space-y-6">
              <PostForm onPostCreated={loadPosts} />
              
              {loading ? (
                <div className="text-center py-8">読み込み中...</div>
              ) : posts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  投稿がありません
                </div>
              ) : (
                <div className="space-y-6">
                  {posts.map((post) => (
                    <ForumPost
                      id={post.id}
                      key={post.id}
                      author={post.author}
                      content={post.content}
                      createdAt={post.createdAt}
                      likes={post.likes}
                      comments={post.comments}
                      onLike={() => handleLike(post.id)}
                      onComment={() => handleComment(post.id)}
                      onShare={() => handleShare(post.id)}
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="events">
              <div className="text-center text-muted-foreground py-8">
                イベント機能は近日公開予定です
              </div>
            </TabsContent>

            <TabsContent value="groups">
              <div className="text-center text-muted-foreground py-8">
                グループ機能は近日公開予定です
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </>
  );
}