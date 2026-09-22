import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { InvitationTokenDTO } from '@netweave/api-types';
import { MemberQuestionsComponent } from './member-questions.component';

describe('MemberQuestionsComponent', () => {
  let component: MemberQuestionsComponent;
  let fixture: ComponentFixture<MemberQuestionsComponent>;
  let httpTesting: HttpTestingController;

  const configure = async (token: string) => {
    await TestBed.configureTestingModule({
      imports: [MemberQuestionsComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { paramMap: convertToParamMap({ token }) },
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MemberQuestionsComponent);
    component = fixture.componentInstance;
    httpTesting = TestBed.inject(HttpTestingController);
  };

  afterEach(() => {
    httpTesting.verify();
  });

  it('should create', async () => {
    await configure('some-token');
    expect(component).toBeTruthy();
  });

  it('requests the invitation for the token from the route and shows the email in a disabled field', async () => {
    await configure('some-token');
    fixture.detectChanges();

    const req = httpTesting.expectOne({
      method: 'GET',
      url: '/api/invitations/by-token/some-token',
    });

    const mockInvitation: InvitationTokenDTO = { email: 'nt@example.com' };
    req.flush(mockInvitation);

    await fixture.whenStable();

    const input = (fixture.nativeElement as HTMLElement).querySelector(
      'input#email',
    ) as HTMLInputElement;

    expect(input.value).toBe(mockInvitation.email);
    expect(input.disabled).toBe(true);
  });

  it('shows an empty, disabled field when the token is invalid', async () => {
    await configure('invalid-token');
    fixture.detectChanges();

    const req = httpTesting.expectOne({
      method: 'GET',
      url: '/api/invitations/by-token/invalid-token',
    });
    req.flush(null, { status: 404, statusText: 'Not Found' });

    await fixture.whenStable();

    const input = (fixture.nativeElement as HTMLElement).querySelector(
      'input#email',
    ) as HTMLInputElement;

    expect(input.value).toBe('');
    expect(input.disabled).toBe(true);
  });
});
