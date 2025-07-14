
interface CachedSubscriptionData {
  subscribed: boolean;
  subscription_tier: string | null;
  subscription_end: string | null;
  cancel_at_period_end: boolean;
  cancellation_status: string | null;
  is_admin: boolean;
  timestamp: number;
}

class SubscriptionCache {
  private cache: Map<string, CachedSubscriptionData> = new Map();
  private readonly TTL = 5 * 60 * 1000; // 5 minutes
  private pendingRequests: Map<string, Promise<any>> = new Map();

  getCacheKey(userId: string): string {
    return `subscription_${userId}`;
  }

  isValid(data: CachedSubscriptionData): boolean {
    return Date.now() - data.timestamp < this.TTL;
  }

  get(userId: string): CachedSubscriptionData | null {
    const key = this.getCacheKey(userId);
    const cached = this.cache.get(key);
    
    if (cached && this.isValid(cached)) {
      return cached;
    }
    
    if (cached) {
      this.cache.delete(key);
    }
    
    return null;
  }

  set(userId: string, data: Omit<CachedSubscriptionData, 'timestamp'>): void {
    const key = this.getCacheKey(userId);
    this.cache.set(key, {
      ...data,
      timestamp: Date.now()
    });
  }

  // Prevent duplicate requests for the same user
  getPendingRequest(userId: string): Promise<any> | null {
    return this.pendingRequests.get(userId) || null;
  }

  setPendingRequest(userId: string, promise: Promise<any>): void {
    this.pendingRequests.set(userId, promise);
    promise.finally(() => {
      this.pendingRequests.delete(userId);
    });
  }

  clear(): void {
    this.cache.clear();
    this.pendingRequests.clear();
  }
}

export const subscriptionCache = new SubscriptionCache();

// Debounce utility
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Exponential backoff for rate limiting
export async function withExponentialBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await fn();
    } catch (error: any) {
      // Check if it's a rate limit error
      const isRateLimit = 
        error?.message?.includes('rate limit') ||
        error?.message?.includes('429') ||
        error?.status === 429;

      if (!isRateLimit || i === maxRetries) {
        throw error;
      }

      // Wait with exponential backoff
      const delay = baseDelay * Math.pow(2, i);
      console.log(`Rate limited, retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw new Error('Max retries exceeded');
}
