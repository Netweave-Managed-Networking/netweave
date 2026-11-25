import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../../services/auth/auth.service';

@Component({
  selector: 'app-verify-email',
  imports: [RouterLink],
  templateUrl: './verify-email.component.html',
  styleUrls: ['./verify-email.component.scss'],
})
export class VerifyEmailComponent implements OnInit {
  private auth = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  protected state = signal<'pending' | 'invalid'>('pending');

  public async ngOnInit() {
    const token = this.route.snapshot.paramMap.get('token') ?? '';

    try {
      // logs the user in, so no second login is needed
      await firstValueFrom(this.auth.verifyEmail(token));
      await this.router.navigate(['/']);
    } catch {
      // the link was already used, e.g. clicked twice: the user is logged in by then
      const me = await firstValueFrom(this.auth.getMe());
      if (me !== 'unauthenticated') await this.router.navigate(['/']);
      else this.state.set('invalid');
    }
  }
}
