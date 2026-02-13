export {
  hashPassword,
  verifyPassword,
  validatePasswordComplexity,
  checkPasswordHistory,
  updatePasswordHistory,
} from './password.util';

export {
  generateAccessToken,
  generateRefreshToken,
  verifyToken,
  getTokenExpiration,
  isTokenExpired,
} from './token.util';

export type {
  TokenPayload,
  AccessTokenPayload,
  RefreshTokenPayload,
  VerifiedToken,
} from './token.util';

export {
  detectSQLInjection,
  sanitizeSQLInput,
  detectXSS,
  sanitizeHTML,
  sanitizeEmail,
  sanitizePhoneNumber,
  sanitizeURL,
  sanitizeText,
  sanitizeFileName,
} from './sanitization.util';

export { calculateComplexity } from './graphql-complexity.util';
