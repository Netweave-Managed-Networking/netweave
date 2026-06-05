import { HttpClient } from '@angular/common/http';
import { Component, inject, resource } from '@angular/core';
import { RouterModule } from '@angular/router';
import { WelcomeResponseDTO } from '@netweave/api-types';

import { firstValueFrom } from 'rxjs';
import { TopNavComponent } from './top-nav/top-nav.component';

@Component({
  imports: [RouterModule, TopNavComponent],
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  private http = inject(HttpClient);

  protected welcomeResponse = resource({
    loader: () => firstValueFrom(this.http.get<WelcomeResponseDTO>('/api')),
  });
}
