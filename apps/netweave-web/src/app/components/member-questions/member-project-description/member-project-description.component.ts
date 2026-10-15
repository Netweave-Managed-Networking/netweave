import {
  HttpClient,
  HttpErrorResponse,
  HttpStatusCode,
} from '@angular/common/http';
import {
  Component,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { form, FormField, maxLength } from '@angular/forms/signals';
import {
  GeneratedRequirementsDTO,
  MemberRequirementsGenerationDTO,
  PROJECT_DESCRIPTION_MAX_LENGTH,
} from '@netweave/api-types';
import { catchError, of, take, tap } from 'rxjs';
import { LoadingState } from '../../../types/loading-state.type';

/** the description is only sent to generate requirements, it is never saved */
@Component({
  selector: 'app-member-project-description',
  imports: [FormField],
  templateUrl: './member-project-description.component.html',
})
export class MemberProjectDescriptionComponent {
  private http = inject(HttpClient);

  public readonly token = input.required<string>();
  public readonly disabled = input(false);
  public readonly generated = output<GeneratedRequirementsDTO>();

  protected description = signal('');
  protected descriptionField = form(this.description, (schemaPath) => {
    maxLength(schemaPath, PROJECT_DESCRIPTION_MAX_LENGTH);
  });
  protected generateState = signal<LoadingState>('initial');
  protected generateError = signal('');
  protected generatedCount = signal(0);

  protected canGenerate = computed(
    () =>
      !this.disabled() &&
      !!this.description().trim() &&
      !this.descriptionField().invalid() &&
      this.generateState() !== 'pending',
  );

  protected generate() {
    if (!this.canGenerate()) return;

    this.generateState.set('pending');

    const dto: MemberRequirementsGenerationDTO = {
      projectDescription: this.description(),
    };

    this.http
      .post<GeneratedRequirementsDTO>(
        `/api/members/by-token/${this.token()}/generated-requirements`,
        dto,
      )
      .pipe(
        take(1),
        tap((requirements) => {
          this.generatedCount.set(Object.keys(requirements).length);
          this.generated.emit(requirements);
          this.generateState.set('success');
        }),
        catchError((err: unknown) => {
          this.generateError.set(toGenerateErrorMessage(err));
          this.generateState.set('error');
          return of(null);
        }),
      )
      .subscribe();
  }
}

function toGenerateErrorMessage(err: unknown): string {
  const status = err instanceof HttpErrorResponse ? err.status : undefined;

  if (status === HttpStatusCode.ServiceUnavailable)
    return 'Das Generieren von Bedarfen ist derzeit nicht verfügbar. Bitte trage deine Bedarfe manuell ein.';

  if (status === HttpStatusCode.TooManyRequests)
    return 'Du hast in letzter Zeit sehr oft Bedarfe generiert. Bitte versuche es in einer Stunde erneut.';

  return 'Die Bedarfe konnten nicht generiert werden. Bitte versuche es erneut.';
}
