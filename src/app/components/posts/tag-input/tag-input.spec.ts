import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideTranslateService } from '@ngx-translate/core';

import { TagInput } from './tag-input';

describe('TagInput', () => {
  let component: TagInput;
  let fixture: ComponentFixture<TagInput>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TagInput],
      providers: [provideTranslateService()],
    }).compileComponents();

    fixture = TestBed.createComponent(TagInput);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
