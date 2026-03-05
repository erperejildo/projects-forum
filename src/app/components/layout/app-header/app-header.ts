import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';

import { LanguageSwitcher } from '../../common/language-switcher/language-switcher';
import { AuthPanel } from '../../auth/auth-panel/auth-panel';
import { Auth } from '../../../core/services/auth';

@Component({
  selector: 'app-app-header',
  imports: [RouterLink, TranslatePipe, LanguageSwitcher, AuthPanel],
  templateUrl: './app-header.html',
  styleUrl: './app-header.scss',
})
export class AppHeader {
  private readonly auth = inject(Auth);

  readonly isAuthenticated = this.auth.isAuthenticated;
}
