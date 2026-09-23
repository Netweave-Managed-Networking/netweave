import { HttpClient, provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { SettingsComponent } from './settings.component';

describe('SettingsComponent', () => {
  let http: HttpClient;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SettingsComponent],
      providers: [provideHttpClient()],
    }).compileComponents();

    http = TestBed.inject(HttpClient);
    vi.spyOn(http, 'get').mockReturnValue(of([]));
  });

  function create() {
    const fixture = TestBed.createComponent(SettingsComponent);
    fixture.detectChanges();
    return fixture;
  }

  it('shows the manager tab by default', () => {
    const fixture = create();

    expect(
      fixture.nativeElement.querySelector('app-user-invitations'),
    ).toBeTruthy();
    expect(
      fixture.nativeElement.querySelector('app-mail-settings'),
    ).toBeFalsy();
  });

  it('switches to the mail settings tab when clicked', () => {
    const fixture = create();

    const tabs = fixture.nativeElement.querySelectorAll('.settings__tab');
    (tabs[1] as HTMLElement).click();
    fixture.detectChanges();

    expect(
      fixture.nativeElement.querySelector('app-mail-settings'),
    ).toBeTruthy();
    expect(
      fixture.nativeElement.querySelector('app-user-invitations'),
    ).toBeFalsy();
  });
});
