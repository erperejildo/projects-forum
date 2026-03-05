export interface PostReply {
  id: string;
  message: string;
  authorUid: string;
  authorDisplayName: string;
  authorEmail: string;
  createdAt: Date;
}

export interface CreateReplyInput {
  message: string;
}
