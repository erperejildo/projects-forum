import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';

import { Auth } from '../../../core/services/auth';

@Component({
  selector: 'app-auth-panel',
  imports: [FormsModule, TranslatePipe],
  templateUrl: './auth-panel.html',
  styleUrl: './auth-panel.scss',
})
export class AuthPanel {
  private readonly auth = inject(Auth);

  readonly user = this.auth.currentUser;
  readonly isAuthenticated = this.auth.isAuthenticated;
  readonly userLabel = this.auth.userLabel;

  readonly isPanelOpen = signal(false);
  readonly isRegisterMode = signal(false);
  readonly isBusy = signal(false);
  readonly errorMessage = signal('');

  email = '';
  password = '';

  togglePanel(): void {
    this.errorMessage.set('');
    this.isPanelOpen.update((isOpen) => !isOpen);
  }

  switchMode(): void {
    this.errorMessage.set('');
    this.isRegisterMode.update((mode) => !mode);
  }

  async loginWithGoogle(): Promise<void> {
    await this.runWithBusyState(async () => {
      await this.auth.signInWithGoogle();
      this.closePanel();
    });
  }

  async submitEmailPassword(): Promise<void> {
    await this.runWithBusyState(async () => {
      if (this.isRegisterMode()) {
        await this.auth.registerWithEmailPassword(this.email, this.password);
      } else {
        await this.auth.signInWithEmailPassword(this.email, this.password);
      }

      this.closePanel();
    });
  }

  async logout(): Promise<void> {
    await this.runWithBusyState(async () => {
      await this.auth.logout();
      this.closePanel();
    });
  }

  private closePanel(): void {
    this.email = '';
    this.password = '';
    this.errorMessage.set('');
    this.isPanelOpen.set(false);
    this.isRegisterMode.set(false);
  }

  private async runWithBusyState(action: () => Promise<void>): Promise<void> {
    this.isBusy.set(true);
    this.errorMessage.set('');

    try {
      await action();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Authentication failed.';
      this.errorMessage.set(message);
    } finally {
      this.isBusy.set(false);
    }
  }
}
