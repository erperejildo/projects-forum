import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideTranslateService } from '@ngx-translate/core';

import { PostList } from './post-list';

describe('PostList', () => {
  let component: PostList;
  let fixture: ComponentFixture<PostList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PostList],
      providers: [provideTranslateService()],
    }).compileComponents();

    fixture = TestBed.createComponent(PostList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
