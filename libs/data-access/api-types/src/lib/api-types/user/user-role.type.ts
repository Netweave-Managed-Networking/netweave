/** ordered from most to least privileged */
export const USER_ROLES = ['admin', 'editor', 'viewer'] as const;

export type UserRole = (typeof USER_ROLES)[number];

/** role a newly registered user receives unless a whitelist entry says otherwise */
export const DEFAULT_USER_ROLE: UserRole = 'viewer';
