import { Test, TestingModule } from '@nestjs/testing';
import { DatabaseModule } from './database.module';
import { PrismaService } from './prisma.service';
import { ConfigModule } from '@nestjs/config';

// Mock PrismaService for testing
const mockPrismaService = {
  $connect: jest.fn(),
  $disconnect: jest.fn(),
  $on: jest.fn(),
  $transaction: jest.fn(),
  onModuleInit: jest.fn(),
  onModuleDestroy: jest.fn(),
};

describe('DatabaseModule', () => {
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
        }),
        DatabaseModule,
      ],
    })
      .overrideProvider(PrismaService)
      .useValue(mockPrismaService)
      .compile();
  });

  it('should be defined', () => {
    expect(module).toBeDefined();
  });

  it('should provide PrismaService', () => {
    const prismaService = module.get<PrismaService>(PrismaService);
    expect(prismaService).toBeDefined();
  });

  it('should export PrismaService', () => {
    const prismaService = module.get<PrismaService>(PrismaService);
    expect(prismaService).toBe(mockPrismaService);
  });
});
