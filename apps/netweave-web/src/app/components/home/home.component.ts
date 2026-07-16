import { HttpClient } from '@angular/common/http';
import { Component, inject, resource } from '@angular/core';
import { OrganizationDTO } from '@netweave/api-types';
import { catchError, firstValueFrom, of } from 'rxjs';

@Component({
  selector: 'app-home',
  imports: [],
  templateUrl: './home.component.html',
})
export class HomeComponent {
  private http = inject(HttpClient);

  protected organizationLatest = resource({
    loader: () =>
      firstValueFrom(
        this.http
          .get<OrganizationDTO | null>('/api/organizations/latest')
          .pipe(catchError(() => of(null))),
      ),
  });
}
