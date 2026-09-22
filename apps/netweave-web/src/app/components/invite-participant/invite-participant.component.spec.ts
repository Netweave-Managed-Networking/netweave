import { HttpClient, provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { of, throwError } from 'rxjs';
import { InviteParticipantComponent } from './invite-participant.component';

describe('InviteParticipantComponent', () => {
  let http: HttpClient;

  beforeEach(async () => {
    // JSDOM does not support dialog APIs
    HTMLDialogElement.prototype.showModal = vi.fn();
    HTMLDialogElement.prototype.close = vi.fn();

    await TestBed.configureTestingModule({
      imports: [InviteParticipantComponent],
      providers: [provideHttpClient()],
    }).compileComponents();

    http = TestBed.inject(HttpClient);
  });

  function create() {
    const fixture = TestBed.createComponent(InviteParticipantComponent);
    fixture.detectChanges();
    return fixture;
  }

  function setEmail(fixture: ReturnType<typeof create>, value: string) {
    const input = fixture.debugElement.query(By.css('input[type="email"]'));
    input.nativeElement.value = value;
    input.nativeElement.dispatchEvent(new Event('input'));
    input.nativeElement.dispatchEvent(new Event('blur'));
    fixture.detectChanges();
    return input;
  }

  function checkConfirmation(fixture: ReturnType<typeof create>) {
    const checkbox = fixture.nativeElement.querySelector(
      '.invite-participant__confirm-checkbox',
    );
    checkbox.checked = true;
    checkbox.dispatchEvent(new Event('change'));
    fixture.detectChanges();
  }

  it('shows validation error for invalid input', () => {
    const fixture = create();

    setEmail(fixture, 'invalid');

    const error = fixture.nativeElement.querySelector(
      '.invite-participant__error',
    );
    expect(error).toBeTruthy();
  });

  it('disables submit when validation errors exist', () => {
    const fixture = create();

    setEmail(fixture, 'invalid');

    const submit = fixture.nativeElement.querySelector(
      '.invite-participant__submit',
    );
    expect(submit.disabled).toBe(true);
  });

  it('enables submit when a valid email is entered', () => {
    const fixture = create();

    setEmail(fixture, 'nt@example.com');

    const submit = fixture.nativeElement.querySelector(
      '.invite-participant__submit',
    );
    expect(submit.disabled).toBe(false);
  });

  it('opens the confirmation dialog with a valid email but does not submit yet', () => {
    const fixture = create();

    setEmail(fixture, 'nt@example.com');

    const dialog = fixture.nativeElement.querySelector(
      '.invite-participant__modal',
    );
    const showModalSpy = vi.spyOn(dialog, 'showModal');

    const httpSpy = vi.spyOn(http, 'post');

    const submit = fixture.nativeElement.querySelector(
      '.invite-participant__submit',
    );
    submit.click();

    expect(showModalSpy).toHaveBeenCalledTimes(1);
    expect(httpSpy).not.toHaveBeenCalled();
  });

  it('does not open the confirmation dialog for an invalid email', () => {
    const fixture = create();

    setEmail(fixture, 'invalid');

    const dialog = fixture.nativeElement.querySelector(
      '.invite-participant__modal',
    );
    const showModalSpy = vi.spyOn(dialog, 'showModal');

    const submit = fixture.nativeElement.querySelector(
      '.invite-participant__submit',
    );
    submit.click();

    expect(showModalSpy).not.toHaveBeenCalled();
  });

  it('keeps the confirm button disabled until the checkbox is confirmed', () => {
    const fixture = create();

    setEmail(fixture, 'nt@example.com');

    const submit = fixture.nativeElement.querySelector(
      '.invite-participant__submit',
    );
    submit.click();
    fixture.detectChanges();

    const confirm = fixture.nativeElement.querySelector(
      '.invite-participant__confirm',
    );
    expect(confirm.disabled).toBe(true);

    checkConfirmation(fixture);

    expect(confirm.disabled).toBe(false);
  });

  it('submits, calls the API, shows success feedback, closes the dialog and clears the form', () => {
    const fixture = create();

    const input = setEmail(fixture, 'nt@example.com');

    const dialog = fixture.nativeElement.querySelector(
      '.invite-participant__modal',
    );
    const closeSpy = vi.spyOn(dialog, 'close');

    const httpSpy = vi
      .spyOn(http, 'post')
      .mockReturnValue(of({ id: 1, email: 'nt@example.com' }));

    const submit = fixture.nativeElement.querySelector(
      '.invite-participant__submit',
    );
    submit.click();
    fixture.detectChanges();

    checkConfirmation(fixture);

    const confirm = fixture.nativeElement.querySelector(
      '.invite-participant__confirm',
    );
    confirm.click();
    fixture.detectChanges();

    expect(httpSpy).toHaveBeenCalledWith('/api/invitations', {
      email: 'nt@example.com',
    });
    expect(closeSpy).toHaveBeenCalled();
    expect(input.nativeElement.value).toEqual('');

    const feedback = fixture.nativeElement.querySelector(
      '.invite-participant__feedback',
    );
    expect(feedback.textContent).toContain('gespeichert');
  });

  it('shows error feedback when the API call fails', () => {
    const fixture = create();

    setEmail(fixture, 'nt@example.com');

    vi.spyOn(http, 'post').mockReturnValue(throwError(() => new Error('fail')));

    const submit = fixture.nativeElement.querySelector(
      '.invite-participant__submit',
    );
    submit.click();
    fixture.detectChanges();

    checkConfirmation(fixture);

    const confirm = fixture.nativeElement.querySelector(
      '.invite-participant__confirm',
    );
    confirm.click();
    fixture.detectChanges();

    const feedback = fixture.nativeElement.querySelector(
      '.invite-participant__feedback',
    );
    expect(feedback.textContent).toContain('nicht gespeichert');
  });

  it('cancel resets the confirmation state', () => {
    const fixture = create();

    setEmail(fixture, 'nt@example.com');

    const submit = fixture.nativeElement.querySelector(
      '.invite-participant__submit',
    );
    submit.click();
    fixture.detectChanges();

    checkConfirmation(fixture);

    const cancel = fixture.nativeElement.querySelector(
      '.invite-participant__cancel',
    );
    cancel.click();
    fixture.detectChanges();

    const confirm = fixture.nativeElement.querySelector(
      '.invite-participant__confirm',
    );
    expect(confirm.disabled).toBe(true);
  });
});
