import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { signal } from '@angular/core';
import { provideTranslateService } from '@ngx-translate/core';

import { Auth } from '../../../core/services/auth';
import { Language } from '../../../core/services/language';
import { AppHeader } from './app-header';

describe('AppHeader', () => {
  let component: AppHeader;
  let fixture: ComponentFixture<AppHeader>;

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
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppHeader],
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

    fixture = TestBed.createComponent(AppHeader);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
