
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

interface RateLimitConfig {
  maxRequests: number;
  windowMinutes: number;
  identifier: string;
  endpoint: string;
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: Date;
  message?: string;
}

export class RateLimiter {
  private supabase;

  constructor() {
    this.supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );
  }

  async checkRateLimit(config: RateLimitConfig): Promise<RateLimitResult> {
    const { maxRequests, windowMinutes, identifier, endpoint } = config;
    const windowStart = new Date();
    windowStart.setMinutes(windowStart.getMinutes() - windowMinutes);

    try {
      // Check current count for this identifier/endpoint combination
      const { data: existingRecord, error: fetchError } = await this.supabase
        .from('rate_limits')
        .select('*')
        .eq('identifier', identifier)
        .eq('endpoint', endpoint)
        .gte('window_start', windowStart.toISOString())
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Rate limit fetch error:', fetchError);
        // Allow request on database error to avoid blocking legitimate traffic
        return { allowed: true, remaining: maxRequests - 1, resetTime: new Date() };
      }

      const now = new Date();
      
      if (!existingRecord) {
        // No existing record, create new one
        const { error: insertError } = await this.supabase
          .from('rate_limits')
          .insert({
            identifier,
            endpoint,
            request_count: 1,
            window_start: now.toISOString()
          });

        if (insertError) {
          console.error('Rate limit insert error:', insertError);
          return { allowed: true, remaining: maxRequests - 1, resetTime: now };
        }

        return { 
          allowed: true, 
          remaining: maxRequests - 1, 
          resetTime: new Date(now.getTime() + windowMinutes * 60000)
        };
      }

      // Check if we're within limits
      if (existingRecord.request_count >= maxRequests) {
        const resetTime = new Date(new Date(existingRecord.window_start).getTime() + windowMinutes * 60000);
        return {
          allowed: false,
          remaining: 0,
          resetTime,
          message: `Rate limit exceeded. Try again in ${Math.ceil((resetTime.getTime() - now.getTime()) / 1000)} seconds.`
        };
      }

      // Increment counter
      const { error: updateError } = await this.supabase
        .from('rate_limits')
        .update({ 
          request_count: existingRecord.request_count + 1,
          updated_at: now.toISOString()
        })
        .eq('id', existingRecord.id);

      if (updateError) {
        console.error('Rate limit update error:', updateError);
        return { allowed: true, remaining: maxRequests - existingRecord.request_count - 1, resetTime: now };
      }

      const resetTime = new Date(new Date(existingRecord.window_start).getTime() + windowMinutes * 60000);
      
      return {
        allowed: true,
        remaining: maxRequests - existingRecord.request_count - 1,
        resetTime
      };

    } catch (error) {
      console.error('Rate limiter error:', error);
      // Allow request on unexpected errors
      return { allowed: true, remaining: maxRequests - 1, resetTime: new Date() };
    }
  }

  async cleanup(): Promise<void> {
    try {
      await this.supabase.rpc('cleanup_old_rate_limits');
    } catch (error) {
      console.error('Rate limit cleanup error:', error);
    }
  }
}

export function getRateLimitHeaders(result: RateLimitResult): Record<string, string> {
  return {
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': Math.ceil(result.resetTime.getTime() / 1000).toString(),
    'Retry-After': result.allowed ? '0' : Math.ceil((result.resetTime.getTime() - Date.now()) / 1000).toString()
  };
}

export function getIdentifier(req: Request, userId?: string): string {
  if (userId) return `user:${userId}`;
  
  // Try to get IP from various headers
  const forwardedFor = req.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return `ip:${forwardedFor.split(',')[0].trim()}`;
  }
  
  const realIP = req.headers.get('x-real-ip');
  if (realIP) {
    return `ip:${realIP}`;
  }
  
  // Fallback to a generic identifier
  return `ip:unknown`;
}
