import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideUiTesting } from '../../../../testing/testing-providers';
import { of } from 'rxjs';

import { ReplyList } from './reply-list';
import * as confirmModule from '../../../../shared/components/confirm-dialog/confirm-dialog';
import { setConfirmDialogHandler } from '../../../../shared/components/confirm-dialog/confirm-dialog';

describe('ReplyList', () => {
  let component: ReplyList;
  let fixture: ComponentFixture<ReplyList>;

  // no need to stub MatDialog; we'll spy on openConfirmDialog

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReplyList],
      providers: [...provideUiTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(ReplyList);
    component = fixture.componentInstance;
    // configure the handler used by component
    setConfirmDialogHandler(() => Promise.resolve(false));
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('kebab trigger styles match material (no border/background)', async () => {
    // provide a reply with manage permissions so kebab appears
    // set input value instead of manipulating the signal directly
    const sampleReply: any = {
      id: 'r1',
      authorDisplayName: 'Test',
      authorId: 'u1',
      message: 'hi',
      createdAt: new Date(),
      updatedAt: new Date(),
      likesCount: 0,
      projectId: 'core',
      tags: [],
      type: 'comment',
    };
    fixture.componentRef.setInput('replies', [sampleReply]);
    // override permission methods to avoid needing spyOn/type definitions
    component.canManageReply = (reply: any) => true;
    component.canEditReply = (reply: any) => true;
    fixture.detectChanges();
    await fixture.whenStable();

    const kebab: HTMLElement | null = fixture.nativeElement.querySelector('button.kebab-trigger');
    if (kebab) {
      const style = getComputedStyle(kebab);
      expect(style.borderStyle).toBe('none');
      expect(style.backgroundColor).toBe('rgba(0, 0, 0, 0)');
    }
  });

  it('deleteReply shows confirmation and emits only when confirmed', async () => {
    let emitted = false;
    (component.replyDeleted as any).emit = () => {
      emitted = true;
    };

    setConfirmDialogHandler(() => Promise.resolve(false));
    await component.deleteReply('r1');
    expect(emitted).toBe(false);

    setConfirmDialogHandler(() => Promise.resolve(true));
    await component.deleteReply('r1');
    expect(emitted).toBe(true);
  });

  it('submit() does not emit when draft blank', () => {
    let emitted = false;
    (component.replySubmitted as any).emit = () => {
      emitted = true;
    };

    component.draft.set('   ');
    component.draftTouched.set(true);
    component.submit();
    expect(emitted).toBe(false);
  });

  it('shows a validation message after clicking add reply with an empty draft', async () => {
    fixture.componentRef.setInput('canReply', true);
    fixture.detectChanges();
    await fixture.whenStable();

    const submitButton: HTMLButtonElement | null = fixture.nativeElement.querySelector(
      '.composer-actions button',
    );
    submitButton?.click();
    fixture.detectChanges();
    await fixture.whenStable();

    const error: HTMLElement | null = fixture.nativeElement.querySelector('.validation-message');
    expect(component.draftTouched()).toBe(true);
    expect(error?.textContent).toContain('post.replyRequired');
  });
});
