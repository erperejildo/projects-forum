import { Component, inject } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { Language } from '../../../core/services/language';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-language-switcher',
  imports: [TranslatePipe, MatFormFieldModule, MatSelectModule],
  templateUrl: './language-switcher.html',
  styleUrl: './language-switcher.scss',
})
export class LanguageSwitcher {
  readonly labels: Record<string, string> = {
    en: 'English',
    es: 'Español',
    de: 'Deutsch',
    it: 'Italiano',
    pt: 'Português',
    fr: 'Français',
  };

  readonly languageService = inject(Language);

  onLanguageChange(language: string): void {
    this.languageService.use(language);
  }
}
