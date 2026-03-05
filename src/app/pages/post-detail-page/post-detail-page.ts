import { DatePipe } from '@angular/common';
import { Component, computed, effect, inject, OnDestroy, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';

import { ReplyForm } from '../../components/posts/reply-form/reply-form';
import { ReplyList } from '../../components/posts/reply-list/reply-list';
import { CreateReplyInput, PostReply } from '../../core/models/post-reply';
import { ForumPost } from '../../core/models/forum-post';
import { Auth } from '../../core/services/auth';
import { Forum } from '../../core/services/forum';

@Component({
  selector: 'app-post-detail-page',
  imports: [RouterLink, DatePipe, TranslatePipe, ReplyList, ReplyForm],
  templateUrl: './post-detail-page.html',
  styleUrl: './post-detail-page.scss',
})
export class PostDetailPage implements OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly forum = inject(Forum);
  private readonly auth = inject(Auth);
  private readonly translate = inject(TranslateService);

  private routeSubscription: Subscription;
  private repliesUnsubscribe?: () => void;

  readonly postId = signal('');
  readonly post = signal<ForumPost | null>(null);
  readonly replies = signal<PostReply[]>([]);
  readonly loading = signal(true);
  readonly actionError = signal('');
  readonly replyPending = signal(false);
  readonly subscriptionPending = signal(false);
  readonly isSubscribed = signal(false);

  readonly isAuthenticated = this.auth.isAuthenticated;
  readonly isLiked = computed(() => Boolean(this.forum.votedPostIds()[this.postId()]));

  constructor() {
    this.routeSubscription = this.route.paramMap.subscribe((params) => {
      const postId = params.get('postId') ?? '';
      void this.loadPost(postId);
    });

    effect((onCleanup) => {
      const currentPostId = this.postId();
      const user = this.auth.currentUser();

      this.isSubscribed.set(false);

      if (!currentPostId || !user) {
        return;
      }

      const unsubscribe = this.forum.listenToSubscriptionStatus(
        currentPostId,
        user.uid,
        (isSubscribed) => {
          this.isSubscribed.set(isSubscribed);
        },
      );

      onCleanup(() => unsubscribe());
    });
  }

  ngOnDestroy(): void {
    this.routeSubscription.unsubscribe();
    this.repliesUnsubscribe?.();
  }

  async toggleVote(): Promise<void> {
    this.actionError.set('');

    if (!this.isAuthenticated()) {
      this.actionError.set(this.translate.instant('postDetail.signInVote'));
      return;
    }

    if (!this.postId()) {
      return;
    }

    try {
      await this.forum.toggleVote(this.postId());
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to update vote right now.';
      this.actionError.set(message);
    }
  }

  async toggleSubscription(): Promise<void> {
    this.actionError.set('');

    if (!this.isAuthenticated()) {
      this.actionError.set(this.translate.instant('postDetail.signInNotify'));
      return;
    }

    this.subscriptionPending.set(true);

    try {
      const subscribed = await this.forum.toggleSubscription(this.postId());
      this.isSubscribed.set(subscribed);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to update subscription.';
      this.actionError.set(message);
    } finally {
      this.subscriptionPending.set(false);
    }
  }

  async submitReply(input: CreateReplyInput): Promise<void> {
    this.actionError.set('');

    if (!this.postId()) {
      return;
    }

    this.replyPending.set(true);

    try {
      await this.forum.addReply(this.postId(), input.message);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to post reply.';
      this.actionError.set(message);
    } finally {
      this.replyPending.set(false);
    }
  }

  private async loadPost(postId: string): Promise<void> {
    this.postId.set(postId);
    this.loading.set(true);
    this.actionError.set('');
    this.post.set(null);
    this.replies.set([]);
    this.repliesUnsubscribe?.();
    this.repliesUnsubscribe = undefined;

    if (!postId) {
      this.actionError.set(this.translate.instant('postDetail.idMissing'));
      this.loading.set(false);
      return;
    }

    try {
      const resolvedPost = await this.forum.getPostById(postId);

      if (!resolvedPost) {
        this.actionError.set(this.translate.instant('postDetail.notFound'));
        this.loading.set(false);
        return;
      }

      this.post.set(resolvedPost);

      this.repliesUnsubscribe = this.forum.listenToReplies(postId, (replies) => {
        this.replies.set(replies);
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to load this post.';
      this.actionError.set(message);
    } finally {
      this.loading.set(false);
    }
  }
}
