"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, MessageCircle, Share2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useState } from "react";
import { CommentDialog } from "./comment-dialog";
import { ja } from "date-fns/locale";

interface ForumPostProps {
  id: number;
  author: {
    name: string;
    avatar?: string;
  };
  content: string;
  createdAt: Date;
  likes: number;
  comments: number;
  onLike: () => void;
  onComment: () => void;
  onShare: () => void;
}

export function ForumPost({
  id,
  author,
  content,
  createdAt,
  likes,
  comments,
  onLike,
  onComment,
  onShare,
}: ForumPostProps) {
  const [showComments, setShowComments] = useState(false);

  return (
    <Card className="p-4 space-y-4 relative">
      <div className="flex items-center space-x-3">
        <Avatar>
          <AvatarImage src={author.avatar} />
          <AvatarFallback>{author.name[0]}</AvatarFallback>
        </Avatar>
        <div>
          <div className="font-semibold">{author.name}</div>
          <div className="text-sm text-muted-foreground">
            {formatDistanceToNow(createdAt, { addSuffix: true, locale: ja })}
          </div>
        </div>
      </div>
      <p className="text-sm">{content}</p>
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="sm" onClick={onLike} className="space-x-1">
          <Heart className="h-4 w-4" />
          <span>{likes}</span>
        </Button>
        <Button variant="ghost" size="sm" onClick={() => setShowComments(true)} className="space-x-1">
          <MessageCircle className="h-4 w-4" />
          <span>{comments}</span>
        </Button>
        <Button variant="ghost" size="sm" onClick={onShare}>
          <Share2 className="h-4 w-4" />
        </Button>
      </div>
      <CommentDialog
        postId={id}
        open={showComments}
        onOpenChange={setShowComments}
      />
    </Card>
  );
}