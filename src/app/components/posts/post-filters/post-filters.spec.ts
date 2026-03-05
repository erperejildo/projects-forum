import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideTranslateService } from '@ngx-translate/core';

import { PostFilters } from './post-filters';

describe('PostFilters', () => {
  let component: PostFilters;
  let fixture: ComponentFixture<PostFilters>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PostFilters],
      providers: [provideTranslateService()],
    }).compileComponents();

    fixture = TestBed.createComponent(PostFilters);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
