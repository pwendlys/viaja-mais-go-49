
import { supabase } from '@/integrations/supabase/client';

interface RequestConfig {
  timeout?: number;
  retries?: number;
  retryDelay?: number;
}

class ApiMiddleware {
  private defaultTimeout = 30000; // 30 seconds
  private defaultRetries = 3;
  private defaultRetryDelay = 1000; // 1 second

  // Timeout wrapper for any async operation
  private withTimeout<T>(
    promise: Promise<T>, 
    timeoutMs: number = this.defaultTimeout
  ): Promise<T> {
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject(new Error(`Request timeout after ${timeoutMs}ms`));
      }, timeoutMs);
    });

    return Promise.race([promise, timeoutPromise]);
  }

  // Retry wrapper for failed requests
  private async withRetry<T>(
    fn: () => Promise<T>,
    retries: number = this.defaultRetries,
    delay: number = this.defaultRetryDelay
  ): Promise<T> {
    try {
      return await fn();
    } catch (error) {
      if (retries > 0) {
        console.warn(`Request failed, retrying in ${delay}ms. Retries left: ${retries - 1}`);
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.withRetry(fn, retries - 1, delay * 2); // Exponential backoff
      }
      throw error;
    }
  }

  // Enhanced Supabase query with timeout and retry
  async query<T>(
    queryFn: () => Promise<any>,
    config: RequestConfig = {}
  ): Promise<T> {
    const { timeout, retries, retryDelay } = {
      timeout: this.defaultTimeout,
      retries: this.defaultRetries,
      retryDelay: this.defaultRetryDelay,
      ...config
    };

    const wrappedQuery = () => this.withTimeout(queryFn(), timeout);
    
    try {
      const result = await this.withRetry(wrappedQuery, retries, retryDelay);
      
      if (result.error) {
        throw result.error;
      }
      
      return result.data;
    } catch (error) {
      console.error('API Query failed:', error);
      throw this.enhanceError(error);
    }
  }

  // Enhanced error with more context
  private enhanceError(error: any): Error {
    const enhanced = new Error();
    
    if (error?.message) {
      enhanced.message = error.message;
    } else if (typeof error === 'string') {
      enhanced.message = error;
    } else {
      enhanced.message = 'Unknown API error occurred';
    }

    // Add error context
    if (error?.code) {
      enhanced.name = `API_ERROR_${error.code}`;
    }

    // Preserve original error
    (enhanced as any).originalError = error;
    (enhanced as any).timestamp = new Date().toISOString();

    return enhanced;
  }

  // Health check endpoint
  async healthCheck(): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id')
        .limit(1);
      
      return !error;
    } catch (error) {
      console.error('Health check failed:', error);
      return false;
    }
  }

  // Network status check
  isOnline(): boolean {
    return navigator.onLine;
  }

  // Enhanced function invocation with timeout and retry
  async invokeFunction(
    functionName: string,
    args: any = {},
    config: RequestConfig = {}
  ): Promise<any> {
    if (!this.isOnline()) {
      throw new Error('No internet connection available');
    }

    return this.query(
      () => supabase.functions.invoke(functionName, { body: args }),
      config
    );
  }
}

export const apiMiddleware = new ApiMiddleware();

// Utility functions for common operations
export const withApiErrorHandling = async <T>(
  operation: () => Promise<T>,
  errorContext?: string
): Promise<T> => {
  try {
    return await operation();
  } catch (error) {
    console.error(`Error in ${errorContext || 'API operation'}:`, error);
    throw error;
  }
};

export const createHealthCheckMonitor = (
  onHealthChange: (isHealthy: boolean) => void,
  interval: number = 60000 // 1 minute
) => {
  let isMonitoring = false;
  let intervalId: NodeJS.Timeout;

  const startMonitoring = () => {
    if (isMonitoring) return;
    
    isMonitoring = true;
    intervalId = setInterval(async () => {
      const isHealthy = await apiMiddleware.healthCheck();
      onHealthChange(isHealthy);
    }, interval);
  };

  const stopMonitoring = () => {
    if (!isMonitoring) return;
    
    isMonitoring = false;
    if (intervalId) {
      clearInterval(intervalId);
    }
  };

  return { startMonitoring, stopMonitoring };
};
