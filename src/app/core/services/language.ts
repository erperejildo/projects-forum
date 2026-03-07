import { inject, Injectable, signal } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root',
})
export class Language {
  readonly supportedLanguages = ['en', 'es', 'de', 'it', 'pt', 'fr'] as const;
  readonly currentLanguage = signal<(typeof this.supportedLanguages)[number]>('en');
  private readonly translate = inject(TranslateService);

  constructor() {
    const allLanguages = [...this.supportedLanguages];

    this.translate.addLangs(allLanguages);
    this.translate.setFallbackLang('en');

    const preferredLanguage = this.resolveInitialLanguage();
    this.use(preferredLanguage);
  }

  use(language: string): void {
    const safeLanguage = this.normalizeLanguage(language);
    this.currentLanguage.set(safeLanguage);
    this.translate.use(safeLanguage);
    this.persist(safeLanguage);
    this.syncHtmlLang(safeLanguage);
  }

  private resolveInitialLanguage(): (typeof this.supportedLanguages)[number] {
    const stored = this.readStoredLanguage();
    if (stored) {
      return this.normalizeLanguage(stored);
    }

    const browserLanguage =
      typeof navigator === 'undefined' ? 'en' : navigator.language.slice(0, 2).toLowerCase();

    return this.normalizeLanguage(browserLanguage);
  }

  private normalizeLanguage(language: string): (typeof this.supportedLanguages)[number] {
    const candidate = language.toLowerCase() as (typeof this.supportedLanguages)[number];
    return this.supportedLanguages.includes(candidate) ? candidate : 'en';
  }

  private persist(language: string): void {
    if (typeof localStorage === 'undefined') {
      return;
    }

    localStorage.setItem('forum_language', language);
  }

  private readStoredLanguage(): string | null {
    if (typeof localStorage === 'undefined') {
      return null;
    }

    return localStorage.getItem('forum_language');
  }

  private syncHtmlLang(language: string): void {
    if (typeof document === 'undefined') {
      return;
    }

    document.documentElement.lang = language;
  }
}
