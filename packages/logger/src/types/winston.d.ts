import 'winston';

declare module 'winston' {
  namespace winston {
    interface transport {
      new (...args: any[]): Transport;
    }
  }
}
