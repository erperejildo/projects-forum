import { ComponentFixture, TestBed } from '@angular/core/testing';
import { convertToParamMap, ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { signal } from '@angular/core';
import { Auth } from '../../../../core/services/auth';
import { Forum } from '../../../../core/services/forum';
import {
  createAuthMock,
  createForumMock,
  provideUiTesting,
} from '../../../../testing/testing-providers';

import { PostDetailPage } from './post-detail-page';

describe('PostDetailPage', () => {
  let component: PostDetailPage;
  let fixture: ComponentFixture<PostDetailPage>;
  const authMock = createAuthMock();
  authMock.user = signal({ uid: 'u1', email: 'test@example.com', displayName: 'Tester' });
  const forumMock = createForumMock();
  forumMock.watchPost = () =>
    of({
      id: 'p1',
      authorId: 'u2',
      authorDisplayName: 'Author',
      projectId: 'core-platform',
      type: 'question',
      message: 'Sample question',
      tags: ['sample'],
      likesCount: 2,
      replyCount: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PostDetailPage],
      providers: [
        ...provideUiTesting(),
        { provide: Auth, useValue: authMock },
        { provide: Forum, useValue: forumMock },
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: of(convertToParamMap({ id: 'p1' })),
          },
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

  it('edit controls use the correct style classes', async () => {
    // set editing state directly so buttons are visible
    component.editingPost.set(true);
    fixture.detectChanges();
    await fixture.whenStable();

    const cancelBtn: HTMLElement | null = fixture.nativeElement.querySelector(
      'button.btn-style2'
    );
    const saveBtn: HTMLElement | null = fixture.nativeElement.querySelector(
      'button.btn-style1'
    );

    expect(cancelBtn).toBeTruthy();
    expect(saveBtn).toBeTruthy();
  });
});
