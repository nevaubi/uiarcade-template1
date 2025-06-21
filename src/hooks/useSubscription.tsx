import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { subscriptionCache, debounce, withExponentialBackoff } from '@/utils/subscriptionCache';
import { useIsMobile } from '@/hooks/use-mobile';

interface SubscriptionData {
  subscribed: boolean;
  subscription_tier: string | null;
  subscription_end: string | null;
}

export const useSubscription = () => {
  const { user, session } = useAuth();
  const isMobile = useIsMobile();
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionData>({
    subscribed: false,
    subscription_tier: null,
    subscription_end: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);
  
  // Track the last user ID to detect meaningful changes
  const lastUserIdRef = useRef<string | null>(null);

  const checkSubscriptionInternal = async (forceRefresh: boolean = false): Promise<void> => {
    if (!user || !session) {
      setSubscriptionData({
        subscribed: false,
        subscription_tier: null,
        subscription_end: null,
      });
      setLoading(false);
      setError(null);
      return;
    }

    try {
      setError(null);
      
      // Check cache first (unless forced refresh)
      if (!forceRefresh) {
        const cached = subscriptionCache.get(user.id);
        if (cached) {
          console.log('Using cached subscription data');
          setSubscriptionData({
            subscribed: cached.subscribed,
            subscription_tier: cached.subscription_tier,
            subscription_end: cached.subscription_end,
          });
          setLoading(false);
          return;
        }

        // Check if there's already a pending request for this user
        const pendingRequest = subscriptionCache.getPendingRequest(user.id);
        if (pendingRequest) {
          console.log('Waiting for existing subscription request');
          await pendingRequest;
          // After the pending request completes, try to get from cache
          const cachedAfterPending = subscriptionCache.get(user.id);
          if (cachedAfterPending) {
            setSubscriptionData({
              subscribed: cachedAfterPending.subscribed,
              subscription_tier: cachedAfterPending.subscription_tier,
              subscription_end: cachedAfterPending.subscription_end,
            });
          }
          setLoading(false);
          return;
        }
      }

      console.log('Fetching fresh subscription data...');
      
      const requestPromise = withExponentialBackoff(async () => {
        const { data, error } = await supabase.functions.invoke('check-subscription', {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        });

        if (error) {
          console.error('Error checking subscription:', error);
          throw error;
        }

        return data;
      });

      // Cache the request promise to prevent duplicates
      subscriptionCache.setPendingRequest(user.id, requestPromise);

      const data = await requestPromise;

      console.log('Subscription data received:', data);
      
      const newSubscriptionData = {
        subscribed: data.subscribed || false,
        subscription_tier: data.subscription_tier || null,
        subscription_end: data.subscription_end || null,
      };

      // Update cache
      subscriptionCache.set(user.id, newSubscriptionData);
      
      setSubscriptionData(newSubscriptionData);
    } catch (error: any) {
      console.error('Error in checkSubscription:', error);
      
      // Handle rate limiting more gracefully
      if (error?.message?.includes('rate limit') || error?.message?.includes('429')) {
        setError('Too many requests. Please wait a moment before refreshing.');
      } else {
        setError('Failed to check subscription status. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Debounced version of checkSubscription
  const debouncedCheckSubscription = useCallback(
    debounce((forceRefresh: boolean = false) => {
      checkSubscriptionInternal(forceRefresh);
    }, 500),
    [user?.id, session?.access_token]
  );

  // Public method for manual refresh
  const checkSubscription = useCallback((forceRefresh: boolean = false) => {
    setLoading(true);
    debouncedCheckSubscription(forceRefresh);
  }, [debouncedCheckSubscription]);

  const createCheckout = async (priceId: string) => {
    if (!session) {
      console.error('Mobile checkout error: No session available');
      throw new Error('User not authenticated');
    }
    if (checkoutLoading) {
      console.log('Mobile checkout: Already processing, ignoring duplicate request');
      return;
    }

    console.log('Mobile checkout: Starting checkout process', { 
      isMobile, 
      priceId, 
      userAgent: navigator.userAgent,
      sessionExists: !!session 
    });

    setCheckoutLoading(true);
    
    try {
      console.log('Mobile checkout: Creating checkout session for price:', priceId);
      
      // Add more detailed error logging for mobile
      const invokeResult = await supabase.functions.invoke('create-checkout', {
        body: { priceId },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
          'User-Agent': navigator.userAgent, // Include user agent for debugging
        },
      });

      console.log('Mobile checkout: Edge function response:', invokeResult);

      if (invokeResult.error) {
        console.error('Mobile checkout: Edge function error:', invokeResult.error);
        throw new Error(`Checkout creation failed: ${invokeResult.error.message || 'Unknown error'}`);
      }

      const data = invokeResult.data;
      if (!data || !data.url) {
        console.error('Mobile checkout: No URL returned from edge function', data);
        throw new Error('No checkout URL received from server');
      }

      console.log('Mobile checkout: Received checkout URL:', data.url);

      // Mobile-friendly navigation with additional logging
      if (isMobile) {
        console.log('Mobile checkout: Redirecting in same tab (mobile detected)');
        // On mobile, redirect in same tab to avoid pop-up blocking
        window.location.href = data.url;
      } else {
        console.log('Mobile checkout: Opening in new tab (desktop detected)');
        // On desktop, open in new tab
        const newWindow = window.open(data.url, '_blank');
        if (!newWindow) {
          console.warn('Desktop checkout: Pop-up blocked, falling back to same-tab redirect');
          window.location.href = data.url;
        }
      }
    } catch (error: any) {
      console.error('Mobile checkout: Full error details:', {
        message: error.message,
        stack: error.stack,
        error: error,
        isMobile,
        sessionExists: !!session,
        userAgent: navigator.userAgent
      });
      throw error;
    } finally {
      setCheckoutLoading(false);
    }
  };

  const openCustomerPortal = async () => {
    if (!session) {
      console.error('Mobile portal error: No session available');
      throw new Error('User not authenticated');
    }
    if (portalLoading) {
      console.log('Mobile portal: Already processing, ignoring duplicate request');
      return;
    }

    console.log('Mobile portal: Starting portal process', { 
      isMobile, 
      userAgent: navigator.userAgent,
      sessionExists: !!session 
    });

    setPortalLoading(true);

    try {
      console.log('Mobile portal: Opening customer portal...');
      
      const invokeResult = await supabase.functions.invoke('customer-portal', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
          'User-Agent': navigator.userAgent,
        },
      });

      console.log('Mobile portal: Edge function response:', invokeResult);

      if (invokeResult.error) {
        console.error('Mobile portal: Edge function error:', invokeResult.error);
        throw new Error(`Portal creation failed: ${invokeResult.error.message || 'Unknown error'}`);
      }

      const data = invokeResult.data;
      if (!data || !data.url) {
        console.error('Mobile portal: No URL returned from edge function', data);
        throw new Error('No portal URL received from server');
      }

      console.log('Mobile portal: Received portal URL:', data.url);

      // Mobile-friendly navigation
      if (isMobile) {
        console.log('Mobile portal: Redirecting in same tab (mobile detected)');
        window.location.href = data.url;
      } else {
        console.log('Mobile portal: Opening in new tab (desktop detected)');
        const newWindow = window.open(data.url, '_blank');
        if (!newWindow) {
          console.warn('Desktop portal: Pop-up blocked, falling back to same-tab redirect');
          window.location.href = data.url;
        }
      }
    } catch (error: any) {
      console.error('Mobile portal: Full error details:', {
        message: error.message,
        stack: error.stack,
        error: error,
        isMobile,
        sessionExists: !!session,
        userAgent: navigator.userAgent
      });
      throw error;
    } finally {
      setPortalLoading(false);
    }
  };

  useEffect(() => {
    // Only trigger if the user ID actually changed (meaningful change)
    const currentUserId = user?.id || null;
    
    if (currentUserId !== lastUserIdRef.current) {
      console.log('User changed, checking subscription...', { 
        old: lastUserIdRef.current, 
        new: currentUserId 
      });
      lastUserIdRef.current = currentUserId;
      
      if (currentUserId) {
        checkSubscriptionInternal();
      } else {
        // User logged out, clear cache and reset state
        subscriptionCache.clear();
        setSubscriptionData({
          subscribed: false,
          subscription_tier: null,
          subscription_end: null,
        });
        setLoading(false);
        setError(null);
      }
    }
  }, [user?.id]);

  return {
    ...subscriptionData,
    loading,
    error,
    checkoutLoading,
    portalLoading,
    checkSubscription,
    createCheckout,
    openCustomerPortal,
  };
};
