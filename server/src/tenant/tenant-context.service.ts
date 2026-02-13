import { Injectable, ForbiddenException } from '@nestjs/common';
import { AsyncLocalStorage } from 'async_hooks';
import { TenantContext, UserRole } from './tenant-context.interface';

@Injectable()
export class TenantContextService {
  private readonly asyncLocalStorage = new AsyncLocalStorage<TenantContext>();

  /**
   * Set the tenant context for the current async execution context
   */
  setTenantContext(
    organizationId: string,
    userId: string,
    role: UserRole,
    branches?: string[],
    departments?: string[],
  ): void {
    const context: TenantContext = {
      organizationId,
      userId,
      role,
      branches,
      departments,
    };

    // Store in AsyncLocalStorage
    this.asyncLocalStorage.enterWith(context);
  }

  /**
   * Get the current tenant context
   * @throws {ForbiddenException} if no tenant context is set
   */
  getTenantContext(): TenantContext {
    const context = this.asyncLocalStorage.getStore();

    if (!context) {
      throw new ForbiddenException(
        'Tenant context not found. Authentication required.',
      );
    }

    return context;
  }

  /**
   * Clear the tenant context for the current async execution context
   */
  clearTenantContext(): void {
    this.asyncLocalStorage.disable();
  }

  /**
   * Validate that the user has access to the specified organization
   * @throws {ForbiddenException} if access is denied
   */
  validateTenantAccess(organizationId: string): void {
    const context = this.getTenantContext();

    if (context.organizationId !== organizationId) {
      throw new ForbiddenException(
        'Access denied: You do not have permission to access this organization.',
      );
    }
  }

  /**
   * Run a function within a specific tenant context
   * Useful for background jobs or operations that need explicit context
   */
  async runInTenantContext<T>(
    context: TenantContext,
    fn: () => Promise<T>,
  ): Promise<T> {
    return this.asyncLocalStorage.run(context, fn);
  }

  /**
   * Get the organization ID from the current context
   * @throws {ForbiddenException} if no tenant context is set
   */
  getOrganizationId(): string {
    return this.getTenantContext().organizationId;
  }

  /**
   * Get the user ID from the current context
   * @throws {ForbiddenException} if no tenant context is set
   */
  getUserId(): string {
    return this.getTenantContext().userId;
  }

  /**
   * Get the user role from the current context
   * @throws {ForbiddenException} if no tenant context is set
   */
  getUserRole(): UserRole {
    return this.getTenantContext().role;
  }

  /**
   * Check if the current user is an Owner
   */
  isOwner(): boolean {
    const context = this.getTenantContext();
    return context.role === UserRole.OWNER;
  }

  /**
   * Check if the current user is a Manager
   */
  isManager(): boolean {
    const context = this.getTenantContext();
    return context.role === UserRole.MANAGER;
  }

  /**
   * Check if the current user is a Worker
   */
  isWorker(): boolean {
    const context = this.getTenantContext();
    return context.role === UserRole.WORKER;
  }
}
