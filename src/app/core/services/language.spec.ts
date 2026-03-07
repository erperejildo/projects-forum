import { TestBed } from '@angular/core/testing';
import { provideUiTesting } from '../../testing/testing-providers';

import { Language } from './language';

describe('Language', () => {
  let service: Language;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [...provideUiTesting()] });
    service = TestBed.inject(Language);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
