import { Component, inject, output, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators, AbstractControl } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { Auth } from '../../../../core/services/auth';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

type AuthMode = 'sign-in' | 'register';

@Component({
  selector: 'app-auth-panel',
  imports: [ReactiveFormsModule, TranslatePipe, MatFormFieldModule, MatInputModule, MatButtonModule, MatCardModule, MatIconModule],
  templateUrl: './auth-panel.html',
  styleUrl: './auth-panel.scss',
})
export class AuthPanel {
  readonly closed = output<void>();
  readonly mode = signal<AuthMode>('sign-in');
  readonly loading = signal(false);
  readonly errorMessage = signal('');
  private readonly authService = inject(Auth);

  readonly form = new FormGroup(
    {
      email: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, Validators.email],
      }),
      password: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, Validators.minLength(6)],
      }),
      // keep the control present at all times so template bindings don't need defensive checks
      confirmPassword: new FormControl('', {
        nonNullable: true,
        validators: [],
      }),
    },
    // group-level validator applied conditionally inside updateFormForMode
    this.passwordsMatchValidator.bind(this)
  );

  setMode(mode: AuthMode): void {
    this.mode.set(mode);
    this.errorMessage.set('');
    this.updateFormForMode();
  }

  /**
   * Add/remove validators when switching between sign-in and register modes.
   */
  private updateFormForMode(): void {
    if (this.mode() === 'register') {
      // confirm password becomes required
      this.form.controls.confirmPassword.setValidators([Validators.required]);
    } else {
      this.form.controls.confirmPassword.setValidators([]);
      // clear the field so stale value can't cause confusion
      this.form.controls.confirmPassword.reset('');
    }
    this.form.controls.confirmPassword.updateValueAndValidity();

    // the group-level validator already checks mismatch only when in register
    this.form.setValidators(this.mode() === 'register' ? this.passwordsMatchValidator.bind(this) : null);
    this.form.updateValueAndValidity();
  }

  private passwordsMatchValidator(control: AbstractControl) {
    if (this.mode() !== 'register') {
      return null;
    }
    const group = control as FormGroup;
    const pass = group.controls['password']?.value;
    const confirm = group.controls['confirmPassword']?.value;
    return pass && confirm && pass !== confirm ? { passwordsMismatch: true } : null;
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
        // clean up confirm password after successful registration so form can be reused
        this.form.controls.confirmPassword.reset('');
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

  constructor() {
    // ensure validators on initial mode
    this.updateFormForMode();
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
