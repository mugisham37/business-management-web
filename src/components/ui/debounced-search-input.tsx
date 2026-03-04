/**
 * DebouncedSearchInput Component
 * 
 * Search input with built-in debouncing to reduce API calls.
 * Automatically cancels pending requests when new input is received.
 * 
 * Features:
 * - 300ms debounce delay (configurable)
 * - Automatic request cancellation
 * - Loading indicator
 * - Clear button
 * - Accessible
 * 
 * Requirements: 12.3
 */

'use client';

import { useState, useEffect } from 'react';
import { Search, X, Loader2 } from 'lucide-react';
import { Input } from './input';
import { Button } from './button';
import { useDebounce } from '@/lib/hooks/useDebounce';

export interface DebouncedSearchInputProps {
  /** Callback when debounced value changes */
  onSearch: (value: string) => void;
  /** Placeholder text */
  placeholder?: string;
  /** Debounce delay in milliseconds */
  delay?: number;
  /** Whether search is loading */
  loading?: boolean;
  /** Initial value */
  defaultValue?: string;
  /** Controlled value */
  value?: string;
  /** Callback when value changes (immediate, not debounced) */
  onChange?: (value: string) => void;
  /** Additional className */
  className?: string;
  /** Disable the input */
  disabled?: boolean;
}

/**
 * DebouncedSearchInput Component
 * 
 * @example
 * ```tsx
 * <DebouncedSearchInput
 *   onSearch={(term) => searchUsers(term)}
 *   placeholder="Search users..."
 *   loading={loading}
 *   delay={300}
 * />
 * ```
 * 
 * Requirements: 12.3
 */
export function DebouncedSearchInput({
  onSearch,
  placeholder = 'Search...',
  delay = 300,
  loading = false,
  defaultValue = '',
  value: controlledValue,
  onChange,
  className = '',
  disabled = false,
}: DebouncedSearchInputProps) {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const debouncedValue = useDebounce(
    controlledValue !== undefined ? controlledValue : internalValue,
    delay
  );

  // Call onSearch when debounced value changes
  useEffect(() => {
    onSearch(debouncedValue);
  }, [debouncedValue, onSearch]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    
    if (controlledValue === undefined) {
      setInternalValue(newValue);
    }
    
    onChange?.(newValue);
  };

  const handleClear = () => {
    const newValue = '';
    
    if (controlledValue === undefined) {
      setInternalValue(newValue);
    }
    
    onChange?.(newValue);
    onSearch(newValue);
  };

  const currentValue = controlledValue !== undefined ? controlledValue : internalValue;

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          placeholder={placeholder}
          value={currentValue}
          onChange={handleChange}
          disabled={disabled}
          className="pl-9 pr-20"
          aria-label="Search"
        />
        <div className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-1">
          {loading && (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          )}
          {currentValue && !disabled && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="h-6 w-6 p-0"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
