import { Component, model } from '@angular/core';
import { FormValueControl } from '@angular/forms/signals';
import {
  VIEW_OF_NATURE_IMAGES,
  VIEW_OF_NATURE_OPTIONS,
  ViewOfNature,
} from '@netweave/api-types';
import { VIEW_OF_NATURE_TEXTS } from './view-of-nature-texts';

// keeps the radio groups of several instances apart
let nextInstance = 0;

/** Naturanschauung: pick one of four depictions of nature. null until answered */
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
    text: VIEW_OF_NATURE_TEXTS[option],
    image: `data:image/svg+xml,${encodeURIComponent(VIEW_OF_NATURE_IMAGES[option])}`,
  }));
}
