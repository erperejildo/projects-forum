import { Component, inject, output, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { Auth } from '../../../../core/services/auth';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';

type AuthMode = 'sign-in' | 'register';

@Component({
  selector: 'app-auth-panel',
  imports: [ReactiveFormsModule, TranslatePipe, MatFormFieldModule, MatInputModule, MatButtonModule, MatCardModule],
  templateUrl: './auth-panel.html',
  styleUrl: './auth-panel.scss',
})
export class AuthPanel {
  readonly closed = output<void>();
  readonly mode = signal<AuthMode>('sign-in');
  readonly loading = signal(false);
  readonly errorMessage = signal('');
  private readonly authService = inject(Auth);

  readonly form = new FormGroup({
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
    password: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(6)],
    }),
  });

  setMode(mode: AuthMode): void {
    this.mode.set(mode);
    this.errorMessage.set('');
  }

  async submit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');

    const email = this.form.controls.email.value;
    const password = this.form.controls.password.value;

    try {
      if (this.mode() === 'register') {
        await this.authService.signUp(email, password);
      } else {
        await this.authService.signIn(email, password);
      }

      this.closed.emit();
    } catch (error) {
      this.errorMessage.set(this.toReadableError(error));
    } finally {
      this.loading.set(false);
    }
  }

  async continueWithGoogle(): Promise<void> {
    this.loading.set(true);
    this.errorMessage.set('');

    try {
      await this.authService.signInWithGoogle();
      this.closed.emit();
    } catch (error) {
      this.errorMessage.set(this.toReadableError(error));
    } finally {
      this.loading.set(false);
    }
  }

  close(): void {
    this.closed.emit();
  }

  private toReadableError(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }

    return 'Unexpected authentication error';
  }
}
