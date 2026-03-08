import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideUiTesting } from '../../../../testing/testing-providers';

import { PostCard } from './post-card';

const createPost = (message: string) => ({
  id: 'p1',
  authorId: 'u1',
  authorDisplayName: 'Test User',
  projectId: 'core-platform',
  type: 'question' as const,
  message,
  tags: ['help'],
  likesCount: 0,
  replyCount: 0,
  createdAt: new Date(),
  updatedAt: new Date(),
});

describe('PostCard', () => {
  let component: PostCard;
  let fixture: ComponentFixture<PostCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PostCard],
      providers: [...provideUiTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(PostCard);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('post', createPost('How does this work?'));
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('shows the full message by default', () => {
    const message = fixture.nativeElement.querySelector('.message')?.textContent?.trim();

    expect(message).toBe('How does this work?');
  });

  it('truncates long messages when a preview length is provided', async () => {
    fixture.componentRef.setInput(
      'post',
      createPost('This is a long post body that should stop before the cutoff so the home feed stays compact for readers.'),
    );
    fixture.componentRef.setInput('messagePreviewLength', 52);
    fixture.detectChanges();
    await fixture.whenStable();

    const message = fixture.nativeElement.querySelector('.message')?.textContent?.trim();

    expect(message).toBe('This is a long post body that should stop before...');
  });
});
