import { DatePipe } from '@angular/common';
import { Component, computed, effect, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { TranslatePipe } from '@ngx-translate/core';
import { ActivatedRoute, Router } from '@angular/router';
import { map } from 'rxjs';
import { ForumPost, ForumReply } from '../../../../core/models/forum-models';
import { Auth } from '../../../../core/services/auth';
import { Forum } from '../../../../core/services/forum';
import { ReplyList } from '../../components/reply-list/reply-list';
import { LikeButton } from '../../../../shared/components/like-button/like-button';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-post-detail-page',
  imports: [TranslatePipe, DatePipe, ReplyList, LikeButton, MatButtonModule, MatMenuModule, MatIconModule],
  templateUrl: './post-detail-page.html',
  styleUrl: './post-detail-page.scss',
})
export class PostDetailPage {
  readonly authService = inject(Auth);
  readonly forumService = inject(Forum);

  readonly post = signal<ForumPost | null>(null);
  readonly replies = signal<ForumReply[]>([]);
  readonly loading = signal(true);
  readonly busy = signal(false);
  readonly liked = signal(false);
  readonly subscribed = signal(false);
  readonly editingPost = signal(false);
  readonly postDraft = signal('');
  readonly errorMessage = signal('');

  readonly currentUserId = computed(() => this.authService.user()?.uid ?? '');
  readonly canManagePost = computed(() => {
    const post = this.post();
    const user = this.authService.user();
    if (!post || !user) {
      return false;
    }

    return post.authorId === user.uid || this.authService.isAdmin();
  });
  readonly canEditPost = computed(() => {
    const post = this.post();
    const user = this.authService.user();
    if (!post || !user) {
      return false;
    }

    return post.authorId === user.uid;
  });

  readonly projectLabelById = computed(() => {
    return new Map(this.forumService.projects().map((project) => [project.id, project.name]));
  });

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly postId = toSignal(
    this.route.paramMap.pipe(map((params) => params.get('id') ?? '')),
    {
      initialValue: '',
    },
  );

  constructor() {
    effect((onCleanup) => {
      const id = this.postId();
      if (!id) {
        this.post.set(null);
        this.replies.set([]);
        this.loading.set(false);
        return;
      }

      this.loading.set(true);
      this.errorMessage.set('');

      const postSubscription = this.forumService.watchPost(id).subscribe({
        next: (post) => {
          this.post.set(post);
          this.postDraft.set(post?.message ?? '');
          if (!post) {
            this.editingPost.set(false);
          }
          this.loading.set(false);
        },
        error: (error) => {
          this.errorMessage.set(error instanceof Error ? error.message : 'Unable to load post.');
          this.loading.set(false);
        },
      });

      const repliesSubscription = this.forumService.watchReplies(id).subscribe({
        next: (replies) => this.replies.set(replies),
        error: () => this.replies.set([]),
      });

      onCleanup(() => {
        postSubscription.unsubscribe();
        repliesSubscription.unsubscribe();
      });
    });

    effect((onCleanup) => {
      const id = this.postId();
      const user = this.authService.user();

      if (!id || !user) {
        this.liked.set(false);
        this.subscribed.set(false);
        return;
      }

      const likedSubscription = this.forumService.watchLiked(id, user.uid).subscribe((liked) => {
        this.liked.set(liked);
      });

      const subscribedSubscription = this.forumService
        .watchSubscribed(id, user.uid)
        .subscribe((subscribed) => {
          this.subscribed.set(subscribed);
        });

      onCleanup(() => {
        likedSubscription.unsubscribe();
        subscribedSubscription.unsubscribe();
      });
    });
  }

  projectName(projectId: string): string {
    return this.projectLabelById().get(projectId) ?? projectId;
  }

  async onLikeToggle(): Promise<void> {
    const id = this.postId();
    const user = this.authService.user();
    if (!id || !user) {
      await this.requestAuth();
      return;
    }

    this.busy.set(true);
    try {
      await this.forumService.toggleLike(id, user.uid);
    } finally {
      this.busy.set(false);
    }
  }

  async onSubscriptionToggle(): Promise<void> {
    const id = this.postId();
    const user = this.authService.user();
    if (!id || !user) {
      await this.requestAuth();
      return;
    }

    this.busy.set(true);
    try {
      await this.forumService.toggleSubscription(id, user);
    } finally {
      this.busy.set(false);
    }
  }

  async onReplySubmitted(message: string): Promise<void> {
    const id = this.postId();
    const user = this.authService.user();
    if (!id || !user) {
      await this.requestAuth();
      return;
    }

    this.busy.set(true);
    try {
      await this.forumService.addReply(id, message, user);
    } finally {
      this.busy.set(false);
    }
  }

  startPostEdit(): void {
    const currentPost = this.post();
    if (!currentPost || !this.canEditPost()) {
      return;
    }

    this.postDraft.set(currentPost.message);
    this.editingPost.set(true);
  }

  onPostDraftChange(event: Event): void {
    const value = (event.target as HTMLTextAreaElement).value;
    this.postDraft.set(value);
  }

  cancelPostEdit(): void {
    this.editingPost.set(false);
    this.postDraft.set(this.post()?.message ?? '');
  }

  async savePostEdit(): Promise<void> {
    const id = this.postId();
    const user = this.authService.user();
    if (!id || !user) {
      await this.requestAuth();
      return;
    }

    this.busy.set(true);
    this.errorMessage.set('');
    try {
      await this.forumService.updatePost(id, this.postDraft(), user);
      this.editingPost.set(false);
    } catch (error) {
      this.errorMessage.set(error instanceof Error ? error.message : 'Unable to update post.');
    } finally {
      this.busy.set(false);
    }
  }

  async deletePost(): Promise<void> {
    const id = this.postId();
    const user = this.authService.user();
    if (!id || !user) {
      await this.requestAuth();
      return;
    }

    this.busy.set(true);
    this.errorMessage.set('');
    try {
      await this.forumService.softDeletePost(id, user, this.authService.isAdmin());
    } catch (error) {
      this.errorMessage.set(error instanceof Error ? error.message : 'Unable to delete post.');
    } finally {
      this.busy.set(false);
    }
  }

  async onReplyUpdated(payload: { replyId: string; message: string }): Promise<void> {
    const id = this.postId();
    const user = this.authService.user();
    if (!id || !user) {
      await this.requestAuth();
      return;
    }

    this.busy.set(true);
    this.errorMessage.set('');
    try {
      await this.forumService.updateReply(id, payload.replyId, payload.message, user);
    } catch (error) {
      this.errorMessage.set(error instanceof Error ? error.message : 'Unable to update reply.');
    } finally {
      this.busy.set(false);
    }
  }

  async onReplyDeleted(replyId: string): Promise<void> {
    const id = this.postId();
    const user = this.authService.user();
    if (!id || !user) {
      await this.requestAuth();
      return;
    }

    this.busy.set(true);
    this.errorMessage.set('');
    try {
      await this.forumService.softDeleteReply(id, replyId, user, this.authService.isAdmin());
    } catch (error) {
      this.errorMessage.set(error instanceof Error ? error.message : 'Unable to delete reply.');
    } finally {
      this.busy.set(false);
    }
  }

  private async requestAuth(): Promise<void> {
    await this.router.navigate([], {
      queryParams: { auth: 'open' },
      queryParamsHandling: 'merge',
    });
  }
}
