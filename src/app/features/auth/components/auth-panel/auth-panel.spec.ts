import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Auth } from '../../../../core/services/auth';
import { createAuthMock, provideUiTesting } from '../../../../testing/testing-providers';

import { AuthPanel } from './auth-panel';

describe('AuthPanel', () => {
  let component: AuthPanel;
  let fixture: ComponentFixture<AuthPanel>;
  const authMock = createAuthMock();

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuthPanel],
      providers: [...provideUiTesting(), { provide: Auth, useValue: authMock }],
    }).compileComponents();

    fixture = TestBed.createComponent(AuthPanel);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
