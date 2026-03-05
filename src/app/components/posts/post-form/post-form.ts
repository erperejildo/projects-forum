import { CommonModule } from '@angular/common';
import { Component, computed, inject, input, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';

import { ForumProject } from '../../../core/models/forum-project';
import { CreatePostInput, PostType } from '../../../core/models/forum-post';
import { TagInput } from '../tag-input/tag-input';

@Component({
  selector: 'app-post-form',
  imports: [CommonModule, ReactiveFormsModule, TranslatePipe, TagInput],
  templateUrl: './post-form.html',
  styleUrl: './post-form.scss',
})
export class PostForm {
  private readonly formBuilder = inject(FormBuilder);

  readonly projects = input<ForumProject[]>([]);
  readonly pending = input(false);
  readonly submitPost = output<CreatePostInput>();

  readonly tags = signal<string[]>([]);

  readonly form = this.formBuilder.nonNullable.group({
    title: ['', [Validators.required, Validators.maxLength(120)]],
    message: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(3000)]],
    type: ['question' as PostType, Validators.required],
    projectId: ['', Validators.required],
  });

  readonly selectedProjectName = computed(() => {
    const selectedProjectId = this.form.controls.projectId.value;
    return this.projects().find((project) => project.id === selectedProjectId)?.name ?? '';
  });

  onTagsChange(tags: string[]): void {
    this.tags.set(tags);
  }

  submit(): void {
    if (this.form.invalid || this.pending()) {
      this.form.markAllAsTouched();
      return;
    }

    const payload: CreatePostInput = {
      ...this.form.getRawValue(),
      tags: this.tags(),
      projectName: this.selectedProjectName(),
    };

    this.submitPost.emit(payload);
  }
}
