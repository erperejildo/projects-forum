import { DatePipe } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { RouterLink } from '@angular/router';
import { ForumPost } from '../../../../core/models/forum-models';
import { MatCardModule } from '@angular/material/card';
import { LikeButton } from '../../../../shared/components/like-button/like-button';

@Component({
  selector: 'app-post-card',
  imports: [RouterLink, DatePipe, TranslatePipe, MatCardModule, LikeButton],
  templateUrl: './post-card.html',
  styleUrl: './post-card.scss',
})
export class PostCard {
  readonly post = input.required<ForumPost>();
  readonly projectName = input('');
  readonly canLike = input(false);
  readonly liked = input(false);

  readonly likeToggle = output<string>();

  onLikeClick(): void {
    this.likeToggle.emit(this.post().id);
  }
}
