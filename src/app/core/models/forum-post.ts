export type PostType = 'question' | 'issue';

export type PostOrder = 'date' | 'likes' | 'popularity';

export interface ForumPost {
  id: string;
  title: string;
  message: string;
  type: PostType;
  projectId: string;
  projectName: string;
  tags: string[];
  authorUid: string;
  authorDisplayName: string;
  authorEmail: string;
  createdAt: Date;
  updatedAt: Date;
  likesCount: number;
  repliesCount: number;
  subscribersCount: number;
}

export interface CreatePostInput {
  title: string;
  message: string;
  type: PostType;
  projectId: string;
  projectName: string;
  tags: string[];
}

export interface PostFiltersState {
  projectId: string;
  selectedTag: string;
  search: string;
}
