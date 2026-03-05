import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideTranslateService } from '@ngx-translate/core';

import { HomePage } from './home-page';
import { Auth } from '../../core/services/auth';
import { Forum } from '../../core/services/forum';

describe('HomePage', () => {
  let component: HomePage;
  let fixture: ComponentFixture<HomePage>;

  const forumMock = {
    projects: signal([]),
    posts: signal([]),
    topTags: signal([]),
    votedPostIds: signal({}),
    loadingPosts: signal(false),
    applyFilters: <T>(posts: T[]) => posts,
    toggleVote: async () => true,
  };

  const authMock = {
    isAuthenticated: () => false,
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomePage],
      providers: [
        provideRouter([]),
        provideTranslateService(),
        {
          provide: Forum,
          useValue: forumMock,
        },
        {
          provide: Auth,
          useValue: authMock,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(HomePage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
