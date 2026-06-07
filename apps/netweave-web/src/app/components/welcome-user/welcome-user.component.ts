import { HttpClient } from '@angular/common/http';
import { Component, inject, resource } from '@angular/core';
import { RouterLink } from '@angular/router';
import { OrganizationDTO } from '@netweave/api-types';
import { catchError, firstValueFrom, of } from 'rxjs';
import { HasRoleDirective } from '../../directives/has-role/has-role.directive';

@Component({
  selector: 'app-welcome-user',
  standalone: true,
  imports: [RouterLink, HasRoleDirective],
  templateUrl: './welcome-user.component.html',
  styleUrls: ['./welcome-user.component.scss'],
})
export class WelcomeUserComponent {
  private http = inject(HttpClient);

  protected organizationLatest = resource({
    loader: () =>
      // handle error
      firstValueFrom(
        this.http
          .get<OrganizationDTO | null>('/api/organizations/latest')
          .pipe(catchError(() => of(null))),
      ),
  });
}
