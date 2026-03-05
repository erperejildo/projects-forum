import { DOCUMENT } from '@angular/common';
import { inject, Injectable, signal } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

export type SupportedLanguage = 'en' | 'es' | 'de' | 'it' | 'pt' | 'fr';

const LANGUAGE_STORAGE_KEY = 'forum_language';

@Injectable({
  providedIn: 'root',
})
export class Language {
  private readonly document = inject(DOCUMENT);
  private readonly translate = inject(TranslateService);

  readonly supportedLanguages: SupportedLanguage[] = ['en', 'es', 'de', 'it', 'pt', 'fr'];
  readonly currentLanguage = signal<SupportedLanguage>('en');

  private initialized = false;

  initialize(): void {
    if (this.initialized) {
      return;
    }

    this.initialized = true;
    this.translate.addLangs(this.supportedLanguages);
    this.translate.setFallbackLang('en').subscribe();

    const storedLanguage = this.readStoredLanguage();
    const browserLanguage = this.translate.getBrowserLang();
    const language = this.normalizeLanguage(storedLanguage || browserLanguage);

    this.applyLanguage(language);
  }

  setLanguage(language: string): void {
    this.applyLanguage(this.normalizeLanguage(language));
  }

  private applyLanguage(language: SupportedLanguage): void {
    this.translate.use(language).subscribe({
      next: () => {
        this.currentLanguage.set(language);
        this.document.documentElement.lang = language;
        localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
      },
      error: () => {
        this.currentLanguage.set('en');
        this.document.documentElement.lang = 'en';
      },
    });
  }

  private readStoredLanguage(): string | null {
    try {
      return localStorage.getItem(LANGUAGE_STORAGE_KEY);
    } catch {
      return null;
    }
  }

  private normalizeLanguage(language: string | null | undefined): SupportedLanguage {
    if (!language) {
      return 'en';
    }

    const baseLanguage = language.toLowerCase().split('-')[0] as SupportedLanguage;

    if (this.supportedLanguages.includes(baseLanguage)) {
      return baseLanguage;
    }

    return 'en';
  }
}
