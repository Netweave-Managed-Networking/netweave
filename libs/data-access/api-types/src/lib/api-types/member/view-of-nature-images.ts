import { ViewOfNature } from './view-of-nature.type';

export const VIEW_OF_NATURE_IMAGES: Record<ViewOfNature, string> = {
  robust: `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="114 44 196 108" width="196" height="108">
      <path d="M120 50 C150 95, 165 145, 212 145 C259 145, 274 95, 304 50" fill="none" stroke="#1E6291" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="212" cy="135" r="12.5" fill="#F3B21E" stroke="#173A5E" stroke-width="2"/>
    </svg>
  `,
  fragile: `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="109 22 206 130" width="206" height="130">
      <path d="M115 145 C155 80, 185 50, 212 50 C239 50, 269 80, 309 145" fill="none" stroke="#1E6291" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="212" cy="36" r="12.5" fill="#F3B21E" stroke="#173A5E" stroke-width="2"/>
    </svg>
  `,
  unpredictable: `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="114 94 196 35" width="196" height="35">
      <path d="M120 122 L304 122" fill="none" stroke="#1E6291" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="212" cy="109" r="12.5" fill="#F3B21E" stroke="#173A5E" stroke-width="2"/>
    </svg>
  `,
  reasonably_robust: `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="109 72 206 84" width="206" height="84">
      <path d="M115 150 C130 95, 155 78, 173 78 C191 78, 191 112, 212 112 C233 112, 233 78, 251 78 C269 78, 294 95, 309 150" fill="none" stroke="#1E6291" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="212" cy="108" r="12.5" fill="#F3B21E" stroke="#173A5E" stroke-width="2"/>
    </svg>
  `,
};
