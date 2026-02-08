import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Local Team Member Auth Guard for team member login (company code + username + password)
 * 
 * Uses the 'local-team-member' Passport strategy
 */
@Injectable()
export class LocalTeamMemberAuthGuard extends AuthGuard('local-team-member') {
  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }
}
