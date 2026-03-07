import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Auth } from '../../../../core/services/auth';
import { Forum } from '../../../../core/services/forum';
import {
  createAuthMock,
  createForumMock,
  provideUiTesting,
} from '../../../../testing/testing-providers';

import { HomePage } from './home-page';

describe('HomePage', () => {
  let component: HomePage;
  let fixture: ComponentFixture<HomePage>;
  const authMock = createAuthMock();
  const forumMock = createForumMock();

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomePage],
      providers: [
        ...provideUiTesting(),
        { provide: Auth, useValue: authMock },
        { provide: Forum, useValue: forumMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(HomePage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
