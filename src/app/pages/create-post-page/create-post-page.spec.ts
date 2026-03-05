import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideTranslateService } from '@ngx-translate/core';

import { CreatePostPage } from './create-post-page';
import { Forum } from '../../core/services/forum';

describe('CreatePostPage', () => {
  let component: CreatePostPage;
  let fixture: ComponentFixture<CreatePostPage>;

  const forumMock = {
    projects: signal([]),
    loadingProjects: signal(false),
    createPost: async () => 'post-1',
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreatePostPage],
      providers: [
        provideRouter([]),
        provideTranslateService(),
        {
          provide: Forum,
          useValue: forumMock,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CreatePostPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
