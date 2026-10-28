import { HttpClient, provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { LlmConfigDTO } from '@netweave/api-types';
import { of, throwError } from 'rxjs';
import { LlmSettingsComponent } from './llm-settings.component';

const netweaveConfig: LlmConfigDTO = { source: 'netweave', own: null };

const ownConfig: LlmConfigDTO = {
  source: 'own',
  own: {
    provider: 'openai',
    model: 'gpt-x',
    baseUrl: null,
    hasApiKey: true,
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  },
};

describe('LlmSettingsComponent', () => {
  let http: HttpClient;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LlmSettingsComponent],
      providers: [provideHttpClient()],
    }).compileComponents();

    http = TestBed.inject(HttpClient);
  });

  async function create(config: LlmConfigDTO = netweaveConfig) {
    vi.spyOn(http, 'get').mockReturnValue(of(config));

    const fixture = TestBed.createComponent(LlmSettingsComponent);
    await settle(fixture);
    return fixture;
  }

  async function settle(
    fixture: ReturnType<typeof TestBed.createComponent<LlmSettingsComponent>>,
  ) {
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  }

  const query = (
    fixture: ReturnType<typeof TestBed.createComponent<LlmSettingsComponent>>,
    selector: string,
  ) => fixture.nativeElement.querySelector(selector) as HTMLElement | null;

  const type = (input: HTMLElement | null, value: string) => {
    (input as HTMLInputElement).value = value;
    input?.dispatchEvent(new Event('input'));
  };

  it('shows the netweave access as selected without own fields', async () => {
    const fixture = await create();

    expect(
      (query(fixture, '.llm-settings__source-netweave') as HTMLInputElement)
        .checked,
    ).toBe(true);
    expect(query(fixture, '#llm-settings-model')).toBeNull();
    expect(
      (query(fixture, '.llm-settings__submit') as HTMLButtonElement).disabled,
    ).toBe(true);
  });

  it('loads the own access without ever showing the key', async () => {
    const fixture = await create(ownConfig);

    expect(
      (query(fixture, '#llm-settings-model') as HTMLInputElement).value,
    ).toBe('gpt-x');
    expect(
      (query(fixture, '#llm-settings-api-key') as HTMLInputElement).value,
    ).toBe('');
    expect(fixture.nativeElement.textContent).toContain('aktuell gesetzt');
  });

  it('requires an api key before saving a new own access', async () => {
    const fixture = await create();
    query(fixture, '.llm-settings__source-own')?.click();
    await settle(fixture);
    type(query(fixture, '#llm-settings-model'), 'gpt-x');
    await settle(fixture);

    const submit = query(fixture, '.llm-settings__submit') as HTMLButtonElement;
    expect(submit.disabled).toBe(true);

    type(query(fixture, '#llm-settings-api-key'), 'sk-new');
    await settle(fixture);
    expect(submit.disabled).toBe(false);
  });

  it('asks for the api key again when the endpoint of a compatible access changes', async () => {
    const fixture = await create({
      source: 'own',
      own: {
        ...(ownConfig.own as NonNullable<LlmConfigDTO['own']>),
        provider: 'openai-compatible',
        baseUrl: 'https://llm.example.com/v1',
      },
    });
    expect(fixture.nativeElement.textContent).toContain('aktuell gesetzt');

    type(query(fixture, '#llm-settings-base-url'), 'https://other.example.com');
    await settle(fixture);

    expect(fixture.nativeElement.textContent).not.toContain('aktuell gesetzt');
  });

  it('saves the own access, keeping the stored key when the field is left blank', async () => {
    const fixture = await create(ownConfig);
    const putSpy = vi.spyOn(http, 'put').mockReturnValue(of(ownConfig));
    type(query(fixture, '#llm-settings-model'), 'gpt-y');
    await settle(fixture);

    query(fixture, '.llm-settings__submit')?.click();
    await settle(fixture);

    expect(putSpy).toHaveBeenCalledWith('/api/llm-config', {
      provider: 'openai',
      model: 'gpt-y',
      apiKey: undefined,
      baseUrl: undefined,
    });
    expect(fixture.nativeElement.textContent).toContain('Gespeichert.');
  });

  it('switches back to the netweave access by deleting the own one', async () => {
    const fixture = await create(ownConfig);
    const deleteSpy = vi
      .spyOn(http, 'delete')
      .mockReturnValue(of(netweaveConfig));

    query(fixture, '.llm-settings__source-netweave')?.click();
    await settle(fixture);
    expect(query(fixture, '.llm-settings__remove-hint')).toBeTruthy();

    query(fixture, '.llm-settings__submit')?.click();
    await settle(fixture);

    expect(deleteSpy).toHaveBeenCalledWith('/api/llm-config');
    expect(query(fixture, '.llm-settings__remove-hint')).toBeNull();
  });

  it('shows the reason of a failed test call', async () => {
    const fixture = await create(ownConfig);
    const postSpy = vi
      .spyOn(http, 'post')
      .mockReturnValue(of({ success: false, error: 'unauthorized' }));

    query(fixture, '.llm-settings__test')?.click();
    await settle(fixture);

    expect(postSpy).toHaveBeenCalledWith(
      '/api/llm-config/test',
      expect.objectContaining({ provider: 'openai', model: 'gpt-x' }),
    );
    expect(query(fixture, '.llm-settings__test-result')?.textContent).toContain(
      'API-Key ungültig',
    );
  });

  it('shows error feedback when saving fails', async () => {
    const fixture = await create(ownConfig);
    vi.spyOn(http, 'put').mockReturnValue(throwError(() => new Error('fail')));

    query(fixture, '.llm-settings__submit')?.click();
    await settle(fixture);

    expect(
      fixture.debugElement.query(By.css('.text-error')).nativeElement
        .textContent,
    ).toContain('Speichern fehlgeschlagen');
  });
});
