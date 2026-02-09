/**
 * API Client Interceptors
 * 
 * Implements request and response interceptors for the Axios client.
 * 
 * Features:
 * - Request interceptor: Adds Authorization header with access token
 * - Response interceptor: Handles token refresh on 401 errors
 * - Request deduplication: Prevents duplicate concurrent requests
 * - Retry logic: Exponential backoff for network errors and idempotent requests
 * 
 * Requirements: 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 14.1, 14.2, 14.3, 14.4, 14.5, 14.6
 */

import {
  AxiosInstance,
  AxiosError,
  InternalAxiosRequestConfig,
  AxiosResponse,
} from 'axios';
import { TokenManager } from '@/lib/auth/token-manager';
import { handleApiError } from '@/lib/utils/error-handler';
import { API_CONFIG } from '@/lib/constants/api';

// Token refresh state management
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: any) => void;
}> = [];

/**
 * Process the queue of requests waiting for token refresh
 * @param error - Error if refresh failed, null if successful
 * @param token - New access token if refresh succeeded
 */
const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else {
      promise.resolve(token!);
    }
  });
  failedQueue = [];
};

// Request deduplication map
const pendingRequests = new Map<string, Promise<AxiosResponse>>();

/**
 * Generate a unique key for a request based on method, URL, and data
 * @param config - Axios request configuration
 * @returns Unique request key
 */
const getRequestKey = (config: InternalAxiosRequestConfig): string => {
  const { method, url, data, params } = config;
  return `${method}:${url}:${JSON.stringify(data)}:${JSON.stringify(params)}`;
};

/**
 * Check if an HTTP method is idempotent
 * Idempotent methods: GET, PUT, DELETE, HEAD, OPTIONS
 * Non-idempotent: POST, PATCH
 * 
 * @param method - HTTP method
 * @returns true if the method is idempotent
 */
const isIdempotentMethod = (method: string = ''): boolean => {
  const idempotentMethods = ['GET', 'PUT', 'DELETE', 'HEAD', 'OPTIONS'];
  return idempotentMethods.includes(method.toUpperCase());
};

/**
 * Retry a request with exponential backoff
 * @param config - Axios request configuration
 * @param retryCount - Current retry attempt number
 * @param axiosInstance - Axios instance to use for retry
 * @returns Promise resolving to the response
 */
const retryRequest = async (
  config: InternalAxiosRequestConfig & { _retryCount?: number },
  retryCount: number,
  axiosInstance: AxiosInstance
): Promise<AxiosResponse> => {
  const delay =
    Math.min(
      API_CONFIG.RETRY.INITIAL_DELAY * Math.pow(API_CONFIG.RETRY.BACKOFF_MULTIPLIER, retryCount),
      API_CONFIG.RETRY.MAX_DELAY
    );

  await new Promise((resolve) => setTimeout(resolve, delay));

  config._retryCount = retryCount + 1;
  return axiosInstance(config);
};

/**
 * Setup request and response interceptors for the Axios instance
 * @param client - The Axios instance to configure
 */
export function setupInterceptors(client: AxiosInstance): void {
  // ============================================================================
  // REQUEST INTERCEPTOR
  // ============================================================================
  client.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      // Add Authorization header if access token exists
      const token = TokenManager.getAccessToken();
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      // Request deduplication for concurrent identical requests
      const requestKey = getRequestKey(config);
      const pendingRequest = pendingRequests.get(requestKey);

      if (pendingRequest) {
        // Return the existing pending request instead of making a new one
        return Promise.reject({
          config,
          message: 'Duplicate request',
          isDuplicate: true,
          pendingRequest,
        });
      }

      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // ============================================================================
  // RESPONSE INTERCEPTOR
  // ============================================================================
  client.interceptors.response.use(
    (response: AxiosResponse) => {
      // Remove from pending requests on success
      const requestKey = getRequestKey(response.config as InternalAxiosRequestConfig);
      pendingRequests.delete(requestKey);
      return response;
    },
    async (error: AxiosError<any>) => {
      // Handle duplicate request errors
      if (error && (error as any).isDuplicate) {
        try {
          return await (error as any).pendingRequest;
        } catch (err) {
          return Promise.reject(err);
        }
      }

      const originalRequest = error.config as InternalAxiosRequestConfig & {
        _retry?: boolean;
        _retryCount?: number;
      };

      if (!originalRequest) {
        return Promise.reject(handleApiError(error));
      }

      // Remove from pending requests on error
      const requestKey = getRequestKey(originalRequest);
      pendingRequests.delete(requestKey);

      // ========================================================================
      // HANDLE 401 UNAUTHORIZED - TOKEN REFRESH
      // ========================================================================
      if (error.response?.status === 401 && !originalRequest._retry) {
        if (isRefreshing) {
          // Queue the request while refresh is in progress
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then((token) => {
              if (originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${token}`;
              }
              return client(originalRequest);
            })
            .catch((err) => {
              return Promise.reject(err);
            });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          // Attempt to refresh the access token
          const newAccessToken = await TokenManager.refreshAccessToken();
          processQueue(null, newAccessToken);

          // Retry the original request with new token
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          }
          return client(originalRequest);
        } catch (refreshError) {
          // Token refresh failed - clear tokens and redirect to login
          processQueue(refreshError, null);
          TokenManager.clearTokens();

          // Only redirect if we're in a browser environment
          if (typeof window !== 'undefined') {
            window.location.href = '/auth/login';
          }

          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }

      // ========================================================================
      // RETRY LOGIC FOR NETWORK ERRORS AND IDEMPOTENT REQUESTS
      // ========================================================================
      const retryCount = originalRequest._retryCount || 0;
      const shouldRetry =
        retryCount < API_CONFIG.RETRY.MAX_RETRIES &&
        (
          // Retry network errors
          !error.response ||
          // Retry 5xx server errors for idempotent methods
          (error.response.status >= 500 && isIdempotentMethod(originalRequest.method))
        ) &&
        // Only retry idempotent methods (not POST)
        isIdempotentMethod(originalRequest.method);

      if (shouldRetry) {
        try {
          return await retryRequest(originalRequest, retryCount, client);
        } catch (retryError) {
          // All retries failed, return the error
          return Promise.reject(handleApiError(retryError as AxiosError<any>));
        }
      }

      // ========================================================================
      // NO RETRY FOR 4XX CLIENT ERRORS (except 401 handled above)
      // ========================================================================
      return Promise.reject(handleApiError(error));
    }
  );

  // ============================================================================
  // TRACK PENDING REQUESTS
  // ============================================================================
  client.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      const requestKey = getRequestKey(config);
      
      // Create a promise for this request and store it
      const requestPromise = client(config);
      pendingRequests.set(requestKey, requestPromise);

      return config;
    },
    (error) => Promise.reject(error)
  );
}
