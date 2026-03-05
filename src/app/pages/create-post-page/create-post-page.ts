import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';

import { PostForm } from '../../components/posts/post-form/post-form';
import { CreatePostInput } from '../../core/models/forum-post';
import { Forum } from '../../core/services/forum';

@Component({
  selector: 'app-create-post-page',
  imports: [RouterLink, TranslatePipe, PostForm],
  templateUrl: './create-post-page.html',
  styleUrl: './create-post-page.scss',
})
export class CreatePostPage {
  private readonly forum = inject(Forum);
  private readonly router = inject(Router);
  private readonly translate = inject(TranslateService);

  readonly projects = this.forum.projects;
  readonly loadingProjects = this.forum.loadingProjects;
  readonly isSubmitting = signal(false);
  readonly submissionError = signal('');

  readonly canCreatePost = computed(() => !this.loadingProjects() && this.projects().length > 0);

  async submitPost(input: CreatePostInput): Promise<void> {
    this.submissionError.set('');
    this.isSubmitting.set(true);

    try {
      const postId = await this.forum.createPost(input);
      await this.router.navigate(['/post', postId]);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : this.translate.instant('createPost.defaultError');
      this.submissionError.set(message);
    } finally {
      this.isSubmitting.set(false);
    }
  }
}
