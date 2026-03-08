import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideUiTesting } from '../../../testing/testing-providers';

import { LikeButton } from './like-button';

describe('LikeButton', () => {
  let component: LikeButton;
  let fixture: ComponentFixture<LikeButton>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LikeButton],
      providers: [...provideUiTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(LikeButton);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('renders count to the left of the icon', () => {
    fixture.detectChanges();
    const btn: HTMLElement = fixture.nativeElement.querySelector('button')!;
    // there should be a span with class like-count inside the button
    const countSpan: HTMLElement | null = btn.querySelector('span.like-count');
    expect(countSpan).toBeTruthy();
  });

  it('applies "is-liked" class when liked input is true', async () => {
    fixture.componentRef.setInput('likesCount', 5);
    fixture.componentRef.setInput('liked', true);
    fixture.detectChanges();
    await fixture.whenStable();

    const btn: HTMLElement = fixture.nativeElement.querySelector('button')!;
    expect(btn.classList.contains('is-liked')).toBe(true);
  });

  it('has no border style', () => {
    fixture.detectChanges();
    const btn: HTMLElement = fixture.nativeElement.querySelector('button')!;
    const style = getComputedStyle(btn);
    expect(style.borderStyle).toBe('none');
  });
});
