export interface MailConfigDTO {
  host: string;
  port: number;
  secure: boolean;
  authUser: string | null;
  hasPassword: boolean;
  fromName: string;
  fromAddress: string;
  updatedAt: Date | null;
}
