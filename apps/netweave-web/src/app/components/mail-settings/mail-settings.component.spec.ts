import { HttpClient, provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { MailConfigDTO } from '@netweave/api-types';
import { of, throwError } from 'rxjs';
import { MailSettingsComponent } from './mail-settings.component';

const mockConfig: MailConfigDTO = {
  host: 'smtp.example.com',
  port: 587,
  secure: true,
  authUser: 'smtp-user',
  hasPassword: true,
  fromName: 'Netweave',
  fromAddress: 'info@netweave.de',
  updatedAt: new Date('2026-01-01T00:00:00.000Z'),
};

describe('MailSettingsComponent', () => {
  let http: HttpClient;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MailSettingsComponent],
      providers: [provideHttpClient()],
    }).compileComponents();

    http = TestBed.inject(HttpClient);
  });

  async function create(config: MailConfigDTO | null = mockConfig) {
    vi.spyOn(http, 'get').mockReturnValue(of(config));

    const fixture = TestBed.createComponent(MailSettingsComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    return fixture;
  }

  it('should create and load the current config into the form', async () => {
    const fixture = await create();

    expect(fixture.componentInstance).toBeTruthy();

    const hostInput = fixture.debugElement.query(By.css('#mail-settings-host'))
      .nativeElement as HTMLInputElement;
    expect(hostInput.value).toBe('smtp.example.com');
  });

  it('submits the mapped DTO, keeping the password when the field is left blank', async () => {
    const fixture = await create();

    const putSpy = vi
      .spyOn(http, 'put')
      .mockReturnValue(of({ ...mockConfig, hasPassword: true }));

    const submit = fixture.nativeElement.querySelector(
      '.mail-settings__submit',
    );
    submit.click();
    fixture.detectChanges();

    expect(putSpy).toHaveBeenCalledWith(
      '/api/mail-config',
      expect.objectContaining({
        host: 'smtp.example.com',
        port: 587,
        secure: true,
        authUser: 'smtp-user',
        authPass: undefined,
        fromName: 'Netweave',
        fromAddress: 'info@netweave.de',
      }),
    );
  });

  it('clears user/password when "no auth" is checked', async () => {
    const fixture = await create();

    const noAuthCheckbox = fixture.debugElement.query(
      By.css('.mail-settings__no-auth input'),
    ).nativeElement as HTMLInputElement;
    noAuthCheckbox.click();
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const putSpy = vi
      .spyOn(http, 'put')
      .mockReturnValue(
        of({ ...mockConfig, authUser: null, hasPassword: false }),
      );

    const submit = fixture.nativeElement.querySelector(
      '.mail-settings__submit',
    );
    submit.click();
    fixture.detectChanges();

    expect(putSpy).toHaveBeenCalledWith(
      '/api/mail-config',
      expect.objectContaining({ authUser: undefined, authPass: '' }),
    );
  });

  it('shows error feedback when saving fails', async () => {
    const fixture = await create();

    vi.spyOn(http, 'put').mockReturnValue(throwError(() => new Error('fail')));

    const submit = fixture.nativeElement.querySelector(
      '.mail-settings__submit',
    );
    submit.click();
    fixture.detectChanges();

    const errorText = Array.from<HTMLElement>(
      fixture.nativeElement.querySelectorAll('.text-error'),
    ).find((el) => el.textContent?.includes('Speichern fehlgeschlagen'));
    expect(errorText).toBeTruthy();
  });

  it('sends a test mail to the entered address', async () => {
    const fixture = await create();

    const postSpy = vi
      .spyOn(http, 'post')
      .mockReturnValue(of({ success: true }));

    const testInput = fixture.debugElement.query(
      By.css('.mail-settings__test input[type="email"]'),
    ).nativeElement as HTMLInputElement;
    testInput.value = 'someone@example.com';
    testInput.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    const testButton = fixture.nativeElement.querySelector(
      '.mail-settings__test button',
    );
    testButton.click();
    fixture.detectChanges();

    expect(postSpy).toHaveBeenCalledWith('/api/mail-config/test', {
      to: 'someone@example.com',
    });
  });
});
