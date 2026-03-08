import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { of } from 'rxjs';
import { ConfirmDialog, ConfirmDialogData } from './confirm-dialog';
// replicate the common ui testing providers inline to avoid import path issues
import { provideRouter } from '@angular/router';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import {
  provideTranslateLoader,
  provideTranslateService,
  TranslateNoOpLoader,
} from '@ngx-translate/core';

describe('ConfirmDialog', () => {
  let component: ConfirmDialog;
  let fixture: ComponentFixture<ConfirmDialog>;
  let dialogRef: Partial<MatDialogRef<ConfirmDialog>>;

  let closeCalls: unknown[];
  beforeEach(async () => {
    closeCalls = [];
    dialogRef = { close: (...args: unknown[]) => closeCalls.push(args) };

    await TestBed.configureTestingModule({
      imports: [ConfirmDialog],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: of(convertToParamMap({})),
            queryParamMap: of(convertToParamMap({})),
            snapshot: {
              paramMap: convertToParamMap({}),
              queryParamMap: convertToParamMap({}),
            },
          },
        },
        provideHttpClient(),
        provideTranslateService({
          loader: provideTranslateLoader(TranslateNoOpLoader),
          fallbackLang: 'en',
          lang: 'en',
        }),
        { provide: MatDialogRef, useValue: dialogRef },
        { provide: MAT_DIALOG_DATA, useValue: { message: 'test' } as ConfirmDialogData },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ConfirmDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('calls close(true) on confirm()', () => {
    component.confirm();
    expect(closeCalls).toEqual([[true]]);
  });

  it('calls close(false) on cancel()', () => {
    component.cancel();
    expect(closeCalls).toEqual([[false]]);
  });
});
