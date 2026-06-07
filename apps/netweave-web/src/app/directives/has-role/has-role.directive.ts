import {
  Directive,
  TemplateRef,
  ViewContainerRef,
  computed,
  effect,
  inject,
  input,
} from '@angular/core';
import { UserDTO } from '@netweave/api-types';
import { AuthService } from '../../services/auth/auth.service';

type Role = UserDTO['role'];

const ROLE_HIERARCHY: Record<Role, Role[]> = {
  admin: ['admin', 'editor', 'viewer'],
  editor: ['editor', 'viewer'],
  viewer: ['viewer'],
};
/**
 * Structural directive that conditionally renders content when the
 * current user has the required role or a higher one. (admin > editor > viewer).
 *
 * @example
 * ```html
 * <div *appHasRole="'admin'">Only admins see this</div>
 * ```
 *
 * @example
 * ```html
 * <div *appHasRole="'editor'">Admins and editors see this</div>
 * ```
 *
 * @example
 * ```html
 * <div *appHasRole="'viewers'">Everybody sees this. So this is kinda useless.</div>
 * ```
 */
@Directive({
  selector: '[appHasRole]',
  standalone: true,
})
export class HasRoleDirective {
  private readonly templateRef = inject(TemplateRef<unknown>);
  private readonly viewContainer = inject(ViewContainerRef);
  private readonly auth = inject(AuthService);

  public readonly appHasRole = input.required<Role>();

  private allowView = computed<boolean>(() => {
    const requiredRole = this.appHasRole();
    const me = this.auth.me();
    if (me === 'unauthenticated') return false;

    return ROLE_HIERARCHY[me.role].includes(requiredRole);
  });

  public constructor() {
    effect(() =>
      this.allowView()
        ? this.viewContainer.createEmbeddedView(this.templateRef)
        : this.viewContainer.clear(),
    );
  }
}
