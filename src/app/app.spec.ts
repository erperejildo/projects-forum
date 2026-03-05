import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { signal } from '@angular/core';
import { provideTranslateService } from '@ngx-translate/core';

import { App } from './app';
import { Auth } from './core/services/auth';
import { Language } from './core/services/language';

describe('App', () => {
  const authMock = {
    currentUser: signal(null),
    isAuthenticated: () => false,
    userLabel: () => '',
    signInWithGoogle: async () => undefined,
    signInWithEmailPassword: async () => undefined,
    registerWithEmailPassword: async () => undefined,
    logout: async () => undefined,
  };

  const languageMock = {
    currentLanguage: () => 'en',
    setLanguage: () => undefined,
    initialize: () => undefined,
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideRouter([]),
        provideTranslateService(),
        {
          provide: Auth,
          useValue: authMock,
        },
        {
          provide: Language,
          useValue: languageMock,
        },
      ],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render app shell', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.app-shell')).toBeTruthy();
  });
});
