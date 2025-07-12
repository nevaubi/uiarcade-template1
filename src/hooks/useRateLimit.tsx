
import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

interface RateLimitInfo {
  remaining: number;
  resetTime: number;
  retryAfter: number;
}

export const useRateLimit = () => {
  const [rateLimitInfo, setRateLimitInfo] = useState<RateLimitInfo | null>(null);
  const { toast } = useToast();

  const handleRateLimitResponse = useCallback((response: Response) => {
    const remaining = parseInt(response.headers.get('X-RateLimit-Remaining') || '0');
    const resetTime = parseInt(response.headers.get('X-RateLimit-Reset') || '0');
    const retryAfter = parseInt(response.headers.get('Retry-After') || '0');

    const info: RateLimitInfo = {
      remaining,
      resetTime,
      retryAfter
    };

    setRateLimitInfo(info);

    if (response.status === 429) {
      const resetDate = new Date(resetTime * 1000);
      const timeUntilReset = Math.ceil((resetDate.getTime() - Date.now()) / 1000);
      
      toast({
        title: "Rate Limit Exceeded",
        description: `Please wait ${timeUntilReset} seconds before trying again.`,
        variant: "destructive",
      });
    }

    return info;
  }, [toast]);

  const isRateLimited = rateLimitInfo?.remaining === 0;
  const timeUntilReset = rateLimitInfo 
    ? Math.max(0, Math.ceil((rateLimitInfo.resetTime * 1000 - Date.now()) / 1000))
    : 0;

  return {
    rateLimitInfo,
    isRateLimited,
    timeUntilReset,
    handleRateLimitResponse,
  };
};
