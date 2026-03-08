import { ComponentFixture, TestBed } from '@angular/core/testing';
import { convertToParamMap, ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import { signal } from '@angular/core';
import { vi } from 'vitest';
import { Auth } from '../../../../core/services/auth';
import { Forum } from '../../../../core/services/forum';
import {
  createAuthMock,
  createForumMock,
  provideUiTesting,
} from '../../../../testing/testing-providers';

// ...existing code...
import { setConfirmDialogHandler } from '../../../../shared/components/confirm-dialog/confirm-dialog';

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
  // we'll spy on the helper function that opens the dialog

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
    setConfirmDialogHandler(() => Promise.resolve(false));
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

    const cancelBtn: HTMLElement | null = fixture.nativeElement.querySelector('button.btn-style2');
    const saveBtn: HTMLElement | null = fixture.nativeElement.querySelector('button.btn-style1');

    expect(cancelBtn).toBeTruthy();
    expect(saveBtn).toBeTruthy();
  });

  it('kebab trigger has no border and no custom background', () => {
    // the component has an actions section with a kebab trigger
    fixture.detectChanges();
    const kebab: HTMLElement | null = fixture.nativeElement.querySelector('button.kebab-trigger');
    if (kebab) {
      const style = getComputedStyle(kebab);
      expect(style.borderStyle).toBe('none');
      // background should be transparent so that ripple is the only effect
      expect(style.backgroundColor).toBe('rgba(0, 0, 0, 0)');
    }
  });

  it('deletePost respects confirmation dialog', async () => {
    let deletedCalled = false;
    const router = TestBed.inject(Router);
    const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);

    (forumMock as unknown as Forum).softDeletePost = async () => {
      deletedCalled = true;
    };

    // dialog returns false first
    setConfirmDialogHandler(() => Promise.resolve(false));
    await component.deletePost();
    expect(deletedCalled).toBe(false);
    expect(navigateSpy).not.toHaveBeenCalled();

    // now true
    setConfirmDialogHandler(() => Promise.resolve(true));
    await component.deletePost();
    expect(deletedCalled).toBe(true);
    expect(navigateSpy).toHaveBeenCalledWith(['/'], { replaceUrl: true });
  });
});
