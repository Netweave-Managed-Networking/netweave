import { Component, input } from '@angular/core';
import { MemberListItemDTO } from '@netweave/api-types';

/**
 * one member in the member overview: its email and organization name, more general data follows later.
 * a row of the overview's table; its columns have to match the legend there
 */
@Component({
  selector: 'app-member-list-item',
  templateUrl: './member-list-item.component.html',
  host: {
    role: 'row',
    class: 'member-list-item grid grid-cols-2 gap-4 px-4 py-3',
  },
})
export class MemberListItemComponent {
  public member = input.required<MemberListItemDTO>();
}
