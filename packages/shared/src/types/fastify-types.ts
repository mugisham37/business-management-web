/**
 * Fastify Type Definitions
 * Provides type definitions for Fastify when the actual package is not available
 */

import { IncomingHttpHeaders } from 'http';

export interface FastifyRequest {
  id: string;
  ip: string;
  hostname: string;
  url: string;
  method: string;
  headers: IncomingHttpHeaders;
  query: Record<string, any>;
  params: Record<string, any>;
  body: any;
  raw: any;
  log: any;
  startTime?: number;
}

export interface FastifyReply {
  statusCode: number;
  sent: boolean;
  code(statusCode: number): FastifyReply;
  status(statusCode: number): FastifyReply;
  header(name: string, value: any): FastifyReply;
  headers(headers: Record<string, any>): FastifyReply;
  getHeader(name: string): string | number | string[] | undefined;
  getHeaders(): Record<string, string | number | string[]>;
  removeHeader(name: string): void;
  hasHeader(name: string): boolean;
  send(payload?: any): FastifyReply;
  serializer(fn: Function): FastifyReply;
  type(contentType: string): FastifyReply;
  redirect(url: string): FastifyReply;
  redirect(code: number, url: string): FastifyReply;
  callNotFound(): void;
  getResponseTime(): number;
  log: any;
}

export interface FastifyInstance {
  log: any;
  server: any;
  register: Function;
  listen: Function;
  close: Function;
  ready: Function;
}

// Re-export for compatibility
export type { FastifyReply as Reply, FastifyRequest as Request };
