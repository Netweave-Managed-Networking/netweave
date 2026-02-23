import { HttpClient } from '@angular/common/http';
import { Component, inject, resource } from '@angular/core';
import { RouterModule } from '@angular/router';
import { firstValueFrom } from 'rxjs';

@Component({
  imports: [RouterModule],
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  private http = inject(HttpClient);
  protected responseFromBackend = resource({
    loader: () => firstValueFrom(this.http.get<{ message: string }>('/api')),
  });
}
