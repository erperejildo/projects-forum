import { Component, inject, signal } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { filter, startWith } from 'rxjs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { AuthPanel } from '../../../features/auth/components/auth-panel/auth-panel';
import { LanguageSwitcher } from '../../../shared/components/language-switcher/language-switcher';
import { Auth } from '../../../core/services/auth';

@Component({
  selector: 'app-top-nav',
  imports: [
    RouterLink,
    RouterLinkActive,
    TranslatePipe,
    LanguageSwitcher,
    AuthPanel,
    MatToolbarModule,
    MatButtonModule,
  ],
  templateUrl: './top-nav.html',
  styleUrl: './top-nav.scss',
})
export class TopNav {
  readonly authService = inject(Auth);
  readonly showAuthPanel = signal(false);

  private readonly router = inject(Router);

  constructor() {
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        startWith(null),
      )
      .subscribe(() => {
        const tree = this.router.parseUrl(this.router.url);
        const shouldOpenAuth = tree.queryParams['auth'] === 'open';

        // Only show auth panel if user is NOT authenticated
        if (!shouldOpenAuth || this.authService.isAuthenticated()) {
          // Remove the query param if present
          if (shouldOpenAuth) {
            this.router.navigate([], {
              queryParams: { auth: null },
              queryParamsHandling: 'merge',
              replaceUrl: true,
            });
          }
          return;
        }

        this.showAuthPanel.set(true);
        this.router.navigate([], {
          queryParams: { auth: null },
          queryParamsHandling: 'merge',
          replaceUrl: true,
        });
      });
  }

  toggleAuthPanel(): void {
    this.showAuthPanel.update((previous) => !previous);
  }

  closeAuthPanel(): void {
    this.showAuthPanel.set(false);
  }

  async signOut(): Promise<void> {
    await this.authService.signOut();
  }
}
