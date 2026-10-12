import { TestBed } from '@angular/core/testing';
import {
  ActivatedRoute,
  convertToParamMap,
  provideRouter,
  Router,
} from '@angular/router';
import { UserAuthDTO, UserDTO } from '@netweave/api-types';
import { of, throwError } from 'rxjs';
import { AuthService } from '../../services/auth/auth.service';
import { VerifyEmailComponent } from './verify-email.component';

const mockUserAuthDTO: UserAuthDTO = {
  sub: 1,
  user: { email: 'nb@example.com', role: 'viewer' } as UserDTO,
};

describe('VerifyEmailComponent', () => {
  let auth: {
    verifyEmail: ReturnType<typeof vi.fn>;
    getMe: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    auth = {
      verifyEmail: vi.fn().mockReturnValue(of(mockUserAuthDTO)),
      getMe: vi.fn().mockReturnValue(of('unauthenticated')),
    };

    await TestBed.configureTestingModule({
      imports: [VerifyEmailComponent],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: auth },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { paramMap: convertToParamMap({ token: 'the-token' }) },
          },
        },
      ],
    }).compileComponents();
  });

  async function create() {
    const fixture = TestBed.createComponent(VerifyEmailComponent);
    fixture.detectChanges();
    // ngOnInit chains several promises that whenStable does not track
    await new Promise((resolve) => setTimeout(resolve));
    fixture.detectChanges();
    return fixture;
  }

  it('verifies the token and navigates into the app', async () => {
    const navigate = vi
      .spyOn(TestBed.inject(Router), 'navigate')
      .mockResolvedValue(true);

    await create();

    expect(auth.verifyEmail).toHaveBeenCalledWith('the-token');
    expect(navigate).toHaveBeenCalledWith(['/']);
  });

  it('offers to register again when the link is invalid or expired', async () => {
    auth.verifyEmail.mockReturnValue(throwError(() => new Error('invalid')));

    const fixture = await create();

    expect(
      fixture.nativeElement.querySelector('.verify-email__invalid'),
    ).toBeTruthy();
    expect(
      fixture.nativeElement
        .querySelector('.verify-email__register')
        .getAttribute('href'),
    ).toBe('/register');
  });

  it('navigates into the app when an already used link is opened while logged in', async () => {
    auth.verifyEmail.mockReturnValue(throwError(() => new Error('used')));
    auth.getMe.mockReturnValue(of(mockUserAuthDTO));
    const navigate = vi
      .spyOn(TestBed.inject(Router), 'navigate')
      .mockResolvedValue(true);

    await create();

    expect(navigate).toHaveBeenCalledWith(['/']);
  });
});
