export type PostType = 'question' | 'issue';

export type PostOrder = 'date' | 'popularity' | 'likes';

export interface ForumProject {
  id: string;
  name: string;
}

export interface ForumPost {
  id: string;
  authorId: string;
  authorDisplayName: string;
  projectId: string;
  type: PostType;
  message: string;
  tags: string[];
  likesCount: number;
  replyCount: number;
  deleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ForumReply {
  id: string;
  authorId: string;
  authorDisplayName: string;
  message: string;
  deleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface PostFilters {
  projectId?: string;
  search: string;
  tag: string;
  order: PostOrder;
}
