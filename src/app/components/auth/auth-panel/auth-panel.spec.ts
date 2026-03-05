import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { provideTranslateService } from '@ngx-translate/core';

import { Auth } from '../../../core/services/auth';
import { AuthPanel } from './auth-panel';

describe('AuthPanel', () => {
  let component: AuthPanel;
  let fixture: ComponentFixture<AuthPanel>;

  const userSignal = signal(null);
  const authMock = {
    currentUser: userSignal,
    isAuthenticated: () => false,
    userLabel: () => '',
    signInWithGoogle: async () => undefined,
    signInWithEmailPassword: async () => undefined,
    registerWithEmailPassword: async () => undefined,
    logout: async () => undefined,
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuthPanel],
      providers: [
        provideTranslateService(),
        {
          provide: Auth,
          useValue: authMock,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AuthPanel);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
