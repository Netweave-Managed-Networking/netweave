import { HttpClient } from '@angular/common/http';
import { Component, inject, resource } from '@angular/core';
import { RouterLink } from '@angular/router';
import { OrganizationDTO } from '@netweave/api-types';
import { catchError, firstValueFrom, of } from 'rxjs';
import { HasRoleDirective } from '../../directives/has-role/has-role.directive';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, HasRoleDirective],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent {
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
