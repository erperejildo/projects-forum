import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideTranslateService } from '@ngx-translate/core';

import { PostCard } from './post-card';

describe('PostCard', () => {
  let component: PostCard;
  let fixture: ComponentFixture<PostCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PostCard],
      providers: [provideTranslateService()],
    }).compileComponents();

    fixture = TestBed.createComponent(PostCard);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('post', {
      id: 'post-1',
      title: 'Test Post',
      message: 'Message',
      type: 'question',
      projectId: 'project-1',
      projectName: 'Project One',
      tags: ['help'],
      authorUid: 'uid-1',
      authorDisplayName: 'User',
      authorEmail: 'user@example.com',
      createdAt: new Date(),
      updatedAt: new Date(),
      likesCount: 0,
      repliesCount: 0,
      subscribersCount: 0,
    });
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
