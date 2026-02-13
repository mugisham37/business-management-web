import { ErrorCode } from './error-codes.enum';

export interface ErrorResponse {
  code: ErrorCode;
  message: string;
  details?: Record<string, any>;
  timestamp: string;
  path?: string;
}
