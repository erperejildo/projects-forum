import { TestBed } from '@angular/core/testing';
import { Auth } from './core/services/auth';
import { createAuthMock, provideUiTesting } from './testing/testing-providers';
import { App } from './app';

describe('App', () => {
  const authMock = createAuthMock();

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [...provideUiTesting(), { provide: Auth, useValue: authMock }],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render top navigation shell', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('app-top-nav')).toBeTruthy();
  });
});
