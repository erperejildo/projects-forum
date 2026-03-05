import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideTranslateService } from '@ngx-translate/core';

import { ReplyList } from './reply-list';

describe('ReplyList', () => {
  let component: ReplyList;
  let fixture: ComponentFixture<ReplyList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReplyList],
      providers: [provideTranslateService()],
    }).compileComponents();

    fixture = TestBed.createComponent(ReplyList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
