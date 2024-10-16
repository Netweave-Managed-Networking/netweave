import { InvitationCode } from '@/types/invitation-code.model';

export const mockInvitationCodes: InvitationCode[] = [
  {
    id: 1,
    code: 'CODE123',
    admin_id: 1,
    editor_id: null, // still unused
    editor: null,
    admin: { id: 1, name: 'Admin User', email: 'admin@example.com' },
  },
  {
    id: 2,
    code: 'CODE456',
    admin_id: 1,
    editor_id: 2,
    editor: { id: 2, name: 'Editor User', email: 'editor@example.com' },
    admin: { id: 1, name: 'Admin User', email: 'admin@example.com' },
  },
] as InvitationCode[];
