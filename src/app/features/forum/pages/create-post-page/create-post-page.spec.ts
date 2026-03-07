import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { Auth } from '../../../../core/services/auth';
import { Forum } from '../../../../core/services/forum';
import {
  createAuthMock,
  createForumMock,
  provideUiTesting,
} from '../../../../testing/testing-providers';

import { CreatePostPage } from './create-post-page';

describe('CreatePostPage', () => {
  let component: CreatePostPage;
  let fixture: ComponentFixture<CreatePostPage>;
  const authMock = createAuthMock();
  authMock.user = signal({ uid: 'u1', email: 'test@example.com', displayName: 'Tester' });
  const forumMock = createForumMock();

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreatePostPage],
      providers: [
        ...provideUiTesting(),
        { provide: Auth, useValue: authMock },
        { provide: Forum, useValue: forumMock },
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
