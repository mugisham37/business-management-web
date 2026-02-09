/**
 * Serialization Utilities
 * 
 * Provides utilities for serializing and deserializing data for API communication.
 * 
 * Features:
 * - Date serialization to ISO 8601 format
 * - Date deserialization from ISO strings to Date objects
 * - Null/undefined value handling
 * - Nested object preservation
 * 
 * Requirements: 20.1, 20.2, 20.3, 20.4, 20.5
 */

/**
 * Serialize a Date object to ISO 8601 string format
 * 
 * @param date - Date object to serialize
 * @returns ISO 8601 formatted string
 * 
 * Requirement 20.1: WHEN sending dates in requests, THE API_Client SHALL serialize them to ISO 8601 format
 */
export function serializeDate(date: Date): string {
  if (!(date instanceof Date)) {
    throw new Error('serializeDate expects a Date object');
  }
  
  if (isNaN(date.getTime())) {
    throw new Error('serializeDate received an invalid Date object');
  }
  
  return date.toISOString();
}

/**
 * Deserialize an ISO 8601 string to a Date object
 * 
 * @param dateString - ISO 8601 formatted string
 * @returns Date object
 * 
 * Requirement 20.2: WHEN receiving dates in responses, THE API_Client SHALL parse them to Date objects
 */
export function deserializeDate(dateString: string): Date {
  if (typeof dateString !== 'string') {
    throw new Error('deserializeDate expects a string');
  }
  
  const date = new Date(dateString);
  
  if (isNaN(date.getTime())) {
    throw new Error(`deserializeDate received an invalid date string: ${dateString}`);
  }
  
  return date;
}

/**
 * Check if a value is a Date object
 * 
 * @param value - Value to check
 * @returns true if value is a Date object
 */
function isDate(value: any): value is Date {
  return value instanceof Date;
}

/**
 * Check if a value is a plain object (not an array, Date, or null)
 * 
 * @param value - Value to check
 * @returns true if value is a plain object
 */
function isPlainObject(value: any): boolean {
  return (
    value !== null &&
    typeof value === 'object' &&
    !Array.isArray(value) &&
    !(value instanceof Date)
  );
}

/**
 * Serialize request data for API transmission
 * Converts Date objects to ISO strings and preserves nested structures
 * 
 * @param data - Data to serialize
 * @returns Serialized data
 * 
 * Requirements:
 * - 20.1: Date serialization to ISO 8601
 * - 20.3: Null/undefined handling
 * - 20.4: Nested object preservation
 */
export function serializeRequestData(data: any): any {
  // Handle null and undefined
  if (data === null || data === undefined) {
    return data;
  }
  
  // Handle Date objects
  if (isDate(data)) {
    return serializeDate(data);
  }
  
  // Handle arrays
  if (Array.isArray(data)) {
    return data.map(item => serializeRequestData(item));
  }
  
  // Handle plain objects
  if (isPlainObject(data)) {
    const serialized: any = {};
    
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        const value = data[key];
        
        // Preserve null values, skip undefined values
        if (value === undefined) {
          continue;
        }
        
        serialized[key] = serializeRequestData(value);
      }
    }
    
    return serialized;
  }
  
  // Return primitive values as-is
  return data;
}

/**
 * Deserialize response data from API
 * Converts ISO date strings to Date objects and preserves nested structures
 * 
 * @param data - Data to deserialize
 * @returns Deserialized data
 * 
 * Requirements:
 * - 20.2: Date deserialization from ISO strings
 * - 20.3: Null/undefined handling
 * - 20.4: Nested object preservation
 */
export function deserializeResponseData(data: any): any {
  // Handle null and undefined
  if (data === null || data === undefined) {
    return data;
  }
  
  // Handle arrays
  if (Array.isArray(data)) {
    return data.map(item => deserializeResponseData(item));
  }
  
  // Handle plain objects
  if (isPlainObject(data)) {
    const deserialized: any = {};
    
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        const value = data[key];
        
        // Preserve null values
        if (value === null) {
          deserialized[key] = null;
          continue;
        }
        
        // Try to parse ISO date strings
        if (typeof value === 'string' && isISODateString(value)) {
          try {
            deserialized[key] = deserializeDate(value);
          } catch {
            // If parsing fails, keep as string
            deserialized[key] = value;
          }
        } else {
          deserialized[key] = deserializeResponseData(value);
        }
      }
    }
    
    return deserialized;
  }
  
  // Return primitive values as-is
  return data;
}

/**
 * Check if a string is in ISO 8601 date format
 * 
 * @param value - String to check
 * @returns true if string matches ISO 8601 format
 */
function isISODateString(value: string): boolean {
  // ISO 8601 format: YYYY-MM-DDTHH:mm:ss.sssZ or with timezone offset
  const isoDateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?([+-]\d{2}:\d{2})?$/;
  return isoDateRegex.test(value);
}
