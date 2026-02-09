/**
 * API Client Configuration
 * 
 * Configures the Axios instance for all HTTP communication with the backend.
 * 
 * Features:
 * - Base URL from environment variable
 * - 30-second timeout
 * - Automatic JSON content type
 * - Cookie support for refresh tokens (httpOnly)
 * - Request/response interceptors for token management
 * 
 * Requirements: 3.1, 3.2, 15.4
 */

import axios, { AxiosInstance } from 'axios';
import { API_CONFIG } from '@/lib/constants/api';
import { setupInterceptors } from './interceptors';

// Validate required environment variable
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_BASE_URL) {
  throw new Error(
    'NEXT_PUBLIC_API_URL environment variable is not set. ' +
    'Please add it to your .env.local file.'
  );
}

/**
 * Configured Axios instance for API communication
 * 
 * Configuration:
 * - baseURL: From NEXT_PUBLIC_API_URL environment variable
 * - timeout: 30 seconds (30000ms)
 * - headers: Content-Type application/json
 * - withCredentials: true (enables httpOnly cookie support)
 */
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': API_CONFIG.HEADERS.CONTENT_TYPE,
  },
  withCredentials: true, // Required for httpOnly cookies (refresh token)
});

// Setup request/response interceptors
setupInterceptors(apiClient);

export default apiClient;
