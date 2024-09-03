export interface RegistrationCode {
  id: number;
  code: string;
  editor_id: number | null;
  admin_id: number;
  created_at: string;
  updated_at: string;
}
