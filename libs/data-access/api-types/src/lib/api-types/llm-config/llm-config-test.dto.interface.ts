export type LlmConfigTestError =
  | 'unauthorized'
  | 'not-found'
  | 'rate-limited'
  | 'unreachable'
  | 'timeout'
  | 'unknown';

export interface LlmConfigTestResultDTO {
  success: boolean;
  error: LlmConfigTestError | null;
}
