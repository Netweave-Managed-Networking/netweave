import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { MemberEmailConfirmComponent } from './member-email-confirm.component';

describe('MemberEmailConfirmComponent', () => {
  let httpTesting: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MemberEmailConfirmComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { paramMap: convertToParamMap({ token: 'the-token' }) },
          },
        },
      ],
    }).compileComponents();

    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  async function confirmWith(
    response: object | null,
    options?: { status: number; statusText: string },
  ) {
    const fixture = TestBed.createComponent(MemberEmailConfirmComponent);
    fixture.detectChanges();

    const req = httpTesting.expectOne({
      method: 'POST',
      url: '/api/members/confirm-email',
    });
    expect(req.request.body).toEqual({ token: 'the-token' });
    req.flush(response, options);

    await fixture.whenStable();
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  it('shows a spinner while confirming', () => {
    const fixture = TestBed.createComponent(MemberEmailConfirmComponent);
    fixture.detectChanges();

    expect(
      (fixture.nativeElement as HTMLElement).querySelector(
        '.member-email-confirm__pending',
      ),
    ).toBeTruthy();
    httpTesting.expectOne('/api/members/confirm-email').flush(null);
  });

  it('confirms the token of the route and shows success', async () => {
    const element = await confirmWith({ success: true });

    expect(
      element.querySelector('.member-email-confirm__confirmed'),
    ).toBeTruthy();
  });

  it('shows that the link is invalid when the token is unknown or expired', async () => {
    const element = await confirmWith(null, {
      status: 400,
      statusText: 'Bad Request',
    });

    expect(
      element.querySelector('.member-email-confirm__invalid'),
    ).toBeTruthy();
  });

  it('shows that the email is taken when another member uses it by now', async () => {
    const element = await confirmWith(null, {
      status: 409,
      statusText: 'Conflict',
    });

    expect(element.querySelector('.member-email-confirm__taken')).toBeTruthy();
  });
});
