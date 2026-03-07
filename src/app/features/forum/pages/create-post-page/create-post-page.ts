import { Component, effect, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { PostType } from '../../../../core/models/forum-models';
import { Auth } from '../../../../core/services/auth';
import { Forum } from '../../../../core/services/forum';
import { TagInput } from '../../components/tag-input/tag-input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-create-post-page',
  imports: [ReactiveFormsModule, TranslatePipe, TagInput, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule, MatCardModule],
  templateUrl: './create-post-page.html',
  styleUrl: './create-post-page.scss',
})
export class CreatePostPage {
  readonly authService = inject(Auth);
  readonly forumService = inject(Forum);

  readonly projects = this.forumService.projects;
  readonly submitting = signal(false);
  readonly errorMessage = signal('');
  readonly tags = signal<string[]>([]);

  readonly form = new FormGroup({
    projectId: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    type: new FormControl<PostType>('question', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    message: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(8)],
    }),
  });

  private readonly router = inject(Router);

  constructor() {
    effect(() => {
      if (this.form.controls.projectId.value || !this.projects().length) {
        return;
      }

      this.form.controls.projectId.setValue(
        this.forumService.defaultProject() || this.projects()[0].id,
      );
    });
  }

  updateTags(tags: string[]): void {
    this.tags.set(tags);
  }

  get minlengthError() {
    const errors = this.form.controls.message.errors;
    return errors && errors['minlength'] ? errors['minlength'] : null;
  }

  async submit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const user = this.authService.user();
    if (!user) {
      await this.router.navigate(['/'], {
        queryParams: { auth: 'open' },
      });
      return;
    }

    this.submitting.set(true);
    this.errorMessage.set('');

    try {
      const postId = await this.forumService.createPost({
        user,
        projectId: this.form.controls.projectId.value,
        type: this.form.controls.type.value,
        message: this.form.controls.message.value.trim(),
        tags: this.tags(),
      });

      await this.router.navigate(['/post', postId]);
    } catch (error) {
      this.errorMessage.set(error instanceof Error ? error.message : 'Unable to create post.');
    } finally {
      this.submitting.set(false);
    }
  }
}
