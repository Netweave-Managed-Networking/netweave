import { HttpClient, provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { UserEmailWhitelistDTO } from '@netweave/api-types';
import { of } from 'rxjs';
import { UserInvitationDeleteComponent } from './user-invitation-delete.component';

describe('UserInvitationDeleteComponent', () => {
  let http: HttpClient;
  const mockToDelete = {
    id: 1,
    emailOrDomain: 'to-delete@example.com',
  } as UserEmailWhitelistDTO;

  beforeEach(async () => {
    // JSDOM does not support dialog APIs
    HTMLDialogElement.prototype.showModal = vi.fn();
    HTMLDialogElement.prototype.close = vi.fn();

    await TestBed.configureTestingModule({
      imports: [UserInvitationDeleteComponent],
      providers: [provideHttpClient()],
    }).compileComponents();

    http = TestBed.inject(HttpClient);
  });

  function create() {
    const fixture = TestBed.createComponent(UserInvitationDeleteComponent);

    fixture.componentRef.setInput('toDelete', mockToDelete);
    fixture.detectChanges();
    return fixture;
  }

  it('opens modal via button click (mocked dialog API)', () => {
    const fixture = create();

    const dialog: HTMLDialogElement = fixture.nativeElement.querySelector(
      '.user-invitation-delete__modal',
    );
    const showModalSpy = vi.spyOn(dialog, 'showModal');

    const button = fixture.debugElement.query(
      By.css('.user-invitation-delete__open'),
    );

    button.nativeElement.click();

    expect(showModalSpy).toHaveBeenCalledTimes(1);
  });

  it('shows correct item in modal', () => {
    const fixture = create();

    const modalWarnText = fixture.nativeElement.querySelector(
      '.user-invitation-delete__modal p strong',
    );

    const button = fixture.debugElement.query(
      By.css('.user-invitation-delete__open'),
    );

    button.nativeElement.click();

    fixture.detectChanges();

    expect(modalWarnText.textContent).toContain(mockToDelete.emailOrDomain);
  });

  it('submits form, calls API, emits entity, closes modal', () => {
    const fixture = create();
    const component = fixture.componentInstance;

    const dialog = fixture.nativeElement.querySelector(
      '.user-invitation-delete__modal',
    );
    const httpSpy = vi.spyOn(http, 'delete').mockReturnValue(of(true));
    const emitSpy = vi.spyOn(component.deleted, 'emit');
    const closeSpy = vi.spyOn(dialog, 'close');

    const deleteBtn = fixture.nativeElement.querySelector(
      '.user-invitation-delete__confirm',
    );
    deleteBtn.click();
    fixture.detectChanges();

    expect(httpSpy).toHaveBeenCalled();
    expect(emitSpy).toHaveBeenCalled();
    expect(closeSpy).toHaveBeenCalled();
  });
});
