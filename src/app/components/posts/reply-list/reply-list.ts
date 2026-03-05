import { Component, input } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

import { PostReply } from '../../../core/models/post-reply';

@Component({
  selector: 'app-reply-list',
  imports: [TranslatePipe],
  templateUrl: './reply-list.html',
  styleUrl: './reply-list.scss',
})
export class ReplyList {
  readonly replies = input<PostReply[]>([]);

  formatDate(value: Date): string {
    return value.toLocaleString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  }
}
