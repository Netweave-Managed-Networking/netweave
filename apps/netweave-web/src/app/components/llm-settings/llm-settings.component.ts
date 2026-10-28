import { HttpClient } from '@angular/common/http';
import {
  Component,
  computed,
  effect,
  inject,
  resource,
  ResourceRef,
  signal,
} from '@angular/core';
import { form, FormField, required, validate } from '@angular/forms/signals';
import {
  LLM_PROVIDERS,
  LlmConfigDTO,
  LlmConfigSource,
  LlmConfigTestError,
  LlmConfigTestResultDTO,
  LlmConfigUpdateDTO,
  LlmProvider,
} from '@netweave/api-types';
import { isURL } from 'class-validator';
import { catchError, firstValueFrom, Observable, of, take, tap } from 'rxjs';
import { LoadingState } from '../../types/loading-state.type';

interface OwnLlmFormModel {
  provider: LlmProvider;
  model: string;
  apiKey: string;
  baseUrl: string;
}

const EMPTY_MODEL: OwnLlmFormModel = {
  provider: 'openai',
  model: '',
  apiKey: '',
  baseUrl: '',
};

const PROVIDER_LABELS: Record<LlmProvider, string> = {
  openai: 'OpenAI',
  anthropic: 'Anthropic',
  mistral: 'Mistral AI',
  'openai-compatible': 'OpenAI-kompatibel (z. B. selbst gehostet)',
};

const TEST_ERROR_TEXTS: Record<LlmConfigTestError, string> = {
  unauthorized: 'API-Key ungültig oder ohne Berechtigung.',
  'not-found': 'Modell oder Endpoint nicht gefunden.',
  'rate-limited': 'Rate-Limit oder Kontingent des Zugangs erreicht.',
  unreachable: 'Endpoint nicht erreichbar.',
  timeout:
    'Zeitüberschreitung, der Anbieter hat nicht rechtzeitig geantwortet.',
  unknown: 'Unbekannter Fehler beim Testaufruf.',
};

@Component({
  selector: 'app-llm-settings',
  imports: [FormField],
  templateUrl: './llm-settings.component.html',
  styleUrls: ['./llm-settings.component.scss'],
})
export class LlmSettingsComponent {
  private http = inject(HttpClient);

  protected readonly providers = LLM_PROVIDERS;
  protected readonly providerLabels = PROVIDER_LABELS;

  protected source = signal<LlmConfigSource>('netweave');
  protected saved = signal<LlmConfigDTO | null>(null);
  protected saveState = signal<LoadingState>('initial');
  protected testState = signal<LoadingState>('initial');
  protected testError = signal<string | null>(null);

  protected ownModel = signal<OwnLlmFormModel>(EMPTY_MODEL);

  protected hasStoredApiKey = computed(() => {
    const own = this.saved()?.own;
    const { provider, baseUrl } = this.ownModel();
    return (
      !!own?.hasApiKey &&
      own.provider === provider &&
      (provider !== 'openai-compatible' || own.baseUrl === baseUrl.trim())
    );
  });

  protected removesOwnAccess = computed(
    () => this.source() === 'netweave' && this.saved()?.source === 'own',
  );

  protected settingsResource: ResourceRef<LlmConfigDTO | null | undefined> =
    resource({
      loader: () =>
        firstValueFrom(
          this.http
            .get<LlmConfigDTO>('/api/llm-config')
            .pipe(catchError(() => of(null))),
        ),
    });

  protected ownForm = form(this.ownModel, (schemaPath) => {
    required(schemaPath.model);

    validate(schemaPath.apiKey, ({ value, valueOf }) =>
      value().trim() ||
      valueOf(schemaPath.provider) === 'openai-compatible' ||
      this.hasStoredApiKey()
        ? null
        : { kind: 'required', message: 'API-Key ist erforderlich.' },
    );

    validate(schemaPath.baseUrl, ({ value, valueOf }) =>
      valueOf(schemaPath.provider) !== 'openai-compatible' ||
      isURL(value(), { protocols: ['http', 'https'], require_tld: false })
        ? null
        : { kind: 'format', message: 'Ungültige URL.' },
    );
  });

  public constructor() {
    effect(() => {
      const config = this.settingsResource.value();
      if (config) this.applySaved(config);
    });
  }

  protected setSource(source: LlmConfigSource) {
    this.source.set(source);
    this.saveState.set('initial');
    this.testState.set('initial');
  }

  protected canSave(): boolean {
    if (this.saveState() === 'pending') return false;
    return this.source() === 'netweave'
      ? this.saved()?.source === 'own'
      : this.ownForm().valid();
  }

  protected submit() {
    if (!this.canSave()) return;

    this.saveState.set('pending');
    const request: Observable<LlmConfigDTO> =
      this.source() === 'netweave'
        ? this.http.delete<LlmConfigDTO>('/api/llm-config')
        : this.http.put<LlmConfigDTO>('/api/llm-config', this.toDTO());

    request
      .pipe(
        take(1),
        tap((config) => {
          this.saveState.set('success');
          this.applySaved(config);
        }),
        catchError(() => {
          this.saveState.set('error');
          return of(null);
        }),
      )
      .subscribe();
  }

  protected test() {
    if (this.ownForm().invalid()) return;

    this.testState.set('pending');
    this.testError.set(null);

    this.http
      .post<LlmConfigTestResultDTO>('/api/llm-config/test', this.toDTO())
      .pipe(
        take(1),
        tap(({ success, error }) => {
          this.testState.set(success ? 'success' : 'error');
          this.testError.set(error ? TEST_ERROR_TEXTS[error] : null);
        }),
        catchError(() => {
          this.testState.set('error');
          this.testError.set(null);
          return of(null);
        }),
      )
      .subscribe();
  }

  private toDTO(): LlmConfigUpdateDTO {
    const model = this.ownModel();
    return {
      provider: model.provider,
      model: model.model,
      apiKey: model.apiKey.trim() || undefined,
      baseUrl:
        model.provider === 'openai-compatible' ? model.baseUrl : undefined,
    };
  }

  private applySaved(config: LlmConfigDTO) {
    this.saved.set(config);
    this.source.set(config.source);
    this.ownModel.set(
      config.own
        ? {
            provider: config.own.provider,
            model: config.own.model,
            apiKey: '',
            baseUrl: config.own.baseUrl ?? '',
          }
        : EMPTY_MODEL,
    );
  }
}
