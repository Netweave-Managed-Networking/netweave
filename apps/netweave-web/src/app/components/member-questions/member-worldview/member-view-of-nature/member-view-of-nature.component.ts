import { Component, model } from '@angular/core';
import { FormValueControl } from '@angular/forms/signals';
import { VIEW_OF_NATURE_OPTIONS, ViewOfNature } from '@netweave/api-types';
import { VIEW_OF_NATURE_DEPICTIONS } from './view-of-nature-depictions';

/** radios of different instances must not form one group, nor share text ids */
let nextInstance = 0;

/**
 * Naturanschauung: exactly one of four depictions of nature, each a text with an image.
 * The value stays null until the first answer.
 */
@Component({
  selector: 'app-member-view-of-nature',
  templateUrl: './member-view-of-nature.component.html',
})
export class MemberViewOfNatureComponent
  implements FormValueControl<ViewOfNature | null>
{
  public readonly value = model<ViewOfNature | null>(null);
  protected readonly radioName = `member-view-of-nature-${nextInstance++}`;
  protected readonly questionId = `${this.radioName}-question`;

  protected readonly options = VIEW_OF_NATURE_OPTIONS.map((option) => ({
    option,
    ...VIEW_OF_NATURE_DEPICTIONS[option],
  }));

  protected select(option: ViewOfNature): void {
    this.value.set(option);
  }
}
