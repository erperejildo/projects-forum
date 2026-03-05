import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideTranslateService } from '@ngx-translate/core';

import { ReplyForm } from './reply-form';

describe('ReplyForm', () => {
  let component: ReplyForm;
  let fixture: ComponentFixture<ReplyForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReplyForm],
      providers: [provideTranslateService()],
    }).compileComponents();

    fixture = TestBed.createComponent(ReplyForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
