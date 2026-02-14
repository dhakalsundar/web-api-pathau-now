'use client';

import { useState, useCallback } from 'react';
import { ZodSchema } from 'zod';

export interface FormErrors {
  [key: string]: string | undefined;
}

interface UseFormValidationOptions {
  schema: ZodSchema;
  onValidationError?: (errors: FormErrors) => void;
  onValidationSuccess?: () => void;
}

/**
 * Custom hook for form validation with Zod
 * Provides validation, error management, and inline error display
 */
export function useFormValidation({
  schema,
  onValidationError,
  onValidationSuccess,
}: UseFormValidationOptions) {
  const [errors, setErrors] = useState<FormErrors>({});

  /**
   * Validate form data using Zod schema
   * Returns true if valid, false if invalid
   */
  const validate = useCallback(
    (data: unknown) => {
      const result = schema.safeParse(data);

      if (!result.success) {
        const newErrors: FormErrors = {};
        result.error.issues.forEach((error: any) => {
          const path = error.path[0];
          if (path) {
            newErrors[path] = error.message;
          }
        });
        setErrors(newErrors);
        onValidationError?.(newErrors);
        return false;
      }

      setErrors({});
      onValidationSuccess?.();
      return true;
    },
    [schema, onValidationError, onValidationSuccess]
  );

  /**
   * Clear error for a specific field
   */
  const clearFieldError = useCallback((fieldName: string) => {
    setErrors((prev) => ({ ...prev, [fieldName]: undefined }));
  }, []);

  /**
   * Clear all errors
   */
  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  /**
   * Get error message for a field
   */
  const getFieldError = useCallback(
    (fieldName: string): string | undefined => {
      return errors[fieldName];
    },
    [errors]
  );

  /**
   * Check if field has error
   */
  const hasFieldError = useCallback(
    (fieldName: string): boolean => {
      return !!errors[fieldName];
    },
    [errors]
  );

  /**
   * Check if form has any errors
   */
  const hasErrors = useCallback(() => {
    return Object.values(errors).some((error) => error !== undefined);
  }, [errors]);

  return {
    errors,
    validate,
    clearFieldError,
    clearErrors,
    getFieldError,
    hasFieldError,
    hasErrors,
  };
}
