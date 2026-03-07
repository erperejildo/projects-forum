import { DatePipe } from '@angular/common';
import { Component, input, output, signal, computed, inject } from '@angular/core';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { ForumReply } from '../../../../core/models/forum-models';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { openConfirmDialog } from '../../../../shared/components/confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-reply-list',
  imports: [
    DatePipe,
    TranslatePipe,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatMenuModule,
    MatDialogModule,
  ],
  templateUrl: './reply-list.html',
  styleUrl: './reply-list.scss',
})
export class ReplyList {
  private readonly translate = inject(TranslateService);
  private readonly dialog = inject(MatDialog);

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

  // track whether user has interacted with the textarea so we can show
  // validation errors only after the first touch
  readonly draftTouched = signal(false);
  readonly editTouched = signal(false);

  // derived flags for whether the current value is valid for submission
  readonly canSubmit = computed(() => !!this.draft().trim());
  readonly canSave = computed(() => !!this.editDraft().trim());

  onDraftChange(event: Event): void {
    const value = (event.target as HTMLTextAreaElement).value;
    this.draft.set(value);
    if (!this.draftTouched()) {
      this.draftTouched.set(true);
    }
  }

  submit(): void {
    // mark touched so the error message will show if invalid
    if (!this.draftTouched()) {
      this.draftTouched.set(true);
    }

    const trimmed = this.draft().trim();
    if (!trimmed) {
      return;
    }

    this.replySubmitted.emit(trimmed);
    this.draft.set('');
    this.draftTouched.set(false);
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
    if (!this.editTouched()) {
      this.editTouched.set(true);
    }
  }

  cancelReplyEdit(): void {
    this.editingReplyId.set('');
    this.editDraft.set('');
  }

  saveReplyEdit(replyId: string): void {
    // ensure touched so validation message displays
    if (!this.editTouched()) {
      this.editTouched.set(true);
    }

    const trimmed = this.editDraft().trim();
    if (!trimmed) {
      return;
    }

    this.replyUpdated.emit({ replyId, message: trimmed });
    this.cancelReplyEdit();
  }

  async deleteReply(replyId: string): Promise<void> {
    const msg = this.translate.instant('post.confirmDeleteReply');
    const ok = await openConfirmDialog(this.dialog, msg);
    if (!ok) {
      return;
    }

    this.replyDeleted.emit(replyId);
    if (this.editingReplyId() === replyId) {
      this.cancelReplyEdit();
    }
  }
}
