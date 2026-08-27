/**
 * Retry helper for handling concurrent slug conflicts
 */

export interface RetryOptions {
  maxAttempts?: number;
  shouldRetry?: (error: unknown) => boolean;
}

const DEFAULT_MAX_ATTEMPTS = 5;

/**
 * Checks if error is a MySQL duplicate entry error (code 1062)
 */
export function isDuplicateKeyError(error: unknown): boolean {
  if (typeof error === 'object' && error !== null) {
    const err = error as { code?: string; errno?: number };
    return err.code === 'ER_DUP_ENTRY' || err.errno === 1062;
  }
  return false;
}

/**
 * Retry an async operation with exponential backoff
 * Useful for handling race conditions in slug generation
 */
export async function retryOnDuplicateKey<T>(
  operation: () => Promise<T>,
  options: RetryOptions = {},
): Promise<T> {
  const maxAttempts = options.maxAttempts ?? DEFAULT_MAX_ATTEMPTS;
  const shouldRetry = options.shouldRetry ?? isDuplicateKeyError;

  let lastError: unknown;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      
      // Only retry if it's a duplicate key error and we have attempts left
      if (shouldRetry(error) && attempt < maxAttempts) {
        // Small exponential backoff to reduce collision probability
        const delayMs = Math.min(50 * Math.pow(2, attempt - 1), 500);
        await new Promise((resolve) => setTimeout(resolve, delayMs));
        continue;
      }
      
      // If not a retryable error or max attempts reached, throw
      throw error;
    }
  }
  
  throw lastError;
}
