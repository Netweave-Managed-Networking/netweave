import { Component } from '@angular/core';

@Component({
  selector: 'icon-sidebar',
  styles: `
    :host {
      --fill: none; /* can be overridden by parent component */
      --stroke: black; /* can be overridden by parent component */
    }

    svg {
      fill: var(--fill);
      stroke: var(--stroke);
    }
  `,
  template: `
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      stroke-linejoin="round"
      stroke-linecap="round"
      stroke-width="2"
      fill="none"
      stroke="currentColor"
      class="h-5 w-5"
    >
      <path
        d="M4 4m0 2a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2z"
      ></path>
      <path d="M9 4v16"></path>
      <path d="M14 10l2 2l-2 2"></path>
    </svg>
  `,
})
export class IconSidebar {}
