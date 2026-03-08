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

  it('should require confirmPassword only when registering', () => {
    // initial mode is sign-in
    expect(component.mode()).toBe('sign-in');
    expect(component.form.controls.confirmPassword.validator).toBeNull();

    component.setMode('register');
    fixture.detectChanges();

    expect(component.mode()).toBe('register');
    expect(component.form.controls.confirmPassword.validator).not.toBeNull();
  });

  it('should flag mismatch when passwords differ in register mode', () => {
    component.setMode('register');
    fixture.detectChanges();

    component.form.controls.password.setValue('abc123');
    component.form.controls.confirmPassword.setValue('xyz456');
    component.form.markAllAsTouched();

    expect(component.form.valid).toBeFalsy();
    expect(component.form.errors?.['passwordsMismatch']).toBeTruthy();
  });

  it('should call signUp when registering with matching passwords', async () => {
    component.setMode('register');
    fixture.detectChanges();
    const spy = vi.spyOn(authMock, 'signUp');

    component.form.controls.email.setValue('foo@example.com');
    component.form.controls.password.setValue('password1');
    component.form.controls.confirmPassword.setValue('password1');

    await component.submit();
    expect(spy).toHaveBeenCalledWith('foo@example.com', 'password1');
    // confirm should be cleared after successful signup
    expect(component.form.controls.confirmPassword.value).toBe('');
  });

  it('should reset confirmPassword when switching back to sign-in', () => {
    component.setMode('register');
    component.form.controls.confirmPassword.setValue('foo');
    component.setMode('sign-in');
    expect(component.form.controls.confirmPassword.value).toBe('');
  });
});
