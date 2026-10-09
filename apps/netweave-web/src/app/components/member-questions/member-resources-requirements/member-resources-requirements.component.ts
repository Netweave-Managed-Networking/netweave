import { Component, input } from '@angular/core';
import { FieldTree, FormField } from '@angular/forms/signals';
import { RESOURCE_REQUIREMENT_CATEGORIES } from '@netweave/api-types';
import { ResourcesRequirementsModel } from '../member-form.model';
import { RESOURCE_REQUIREMENT_CATEGORY_TEXTS } from './resource-requirement-categories';

@Component({
  selector: 'app-member-resources-requirements',
  imports: [FormField],
  templateUrl: './member-resources-requirements.component.html',
})
export class MemberResourcesRequirementsComponent {
  public readonly fields =
    input.required<FieldTree<ResourcesRequirementsModel>>();

  protected readonly categories = RESOURCE_REQUIREMENT_CATEGORIES;
  protected readonly categoryTexts = RESOURCE_REQUIREMENT_CATEGORY_TEXTS;
}
