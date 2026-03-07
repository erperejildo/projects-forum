import { DatePipe } from '@angular/common';
import { Component, input, output, signal } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { ForumReply } from '../../../../core/models/forum-models';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';

@Component({
  selector: 'app-reply-list',
  imports: [DatePipe, TranslatePipe, MatIconModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatMenuModule],
  templateUrl: './reply-list.html',
  styleUrl: './reply-list.scss',
})
export class ReplyList {
  readonly replies = input<ForumReply[]>([]);
  readonly canReply = input(false);
  readonly currentUserId = input('');
  readonly isAdmin = input(false);
  readonly submitting = input(false);
  readonly replySubmitted = output<string>();
  readonly replyUpdated = output<{ replyId: string; message: string }>();
  readonly replyDeleted = output<string>();
  readonly draft = signal('');
  readonly editingReplyId = signal('');
  readonly editDraft = signal('');

  onDraftChange(event: Event): void {
    const value = (event.target as HTMLTextAreaElement).value;
    this.draft.set(value);
  }

  submit(): void {
    const trimmed = this.draft().trim();
    if (!trimmed) {
      return;
    }

    this.replySubmitted.emit(trimmed);
    this.draft.set('');
  }

  canManageReply(reply: ForumReply): boolean {
    return this.isAdmin() || reply.authorId === this.currentUserId();
  }

  canEditReply(reply: ForumReply): boolean {
    return reply.authorId === this.currentUserId();
  }

  startReplyEdit(reply: ForumReply): void {
    if (!this.canEditReply(reply)) {
      return;
    }

    this.editingReplyId.set(reply.id);
    this.editDraft.set(reply.message);
  }

  onEditDraftChange(event: Event): void {
    this.editDraft.set((event.target as HTMLTextAreaElement).value);
  }

  cancelReplyEdit(): void {
    this.editingReplyId.set('');
    this.editDraft.set('');
  }

  saveReplyEdit(replyId: string): void {
    const trimmed = this.editDraft().trim();
    if (!trimmed) {
      return;
    }

    this.replyUpdated.emit({ replyId, message: trimmed });
    this.cancelReplyEdit();
  }

  deleteReply(replyId: string): void {
    this.replyDeleted.emit(replyId);
    if (this.editingReplyId() === replyId) {
      this.cancelReplyEdit();
    }
  }
}
