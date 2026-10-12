import { HttpClient, provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { UserDTO, UserEmailWhitelistCreatedDTO } from '@netweave/api-types';
import { of } from 'rxjs';
import { ManagerInvitationCreateComponent } from '../manager-invitation-create/manager-invitation-create.component';
import { ManagerInvitationsComponent } from './manager-invitations.component';

const admin: UserDTO = {
  id: 1,
  email: 'admin@example.de',
  role: 'admin',
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  updatedAt: new Date('2026-01-01T00:00:00.000Z'),
};

function created(
  emailOrDomain: string,
  invitationMailSent: boolean | null,
): UserEmailWhitelistCreatedDTO {
  return {
    id: 10,
    emailOrDomain,
    role: 'viewer',
    createdBy: admin,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    invitationMailSent,
  };
}

describe('ManagerInvitationsComponent', () => {
  let http: HttpClient;

  beforeEach(async () => {
    // JSDOM does not support dialog APIs
    HTMLDialogElement.prototype.showModal = vi.fn();
    HTMLDialogElement.prototype.close = vi.fn();

    await TestBed.configureTestingModule({
      imports: [ManagerInvitationsComponent],
      providers: [provideHttpClient()],
    }).compileComponents();

    http = TestBed.inject(HttpClient);
  });

  async function create() {
    vi.spyOn(http, 'get').mockReturnValue(of([]));

    const fixture = TestBed.createComponent(ManagerInvitationsComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    return fixture;
  }

  function emitCreated(
    fixture: Awaited<ReturnType<typeof create>>,
    entity: UserEmailWhitelistCreatedDTO,
  ) {
    fixture.debugElement
      .query(By.directive(ManagerInvitationCreateComponent))
      .componentInstance.entity.emit(entity);
    fixture.detectChanges();
  }

  function toast(fixture: Awaited<ReturnType<typeof create>>) {
    return fixture.nativeElement.querySelector(
      '.manager-invitations__toast',
    ) as HTMLElement | null;
  }

  it('adds a created entry to the list', async () => {
    const fixture = await create();

    emitCreated(fixture, created('new@example.com', true));

    expect(fixture.nativeElement.textContent).toContain('new@example.com');
  });

  it('shows a success toast when the invitation mail was sent', async () => {
    const fixture = await create();

    emitCreated(fixture, created('new@example.com', true));

    expect(toast(fixture)?.querySelector('.alert-success')).toBeTruthy();
    expect(toast(fixture)?.textContent).toContain('new@example.com');
  });

  it('shows an error toast when the invitation mail failed', async () => {
    const fixture = await create();

    emitCreated(fixture, created('new@example.com', false));

    expect(toast(fixture)?.querySelector('.alert-error')).toBeTruthy();
    expect(toast(fixture)?.textContent).toContain('new@example.com');
  });

  it('shows no toast for domain entries', async () => {
    const fixture = await create();

    emitCreated(fixture, created('@example.com', null));

    expect(toast(fixture)).toBeNull();
  });
});
