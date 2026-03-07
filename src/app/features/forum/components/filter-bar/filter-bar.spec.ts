import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideUiTesting } from '../../../../testing/testing-providers';

import { FilterBar } from './filter-bar';

describe('FilterBar', () => {
  let component: FilterBar;
  let fixture: ComponentFixture<FilterBar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FilterBar],
      providers: [...provideUiTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(FilterBar);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
