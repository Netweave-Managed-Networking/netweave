import { Component, input } from '@angular/core';
import { FieldTree, FormField } from '@angular/forms/signals';

@Component({
  selector: 'app-member-general-data',
  imports: [FormField],
  templateUrl: './member-general-data.component.html',
})
export class MemberGeneralDataComponent {
  public readonly name = input.required<FieldTree<string>>();
  public readonly contact = input.required<FieldTree<string>>();
  public readonly email = input.required<FieldTree<string>>();
  /** stays in use until the pending email is confirmed */
  public readonly confirmedEmail = input<string>('');
  public readonly pendingEmail = input<string | null>(null);
}
