import { Component, inject } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

import { Language, SupportedLanguage } from '../../../core/services/language';

interface LanguageOption {
  code: SupportedLanguage;
  label: string;
}

@Component({
  selector: 'app-language-switcher',
  imports: [TranslatePipe],
  templateUrl: './language-switcher.html',
  styleUrl: './language-switcher.scss',
})
export class LanguageSwitcher {
  private readonly language = inject(Language);

  readonly options: LanguageOption[] = [
    { code: 'en', label: 'English' },
    { code: 'es', label: 'Espanol' },
    { code: 'de', label: 'Deutsch' },
    { code: 'it', label: 'Italiano' },
    { code: 'pt', label: 'Portugues' },
    { code: 'fr', label: 'Francais' },
  ];

  get selectedLanguage(): SupportedLanguage {
    return this.language.currentLanguage();
  }

  onLanguageChange(value: string): void {
    this.language.setLanguage(value);
  }
}
