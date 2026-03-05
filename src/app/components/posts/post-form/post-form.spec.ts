import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideTranslateService } from '@ngx-translate/core';

import { PostForm } from './post-form';

describe('PostForm', () => {
  let component: PostForm;
  let fixture: ComponentFixture<PostForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PostForm],
      providers: [provideTranslateService()],
    }).compileComponents();

    fixture = TestBed.createComponent(PostForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
