import { Component, input, output } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

import { ForumPost } from '../../../core/models/forum-post';
import { PostCard } from '../post-card/post-card';

@Component({
  selector: 'app-post-list',
  imports: [PostCard, TranslatePipe],
  templateUrl: './post-list.html',
  styleUrl: './post-list.scss',
})
export class PostList {
  readonly posts = input<ForumPost[]>([]);
  readonly voteState = input<Record<string, boolean>>({});

  readonly openPost = output<string>();
  readonly toggleVote = output<string>();

  onOpenPost(postId: string): void {
    this.openPost.emit(postId);
  }

  onToggleVote(postId: string): void {
    this.toggleVote.emit(postId);
  }

  isLiked(postId: string): boolean {
    return Boolean(this.voteState()[postId]);
  }
}
