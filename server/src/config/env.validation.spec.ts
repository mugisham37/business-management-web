import { validate, EnvironmentVariables } from './env.validation';

describe('Environment Validation', () => {
  it('should validate correct environment variables', () => {
    const config = {
      NODE_ENV: 'development',
      PORT: 3000,
      DATABASE_URL: 'postgresql://user:password@localhost:5432/db',
      JWT_SECRET: 'test-secret',
      JWT_REFRESH_SECRET: 'test-refresh-secret',
      JWT_ACCESS_EXPIRATION: '15m',
      JWT_REFRESH_EXPIRATION: '7d',
      REDIS_HOST: 'localhost',
      REDIS_PORT: 6379,
      REDIS_DB: 0,
      CORS_ORIGIN: 'http://localhost:3001',
      BCRYPT_ROUNDS: 12,
      RATE_LIMIT_TTL: 900,
      RATE_LIMIT_MAX: 5,
    };

    const result = validate(config);
    expect(result).toBeInstanceOf(EnvironmentVariables);
    expect(result.NODE_ENV).toBe('development');
    expect(result.PORT).toBe(3000);
  });

  it('should throw error for invalid environment variables', () => {
    const config = {
      NODE_ENV: 'invalid',
      PORT: 'not-a-number',
    };

    expect(() => validate(config)).toThrow();
  });

  it('should throw error for missing required variables', () => {
    const config = {
      NODE_ENV: 'development',
    };

    expect(() => validate(config)).toThrow();
  });
});
