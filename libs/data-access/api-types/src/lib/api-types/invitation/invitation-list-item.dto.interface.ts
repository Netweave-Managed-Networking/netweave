export type InvitationDisplayStatus =
  | 'pending'
  | 'dispatched'
  | 'failed'
  | 'expired'
  | 'answered';

export interface InvitationListItemDTO {
  id: number;
  email: string;
  status: InvitationDisplayStatus;
  createdAt: Date;
}
