
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface SubscriptionData {
  subscribed: boolean;
  subscription_tier: string | null;
  subscription_end: string | null;
}

export const useSubscription = () => {
  const { user, session } = useAuth();
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionData>({
    subscribed: false,
    subscription_tier: null,
    subscription_end: null,
  });
  const [loading, setLoading] = useState(true);

  const checkSubscription = async () => {
    if (!user || !session) {
      setLoading(false);
      return;
    }

    try {
      console.log('Checking subscription status...');
      const { data, error } = await supabase.functions.invoke('check-subscription', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        console.error('Error checking subscription:', error);
        return;
      }

      console.log('Subscription data received:', data);
      setSubscriptionData({
        subscribed: data.subscribed || false,
        subscription_tier: data.subscription_tier || null,
        subscription_end: data.subscription_end || null,
      });
    } catch (error) {
      console.error('Error in checkSubscription:', error);
    } finally {
      setLoading(false);
    }
  };

  const createCheckout = async (priceId: string) => {
    if (!session) throw new Error('User not authenticated');

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

    // Open Stripe checkout in a new tab
    window.open(data.url, '_blank');
  };

  const openCustomerPortal = async () => {
    if (!session) throw new Error('User not authenticated');

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

    // Open customer portal in a new tab
    window.open(data.url, '_blank');
  };

  useEffect(() => {
    checkSubscription();
  }, [user, session]);

  return {
    ...subscriptionData,
    loading,
    checkSubscription,
    createCheckout,
    openCustomerPortal,
  };
};
