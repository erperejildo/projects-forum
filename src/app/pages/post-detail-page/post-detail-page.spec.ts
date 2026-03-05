import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { provideTranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';

import { PostDetailPage } from './post-detail-page';
import { Auth } from '../../core/services/auth';
import { Forum } from '../../core/services/forum';

describe('PostDetailPage', () => {
  let component: PostDetailPage;
  let fixture: ComponentFixture<PostDetailPage>;

  const forumMock = {
    votedPostIds: signal({}),
    getPostById: async () => ({
      id: 'post-1',
      title: 'Example title',
      message: 'Example message',
      type: 'question',
      projectId: 'project-1',
      projectName: 'Project One',
      tags: ['angular'],
      authorUid: 'u1',
      authorDisplayName: 'User',
      authorEmail: 'user@example.com',
      createdAt: new Date(),
      updatedAt: new Date(),
      likesCount: 0,
      repliesCount: 0,
      subscribersCount: 0,
    }),
    listenToReplies: (_postId: string, callback: (replies: unknown[]) => void) => {
      callback([]);
      return () => undefined;
    },
    listenToSubscriptionStatus: (
      _postId: string,
      _userId: string,
      callback: (state: boolean) => void,
    ) => {
      callback(false);
      return () => undefined;
    },
    toggleVote: async () => true,
    toggleSubscription: async () => true,
    addReply: async () => undefined,
  };

  const authMock = {
    currentUser: signal(null),
    isAuthenticated: () => false,
  };

  const activatedRouteMock = {
    paramMap: of(convertToParamMap({ postId: 'post-1' })),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PostDetailPage],
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
        {
          provide: ActivatedRoute,
          useValue: activatedRouteMock,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PostDetailPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
