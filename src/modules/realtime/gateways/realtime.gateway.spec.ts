import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { RealtimeGateway } from './realtime.gateway';
import { AuthService } from '../../auth/services/auth.service';
import { TenantService } from '../../tenant/services/tenant.service';
import { Socket } from 'socket.io';

describe('RealtimeGateway', () => {
  let gateway: RealtimeGateway;
  let authService: jest.Mocked<AuthService>;
  let tenantService: jest.Mocked<TenantService>;
  let jwtService: jest.Mocked<JwtService>;
  let configService: jest.Mocked<ConfigService>;

  const mockUser = {
    id: 'user-1',
    email: 'test@example.com',
    tenantId: 'tenant-1',
    role: 'employee' as const,
    permissions: ['realtime:read'],
    displayName: 'Test User',
    sessionId: 'session-1',
  };

  beforeEach(async () => {
    const mockAuthService = {
      validateUser: jest.fn(),
    };

    const mockTenantService = {
      isValidTenant: jest.fn(),
    };

    const mockJwtService = {
      verify: jest.fn(),
    };

    const mockConfigService = {
      get: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RealtimeGateway,
        { provide: AuthService, useValue: mockAuthService },
        { provide: TenantService, useValue: mockTenantService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    gateway = module.get<RealtimeGateway>(RealtimeGateway);
    authService = module.get(AuthService);
    tenantService = module.get(TenantService);
    jwtService = module.get(JwtService);
    configService = module.get(ConfigService);

    // Setup default mocks
    configService.get.mockReturnValue('test-secret');
    jwtService.verify.mockReturnValue({
      sub: mockUser.id,
      email: mockUser.email,
      tenantId: mockUser.tenantId,
      role: mockUser.role,
      permissions: mockUser.permissions,
      sessionId: mockUser.sessionId,
    });
    authService.validateUser.mockResolvedValue(mockUser);
    tenantService.isValidTenant.mockResolvedValue(true);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });

  describe('handleConnection', () => {
    let mockSocket: Partial<Socket>;

    beforeEach(() => {
      mockSocket = {
        id: 'socket-1',
        handshake: {
          auth: { token: 'valid-token' },
          query: {},
          headers: {},
        } as any,
        join: jest.fn(),
        emit: jest.fn(),
        disconnect: jest.fn(),
        to: jest.fn().mockReturnValue({ emit: jest.fn() }),
        data: {},
      };
    });

    it('should successfully authenticate and connect a valid client', async () => {
      await gateway.handleConnection(mockSocket as Socket);

      expect(jwtService.verify).toHaveBeenCalledWith('valid-token', {
        secret: 'test-secret',
      });
      expect(authService.validateUser).toHaveBeenCalledWith(mockUser.id);
      expect(tenantService.isValidTenant).toHaveBeenCalledWith(mockUser.tenantId);
      expect(mockSocket.join).toHaveBeenCalledWith(`tenant:${mockUser.tenantId}`);
      expect(mockSocket.emit).toHaveBeenCalledWith('connected', expect.objectContaining({
        message: 'Successfully connected to real-time service',
        userId: mockUser.id,
        tenantId: mockUser.tenantId,
      }));
    });

    it('should reject connection when no token is provided', async () => {
      mockSocket.handshake!.auth = {};
      mockSocket.handshake!.query = {};
      mockSocket.handshake!.headers = {};

      await gateway.handleConnection(mockSocket as Socket);

      expect(mockSocket.emit).toHaveBeenCalledWith('auth_error', {
        message: 'Authentication token required',
      });
      expect(mockSocket.disconnect).toHaveBeenCalled();
    });

    it('should reject connection when token is invalid', async () => {
      authService.validateUser.mockResolvedValue(null);

      await gateway.handleConnection(mockSocket as Socket);

      expect(mockSocket.emit).toHaveBeenCalledWith('auth_error', {
        message: 'Invalid authentication token',
      });
      expect(mockSocket.disconnect).toHaveBeenCalled();
    });

    it('should reject connection when tenant is invalid', async () => {
      tenantService.isValidTenant.mockResolvedValue(false);

      await gateway.handleConnection(mockSocket as Socket);

      expect(mockSocket.emit).toHaveBeenCalledWith('auth_error', {
        message: 'Invalid or inactive tenant',
      });
      expect(mockSocket.disconnect).toHaveBeenCalled();
    });

    it('should extract token from query parameters', async () => {
      mockSocket.handshake!.auth = {};
      mockSocket.handshake!.query = { token: 'query-token' };

      await gateway.handleConnection(mockSocket as Socket);

      expect(jwtService.verify).toHaveBeenCalledWith('query-token', {
        secret: 'test-secret',
      });
    });

    it('should extract token from authorization header', async () => {
      mockSocket.handshake!.auth = {};
      mockSocket.handshake!.query = {};
      mockSocket.handshake!.headers = { authorization: 'Bearer header-token' };

      await gateway.handleConnection(mockSocket as Socket);

      expect(jwtService.verify).toHaveBeenCalledWith('header-token', {
        secret: 'test-secret',
      });
    });
  });

  describe('handleDisconnect', () => {
    it('should handle disconnection of authenticated client', () => {
      // First connect a client
      const mockSocket = {
        id: 'socket-1',
        to: jest.fn().mockReturnValue({ emit: jest.fn() }),
      } as any;

      // Simulate connected client
      (gateway as any).connectedClients.set('socket-1', {
        id: 'socket-1',
        user: mockUser,
        tenantId: mockUser.tenantId,
        connectedAt: new Date(),
        lastActivity: new Date(),
        rooms: new Set(['tenant:tenant-1']),
      });

      (gateway as any).tenantRooms.set('tenant-1', new Set(['socket-1']));

      gateway.handleDisconnect(mockSocket);

      expect((gateway as any).connectedClients.has('socket-1')).toBe(false);
    });

    it('should handle disconnection of unknown client', () => {
      const mockSocket = { id: 'unknown-socket' } as any;

      // Should not throw error
      expect(() => gateway.handleDisconnect(mockSocket)).not.toThrow();
    });
  });

  describe('subscription methods', () => {
    let mockSocket: Partial<Socket>;

    beforeEach(() => {
      mockSocket = {
        id: 'socket-1',
        join: jest.fn(),
        emit: jest.fn(),
      };

      // Setup connected client
      (gateway as any).connectedClients.set('socket-1', {
        id: 'socket-1',
        user: mockUser,
        tenantId: mockUser.tenantId,
        connectedAt: new Date(),
        lastActivity: new Date(),
        rooms: new Set(),
      });
    });

    it('should handle inventory subscription', async () => {
      const data = { locationId: 'location-1' };

      await gateway.handleInventorySubscription(mockSocket as Socket, data);

      expect(mockSocket.join).toHaveBeenCalledWith(`inventory:${mockUser.tenantId}:location-1`);
      expect(mockSocket.emit).toHaveBeenCalledWith('subscription_success', expect.objectContaining({
        type: 'inventory',
        locationId: 'location-1',
      }));
    });

    it('should handle transaction subscription', async () => {
      const data = { locationId: 'location-1' };

      await gateway.handleTransactionSubscription(mockSocket as Socket, data);

      expect(mockSocket.join).toHaveBeenCalledWith(`transactions:${mockUser.tenantId}:location-1`);
      expect(mockSocket.emit).toHaveBeenCalledWith('subscription_success', expect.objectContaining({
        type: 'transactions',
        locationId: 'location-1',
      }));
    });

    it('should handle customer activity subscription', async () => {
      const data = { customerId: 'customer-1' };

      await gateway.handleCustomerActivitySubscription(mockSocket as Socket, data);

      expect(mockSocket.join).toHaveBeenCalledWith(`customer_activity:${mockUser.tenantId}:customer-1`);
      expect(mockSocket.emit).toHaveBeenCalledWith('subscription_success', expect.objectContaining({
        type: 'customer_activity',
        customerId: 'customer-1',
      }));
    });
  });

  describe('public emit methods', () => {
    beforeEach(() => {
      // Mock the server
      (gateway as any).server = {
        to: jest.fn().mockReturnValue({ emit: jest.fn() }),
      };
    });

    it('should emit inventory update', () => {
      const update = { productId: 'product-1', newQuantity: 10 };

      gateway.emitInventoryUpdate('tenant-1', 'location-1', update);

      expect((gateway as any).server.to).toHaveBeenCalledWith('inventory:tenant-1:location-1');
    });

    it('should emit transaction update', () => {
      const transaction = { transactionId: 'tx-1', total: 100 };

      gateway.emitTransactionUpdate('tenant-1', 'location-1', transaction);

      expect((gateway as any).server.to).toHaveBeenCalledWith('transactions:tenant-1:location-1');
    });

    it('should emit notification', () => {
      const notification = { type: 'info', message: 'Test notification' };

      gateway.emitNotification('tenant-1', notification);

      expect((gateway as any).server.to).toHaveBeenCalledWith('tenant:tenant-1');
    });
  });

  describe('connection statistics', () => {
    it('should return connection stats', () => {
      const stats = gateway.getConnectionStats();

      expect(stats).toHaveProperty('connectedClients');
      expect(stats).toHaveProperty('tenantRooms');
    });

    it('should return tenant connections', () => {
      // Setup a connected client
      (gateway as any).connectedClients.set('socket-1', {
        id: 'socket-1',
        user: mockUser,
        tenantId: 'tenant-1',
        connectedAt: new Date(),
        lastActivity: new Date(),
        rooms: new Set(),
      });

      const connections = gateway.getTenantConnections('tenant-1');

      expect(connections).toHaveLength(1);
      expect(connections[0]?.tenantId).toBe('tenant-1');
    });
  });
});