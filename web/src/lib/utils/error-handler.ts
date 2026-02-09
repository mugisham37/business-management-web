// Error Handling Utilities for Frontend-Backend Foundation Layer
// Provides utilities for handling API errors and transforming them into user-friendly messages

import { AxiosError } from 'axios';
import { ApiError } from '@/types/api/responses';

/**
 * Handles Axios errors and transforms them into standardized ApiError format
 * 
 * @param error - The Axios error object
 * @returns Standardized ApiError object
 * 
 * Requirements: 9.1, 9.2, 9.4, 9.5, 9.6
 */
export function handleApiError(error: AxiosError<ApiError>): ApiError {
  if (error.response) {
    // Server responded with error (4xx, 5xx)
    return error.response.data;
  } else if (error.request) {
    // Request made but no response received (network error)
    return {
      statusCode: 0,
      message: 'Network error. Please check your connection.',
      error: 'NetworkError',
      timestamp: new Date().toISOString(),
    };
  } else {
    // Error setting up request
    return {
      statusCode: 0,
      message: error.message || 'An unexpected error occurred',
      error: 'UnknownError',
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Extracts a user-friendly error message from an ApiError object
 * Handles both single string messages and arrays of validation messages
 * 
 * @param error - The ApiError object
 * @returns User-friendly error message string
 * 
 * Requirements: 9.2, 18.7
 */
export function getErrorMessage(error: ApiError): string {
  if (Array.isArray(error.message)) {
    return error.message.join(', ');
  }
  return error.message;
}

/**
 * Checks if an error is a validation error (400 Bad Request)
 * 
 * @param error - The ApiError object
 * @returns True if the error is a validation error
 * 
 * Requirements: 9.2
 */
export function isValidationError(error: ApiError): boolean {
  return error.statusCode === 400;
}

/**
 * Checks if an error is an authentication error (401 Unauthorized)
 * 
 * @param error - The ApiError object
 * @returns True if the error is an authentication error
 * 
 * Requirements: 9.3
 */
export function isAuthError(error: ApiError): boolean {
  return error.statusCode === 401;
}

/**
 * Checks if an error is a forbidden error (403 Forbidden)
 * 
 * @param error - The ApiError object
 * @returns True if the error is a forbidden error
 * 
 * Requirements: 9.4
 */
export function isForbiddenError(error: ApiError): boolean {
  return error.statusCode === 403;
}

/**
 * Checks if an error is a not found error (404 Not Found)
 * 
 * @param error - The ApiError object
 * @returns True if the error is a not found error
 * 
 * Requirements: 9.5
 */
export function isNotFoundError(error: ApiError): boolean {
  return error.statusCode === 404;
}

/**
 * Checks if an error is a server error (5xx)
 * 
 * @param error - The ApiError object
 * @returns True if the error is a server error
 * 
 * Requirements: 9.6
 */
export function isServerError(error: ApiError): boolean {
  return error.statusCode >= 500;
}
