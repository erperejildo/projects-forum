import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideUiTesting } from '../../../../testing/testing-providers';

import { TagInput } from './tag-input';

describe('TagInput', () => {
  let component: TagInput;
  let fixture: ComponentFixture<TagInput>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TagInput],
      providers: [...provideUiTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(TagInput);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('does not render an explicit Add button', () => {
    fixture.detectChanges();
    const button = fixture.nativeElement.querySelector('.entry-row');
    expect(button).toBeNull();
    // also ensure there is no translated "Add" text present
    expect(fixture.nativeElement.textContent).not.toContain('common.add');
  });

  it('commits draft when Enter is pressed', () => {
    const spy = vi.fn();
    component.tagsChange.subscribe(spy);

    component.draft.set('foo');
    const event = new KeyboardEvent('keydown', { key: 'Enter' });
    component.onDraftKeyDown(event);

    expect(spy).toHaveBeenCalledWith(['foo']);
  });
});
