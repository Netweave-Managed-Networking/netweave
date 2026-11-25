import { Component } from '@angular/core';

@Component({
  selector: 'icon-clock',
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
      stroke-width="1.5"
      stroke="currentColor"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
      />
    </svg>
  `,
})
export class IconClock {}
