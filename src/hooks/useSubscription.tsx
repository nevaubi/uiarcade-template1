
import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { subscriptionCache, debounce, withExponentialBackoff } from '@/utils/subscriptionCache';
import { useIsMobile } from '@/hooks/use-mobile';

interface SubscriptionData {
  subscribed: boolean;
  subscription_tier: string | null;
  subscription_end: string | null;
  cancel_at_period_end: boolean;
  cancellation_status: string | null;
  is_admin: boolean;
}

export const useSubscription = () => {
  const { user, session } = useAuth();
  const isMobile = useIsMobile();
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionData>({
    subscribed: false,
    subscription_tier: null,
    subscription_end: null,
    cancel_at_period_end: false,
    cancellation_status: null,
    is_admin: false,
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
        cancel_at_period_end: false,
        cancellation_status: null,
        is_admin: false,
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
            cancel_at_period_end: cached.cancel_at_period_end,
            cancellation_status: cached.cancellation_status,
            is_admin: cached.is_admin,
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
              cancel_at_period_end: cachedAfterPending.cancel_at_period_end,
              cancellation_status: cachedAfterPending.cancellation_status,
              is_admin: cachedAfterPending.is_admin,
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
        cancel_at_period_end: data.cancel_at_period_end || false,
        cancellation_status: data.cancellation_status || null,
        is_admin: data.is_admin || false,
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
    if (!session) throw new Error('User not authenticated');
    if (checkoutLoading) return; // Prevent multiple clicks

    setCheckoutLoading(true);
    
    try {
      console.log('Creating checkout session for price:', priceId);
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { priceId },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        console.error('Error creating checkout:', error);
        throw error;
      }

      // Mobile-friendly navigation
      if (isMobile) {
        // On mobile, redirect in same tab to avoid pop-up blocking
        console.log('Mobile detected: redirecting in same tab');
        window.location.href = data.url;
      } else {
        // On desktop, open in new tab
        console.log('Desktop detected: opening in new tab');
        window.open(data.url, '_blank');
      }
    } finally {
      setCheckoutLoading(false);
    }
  };

  const openCustomerPortal = async () => {
    if (!session) throw new Error('User not authenticated');
    if (portalLoading) return; // Prevent multiple clicks

    setPortalLoading(true);

    try {
      console.log('Opening customer portal...');
      const { data, error } = await supabase.functions.invoke('customer-portal', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        console.error('Error opening customer portal:', error);
        throw error;
      }

      // Mobile-friendly navigation
      if (isMobile) {
        // On mobile, redirect in same tab to avoid pop-up blocking
        console.log('Mobile detected: redirecting to portal in same tab');
        window.location.href = data.url;
      } else {
        // On desktop, open in new tab
        console.log('Desktop detected: opening portal in new tab');
        window.open(data.url, '_blank');
        
        // Set up a listener to refresh subscription when user returns
        const checkFocus = () => {
          if (!document.hidden) {
            console.log('Window focused after portal, refreshing subscription...');
            checkSubscriptionInternal(true);
            document.removeEventListener('visibilitychange', checkFocus);
          }
        };
        
        // Add a slight delay to ensure user has had time to make changes
        setTimeout(() => {
          document.addEventListener('visibilitychange', checkFocus);
        }, 1000);
      }
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
          cancel_at_period_end: false,
          cancellation_status: null,
          is_admin: false,
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
