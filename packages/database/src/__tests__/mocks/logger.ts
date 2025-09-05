/**
 * Mock logger for testing
 */
export const mockLogger = {
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
  verbose: jest.fn(),
  silly: jest.fn(),
  log: jest.fn(),
  profile: jest.fn(),
  startTimer: jest.fn(),
  child: jest.fn(() => mockLogger),
  configure: jest.fn(),
  add: jest.fn(),
  remove: jest.fn(),
  clear: jest.fn(),
  close: jest.fn(),
  query: jest.fn(),
  stream: jest.fn(),
  exceptions: {
    handle: jest.fn(),
    unhandle: jest.fn(),
  },
  rejections: {
    handle: jest.fn(),
    unhandle: jest.fn(),
  },
  format: {},
  transports: {},
  level: 'info',
  levels: {},
  exitOnError: true,
  silent: false,
  emitErrs: true,
  profiler: jest.fn(),
  handleExceptions: false,
  handleRejections: false,
  humanReadableUnhandledException: false,
  defaultMeta: {},
};

export type MockLogger = typeof mockLogger;
