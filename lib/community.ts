import { supabase } from './supabase';
import type { ForumPost, CommunityEvent, CommunityGroup } from '@/types/community';

export async function createForumPost(content: string) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('認証が必要です');

    const { error } = await supabase
      .from('forum_posts')
      .insert({
        user_id: user.id,
        content,
      });

    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('Error creating forum post:', error);
    return { error };
  }
}

export async function createComment(postId: string, content: string) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('認証が必要です');
    }

    // First, create the comment
    const { data: comment, error: commentError } = await supabase
      .from('post_comments')
      .insert({
        post_id: postId,
        user_id: user.id,
        content,
      })
      .select()
      .single();

    if (commentError) throw commentError;

    // Then, increment the comment count on the post
    const { data: post, error: getPostError } = await supabase
      .from('forum_posts')
      .select('comments')
      .eq('id', postId)
      .single();

    if (getPostError) throw getPostError;

    const { error: updateError } = await supabase
      .from('forum_posts')
      .update({ comments: (post?.comments || 0) + 1 })
      .eq('id', postId);

    if (updateError) throw updateError;

    return { data: comment, error: null };
  } catch (error) {
    console.error('Error creating comment:', error);
    return { error };
  }
}

export async function getForumPosts() {
  try {
    const { data, error } = await supabase
      .from('forum_posts')
      .select(`
        id,
        content,
        created_at,
        likes,
        comments,
        profiles (
          id,
          full_name,
          avatar_url
        ),
        user_id
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return {
      data: data?.map(post => ({
        id: post.id,
        content: post.content,
        createdAt: new Date(post.created_at),
        likes: post.likes,
        comments: post.comments,
        author: {
          name: post.profiles.full_name || '匿名ユーザー',
          avatar: post.profiles.avatar_url,
        },
      })) as ForumPost[],
      error: null,
    };
  } catch (error) {
    console.error('Error fetching forum posts:', error);
    return { data: null, error };
  }
}

export async function likePost(postId: number, userId: string) {
  try {
    // まず既存のいいねを確認
    const { data: existingLike, error: checkError } = await supabase
      .from('post_likes')
      .select()
      .eq('post_id', postId)
      .eq('user_id', userId)
      .single();

    if (checkError && checkError.code !== 'PGRST116') throw checkError;

    if (existingLike) {
      // First get current likes count
      const { data: post, error: getPostError } = await supabase
        .from('forum_posts')
        .select('likes')
        .eq('id', postId)
        .single();

      if (getPostError) throw getPostError;

      // Remove like
      const { error: unlikeError } = await supabase
        .from('post_likes')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', userId);

      if (unlikeError) throw unlikeError;

      // Decrement likes count
      const { error: updateError } = await supabase
        .from('forum_posts')
        .update({ likes: Math.max((post?.likes || 1) - 1, 0) })
        .eq('id', postId);

      if (updateError) throw updateError;
    } else {
      // First get current likes count
      const { data: post, error: getPostError } = await supabase
        .from('forum_posts')
        .select('likes')
        .eq('id', postId)
        .single();

      if (getPostError) throw getPostError;

      // Add like
      const { error: likeError } = await supabase
        .from('post_likes')
        .insert({ post_id: postId, user_id: userId });

      if (likeError) throw likeError;

      // Increment likes count
      const { error: updateError } = await supabase
        .from('forum_posts')
        .update({ likes: (post?.likes || 0) + 1 })
        .eq('id', postId);

      if (updateError) throw updateError;
    }

    return { error: null };
  } catch (error) {
    console.error('Error toggling like:', error);
    return { error };
  }
}

export async function getComments(postId: number) {
  try {
    const { data, error } = await supabase
      .from('post_comments')
      .select(`
        id,
        content,
        created_at,
        profiles (
          id,
          full_name,
          avatar_url
        ),
        user_id
      `)
      .eq('post_id', postId)
      .order('created_at', { ascending: true });

    if (error) throw error;

    return {
      data: data?.map(comment => ({
        id: comment.id,
        content: comment.content,
        createdAt: new Date(comment.created_at),
        author: {
          name: comment.profiles.full_name || '匿名ユーザー',
          avatar: comment.profiles.avatar_url,
        },
      })) as Comment[],
      error: null,
    };
  } catch (error) {
    console.error('Error fetching comments:', error);
    return { data: null, error };
  }
}