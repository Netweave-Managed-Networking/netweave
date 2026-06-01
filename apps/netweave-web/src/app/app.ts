import { HttpClient } from '@angular/common/http';
import { Component, inject, resource } from '@angular/core';
import { RouterModule } from '@angular/router';
import { OrganizationDTO, WelcomeResponseDTO } from '@netweave/api-types';

import { catchError, firstValueFrom, of } from 'rxjs';
import { LoginButtonComponent } from './login-button/login-button.component';

@Component({
  imports: [RouterModule, LoginButtonComponent],
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  private http = inject(HttpClient);

  protected welcomeResponse = resource({
    loader: () => firstValueFrom(this.http.get<WelcomeResponseDTO>('/api')),
  });

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
