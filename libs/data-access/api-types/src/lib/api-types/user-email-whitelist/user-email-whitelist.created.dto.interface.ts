import { UserEmailWhitelistDTO } from './user-email-whitelist.dto.interface';

export interface UserEmailWhitelistCreatedDTO extends UserEmailWhitelistDTO {
  /** whether the registration invitation mail went out; `null` for domain entries, which receive no mail */
  invitationMailSent: boolean | null;
}
