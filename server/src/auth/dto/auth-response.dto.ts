import { User } from '@prisma/client';

/**
 * DTO for authentication response
 * Implements requirements 3.2, 4.1, 4.2
 */
export class AuthResponseDto {
  accessToken: string;
  refreshToken: string;
  user: Partial<User>;
  requiresMFA: boolean;
}
