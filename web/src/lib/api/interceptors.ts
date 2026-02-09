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
import { serializeRequestData, deserializeResponseData } from '@/lib/utils/serialization';

// Token refresh state management
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: any) => void;
}> = [];

/**
 * Log request details in development mode
 * @param config - Axios request configuration
 */
const logRequest = (config: InternalAxiosRequestConfig): void => {
  if (!API_CONFIG.LOGGING.LOG_REQUESTS) return;

  console.group(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
  console.log('URL:', `${config.baseURL}${config.url}`);
  console.log('Method:', config.method?.toUpperCase());
  
  if (config.headers) {
    const headers = { ...config.headers };
    // Mask sensitive headers
    if (headers.Authorization) {
      headers.Authorization = 'Bearer ***';
    }
    console.log('Headers:', headers);
  }
  
  if (config.params) {
    console.log('Params:', config.params);
  }
  
  if (config.data) {
    console.log('Data:', config.data);
  }
  
  console.groupEnd();
};

/**
 * Log response details in development mode
 * @param response - Axios response
 */
const logResponse = (response: AxiosResponse): void => {
  if (!API_CONFIG.LOGGING.LOG_RESPONSES) return;

  console.group(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`);
  console.log('Status:', response.status, response.statusText);
  console.log('Headers:', response.headers);
  console.log('Data:', response.data);
  console.groupEnd();
};

/**
 * Log error details with environment-specific verbosity
 * @param error - Axios error
 */
const logError = (error: AxiosError<any>): void => {
  if (!API_CONFIG.LOGGING.LOG_ERRORS) return;

  const config = error.config;
  const response = error.response;

  console.group(`❌ API Error: ${config?.method?.toUpperCase()} ${config?.url}`);
  
  if (response) {
    console.log('Status:', response.status, response.statusText);
    console.log('Error Data:', response.data);
  } else if (error.request) {
    console.log('Network Error:', 'No response received from server');
  } else {
    console.log('Request Setup Error:', error.message);
  }

  // Verbose error logging in development
  if (API_CONFIG.LOGGING.VERBOSE_ERRORS) {
    console.log('Full Error Object:', error);
    if (error.stack) {
      console.log('Stack Trace:', error.stack);
    }
  }

  console.groupEnd();
};

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
      // Log request in development mode
      logRequest(config);
      
      // Serialize request data (convert Date objects to ISO strings)
      if (config.data) {
        config.data = serializeRequestData(config.data);
      }
      
      // Add Authorization header if access token exists
      const token = TokenManager.getAccessToken();
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      return config;
    },
    (error) => {
      logError(error);
      return Promise.reject(error);
    }
  );

  // ============================================================================
  // RESPONSE INTERCEPTOR
  // ============================================================================
  client.interceptors.response.use(
    (response: AxiosResponse) => {
      // Log response in development mode
      logResponse(response);
      
      // Deserialize response data (convert ISO date strings to Date objects)
      if (response.data) {
        response.data = deserializeResponseData(response.data);
      }
      
      return response;
    },
    async (error: AxiosError<any>) => {
      // Log error with environment-specific verbosity
      logError(error);

      const originalRequest = error.config as InternalAxiosRequestConfig & {
        _retry?: boolean;
        _retryCount?: number;
      };

      if (!originalRequest) {
        return Promise.reject(handleApiError(error));
      }

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
            window.location.href = '/auth';
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
}
