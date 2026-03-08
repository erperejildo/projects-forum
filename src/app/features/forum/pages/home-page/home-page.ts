import { Component, computed, effect, inject, signal } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { Router, RouterLink } from '@angular/router';
import { Auth } from '../../../../core/services/auth';
import { Forum } from '../../../../core/services/forum';
import { ForumPost, PostFilters } from '../../../../core/models/forum-models';
import { FilterBar } from '../../components/filter-bar/filter-bar';
import { PostCard } from '../../components/post-card/post-card';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-home-page',
  imports: [RouterLink, TranslatePipe, FilterBar, PostCard, MatButtonModule],
  templateUrl: './home-page.html',
  styleUrl: './home-page.scss',
})
export class HomePage {
  readonly authService = inject(Auth);
  readonly forumService = inject(Forum);
  readonly postMessagePreviewLength = 240;

  readonly loading = signal(true);
  readonly errorMessage = signal('');
  readonly posts = signal<ForumPost[]>([]);

  readonly filters = signal<PostFilters>({
    projectId: '',
    search: '',
    tag: '',
    order: 'date',
  });

  readonly projects = this.forumService.projects;
  readonly usingFallbackProjects = this.forumService.usingFallbackProjects;

  readonly popularTags = computed(() => {
    const score = new Map<string, number>();
    for (const post of this.posts()) {
      for (const tag of post.tags) {
        score.set(tag, (score.get(tag) ?? 0) + 1);
      }
    }

    return Array.from(score.entries())
      .sort((first, second) => second[1] - first[1])
      .slice(0, 12)
      .map(([tag]) => tag);
  });

  readonly projectLabelById = computed(() => {
    return new Map(this.projects().map((project) => [project.id, project.name]));
  });

  readonly filteredPosts = computed(() => {
    const normalizedSearch = this.filters().search.trim().toLowerCase();
    const normalizedTag = this.filters().tag;

    return this.posts().filter((post) => {
      const matchesSearch =
        !normalizedSearch ||
        post.message.toLowerCase().includes(normalizedSearch) ||
        post.authorDisplayName.toLowerCase().includes(normalizedSearch);
      const matchesTag = !normalizedTag || post.tags.includes(normalizedTag);

      return matchesSearch && matchesTag;
    });
  });

  private readonly router = inject(Router);

  constructor() {
    effect((onCleanup) => {
      const { projectId, order } = this.filters();
      this.loading.set(true);
      this.errorMessage.set('');

      const subscription = this.forumService
        .watchPosts({
          projectId: projectId || undefined,
          order,
        })
        .subscribe({
          next: (posts) => {
            this.posts.set(posts);
            this.loading.set(false);
          },
          error: (error) => {
            this.errorMessage.set(error instanceof Error ? error.message : 'Unable to load posts.');
            this.loading.set(false);
          },
        });

      onCleanup(() => subscription.unsubscribe());
    });
  }

  onFilterChange(change: {
    projectId?: string;
    tag?: string;
    search?: string;
    order?: 'date' | 'popularity' | 'likes';
  }): void {
    this.filters.update((previous) => ({
      ...previous,
      ...change,
    }));
  }

  projectName(projectId: string): string {
    return this.projectLabelById().get(projectId) ?? projectId;
  }

  async onLikeToggle(postId: string): Promise<void> {
    const user = this.authService.user();
    if (!user) {
      await this.router.navigate([], {
        queryParams: { auth: 'open' },
        queryParamsHandling: 'merge',
      });
      return;
    }

    await this.forumService.toggleLike(postId, user.uid);
  }
}
