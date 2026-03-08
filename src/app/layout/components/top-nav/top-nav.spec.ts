import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { Auth } from '../../../core/services/auth';
import { createAuthMock, provideUiTesting } from '../../../testing/testing-providers';
import { vi } from 'vitest';

import { TopNav } from './top-nav';

describe('TopNav', () => {
  let component: TopNav;
  let fixture: ComponentFixture<TopNav>;
  const authMock = createAuthMock();

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TopNav],
      providers: [...provideUiTesting(), { provide: Auth, useValue: authMock }],
    }).compileComponents();

    fixture = TestBed.createComponent(TopNav);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('sign out uses secondary style class', async () => {
    // Mock a Firebase User object with required properties
    const mockUser = {
      uid: 'u',
      displayName: 'User',
      email: 'u@example.com',
      emailVerified: true,
      isAnonymous: false,
      metadata: { creationTime: '', lastSignInTime: '' },
      providerData: [],
      refreshToken: '',
      tenantId: null,
      phoneNumber: null,
      photoURL: null,
      providerId: 'firebase',
      getIdToken: async () => '',
      getIdTokenResult: async () => ({
        claims: {},
        token: '',
        expirationTime: '',
        authTime: '',
        issuedAtTime: '',
        signInProvider: '',
        signInSecondFactor: '',
      }),
      reload: async () => {
        /* intentionally empty for test */
      },
      toJSON: () => ({}),
      delete: async () => {
        /* intentionally empty for test */
      },
    };
    // Set the user signal BEFORE component creation
    authMock.user.set(mockUser);
    fixture = TestBed.createComponent(TopNav);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();

    // Force another detectChanges in case signals update asynchronously
    fixture.detectChanges();
    await fixture.whenStable();

    const btn: HTMLElement | null = fixture.nativeElement.querySelector('button.btn-style2');
    expect(btn).toBeTruthy();
  });

  it('signOut redirects to the home route', async () => {
    const router = TestBed.inject(Router);
    const signOutSpy = vi.spyOn(component.authService, 'signOut').mockResolvedValue(undefined);
    const navigateSpy = vi.spyOn(router, 'navigateByUrl').mockResolvedValue(true);

    await component.signOut();

    expect(signOutSpy).toHaveBeenCalledOnce();
    expect(navigateSpy).toHaveBeenCalledWith('/', {
      replaceUrl: true,
    });
  });
});
