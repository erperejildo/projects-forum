import { DatePipe } from '@angular/common';
import { Component, computed, inject, input, output } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { ForumPost } from '../../../../core/models/forum-models';
import { MatCardModule } from '@angular/material/card';
import { LikeButton } from '../../../../shared/components/like-button/like-button';

@Component({
  selector: 'app-post-card',
  imports: [DatePipe, TranslatePipe, MatCardModule, LikeButton],
  templateUrl: './post-card.html',
  styleUrl: './post-card.scss',
})
export class PostCard {
  readonly post = input.required<ForumPost>();
  readonly projectName = input('');
  readonly likeDisabled = input(false);
  readonly liked = input(false);
  readonly interactive = input(true);
  readonly dateFormat = input('dd/MM/yy, h:mm a');
  readonly useProjectedBody = input(false);
  readonly messagePreviewLength = input(0);
  readonly displayMessage = computed(() => {
    const message = this.post().message.trimEnd();
    const maxLength = this.messagePreviewLength();

    if (maxLength <= 0 || message.length <= maxLength) {
      return message;
    }

    const preview = message.slice(0, maxLength).trimEnd();
    const wordBoundaryPreview = preview.match(/^(.*)\s+\S*$/s)?.[1]?.trimEnd();

    return `${wordBoundaryPreview || preview}...`;
  });

  readonly likeToggle = output<string>();

  private readonly router = inject(Router);

  onLikeClick(): void {
    this.likeToggle.emit(this.post().id);
  }

  onCardClick(): void {
    if (!this.interactive()) {
      return;
    }

    void this.router.navigate(['/post', this.post().id]);
  }

  onCardKeydown(event: KeyboardEvent): void {
    if (!this.interactive() || (event.key !== 'Enter' && event.key !== ' ')) {
      return;
    }

    event.preventDefault();
    this.onCardClick();
  }
}
