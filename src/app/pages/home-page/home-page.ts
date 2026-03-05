import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';

import { PostFilters } from '../../components/posts/post-filters/post-filters';
import { PostList } from '../../components/posts/post-list/post-list';
import { PostFiltersState, PostOrder } from '../../core/models/forum-post';
import { Auth } from '../../core/services/auth';
import { Forum } from '../../core/services/forum';

const INITIAL_FILTERS: PostFiltersState = {
  projectId: '',
  selectedTag: '',
  search: '',
};

@Component({
  selector: 'app-home-page',
  imports: [TranslatePipe, PostFilters, PostList],
  templateUrl: './home-page.html',
  styleUrl: './home-page.scss',
})
export class HomePage {
  private readonly forum = inject(Forum);
  private readonly auth = inject(Auth);
  private readonly router = inject(Router);
  private readonly translate = inject(TranslateService);

  readonly projects = this.forum.projects;
  readonly posts = this.forum.posts;
  readonly topTags = this.forum.topTags;
  readonly voteState = this.forum.votedPostIds;
  readonly loadingPosts = this.forum.loadingPosts;

  readonly filters = signal<PostFiltersState>(INITIAL_FILTERS);
  readonly order = signal<PostOrder>('date');
  readonly actionError = signal('');

  readonly visiblePosts = computed(() =>
    this.forum.applyFilters(this.posts(), this.filters(), this.order()),
  );

  onFiltersChange(nextFilters: PostFiltersState): void {
    this.filters.set(nextFilters);
  }

  onOrderChange(nextOrder: PostOrder): void {
    this.order.set(nextOrder);
  }

  openPost(postId: string): void {
    void this.router.navigate(['/post', postId]);
  }

  async toggleVote(postId: string): Promise<void> {
    this.actionError.set('');

    if (!this.auth.isAuthenticated()) {
      this.actionError.set(this.translate.instant('home.signInVote'));
      return;
    }

    try {
      await this.forum.toggleVote(postId);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to update vote right now.';
      this.actionError.set(message);
    }
  }
}
