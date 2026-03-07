import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { authRequiredGuard } from './auth-required-guard';

describe('authRequiredGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) =>
    TestBed.runInInjectionContext(() => authRequiredGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
