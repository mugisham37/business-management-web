import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Local Authentication Guard
 * 
 * Uses Passport's local strategy for username/password authentication.
 * This guard is typically used for login endpoints where users provide
 * email/username and password credentials.
 * 
 * Usage:
 * @UseGuards(LocalAuthGuard)
 * @Post('login')
 * async login(@Request() req) {
 *   return this.authService.login(req.user);
 * }
 * 
 * The guard will:
 * 1. Extract credentials from request body
 * 2. Validate credentials using LocalStrategy
 * 3. Attach authenticated user to request.user
 * 4. Allow or deny access based on validation result
 */
@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {
  constructor() {
    super();
  }
}