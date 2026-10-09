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
  /** comes from the invitation and can't be changed */
  public readonly email = input<string>('');
}
