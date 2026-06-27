import { Component } from '@angular/core';

@Component({
  selector: 'lib-info-icon',
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
      class="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  `,
})
export class InfoIcon {}
