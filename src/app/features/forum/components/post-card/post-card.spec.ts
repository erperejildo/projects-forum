import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideUiTesting } from '../../../../testing/testing-providers';

import { PostCard } from './post-card';

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
    fixture.componentRef.setInput('post', {
      id: 'p1',
      authorId: 'u1',
      authorDisplayName: 'Test User',
      projectId: 'core-platform',
      type: 'question',
      message: 'How does this work?',
      tags: ['help'],
      likesCount: 0,
      replyCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
