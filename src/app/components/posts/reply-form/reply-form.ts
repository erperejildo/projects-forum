import { Component, inject, input, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';

import { CreateReplyInput } from '../../../core/models/post-reply';

@Component({
  selector: 'app-reply-form',
  imports: [ReactiveFormsModule, TranslatePipe],
  templateUrl: './reply-form.html',
  styleUrl: './reply-form.scss',
})
export class ReplyForm {
  private readonly formBuilder = inject(FormBuilder);

  readonly pending = input(false);
  readonly enabled = input(true);
  readonly submitReply = output<CreateReplyInput>();

  readonly form = this.formBuilder.nonNullable.group({
    message: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(1500)]],
  });

  submit(): void {
    if (!this.enabled() || this.pending() || this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitReply.emit(this.form.getRawValue());
    this.form.reset({ message: '' });
  }
}
