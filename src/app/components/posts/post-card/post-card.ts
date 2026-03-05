import { DatePipe } from '@angular/common';
import { Component, computed, input, output } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

import { ForumPost } from '../../../core/models/forum-post';

@Component({
  selector: 'app-post-card',
  imports: [DatePipe, TranslatePipe],
  templateUrl: './post-card.html',
  styleUrl: './post-card.scss',
})
export class PostCard {
  readonly post = input.required<ForumPost>();
  readonly liked = input(false);

  readonly openPost = output<string>();
  readonly toggleVote = output<string>();

  readonly popularity = computed(() => {
    const post = this.post();
    return post.likesCount * 2 + post.repliesCount * 3 + post.subscribersCount;
  });

  onOpenPost(): void {
    this.openPost.emit(this.post().id);
  }

  onToggleVote(): void {
    this.toggleVote.emit(this.post().id);
  }
}
