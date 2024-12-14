export interface ForumPost {
  id: number;
  author: {
    name: string;
    avatar?: string;
  };
  content: string;
  createdAt: Date;
  likes: number;
  comments: number;
}

export interface CommunityEvent {
  id: number;
  title: string;
  description: string;
  date: Date;
  location: string;
  capacity: number;
  participants: number;
  category: string;
}

export interface CommunityGroup {
  id: number;
  name: string;
  description: string;
  members: number;
  category: string;
  isPrivate: boolean;
}

export interface Comment {
  id: number;
  content: string;
  createdAt: Date;
  author: {
    name: string;
    avatar?: string;
  };
}