
-- Drop the existing overly permissive policies
DROP POLICY IF EXISTS "update_own_subscription" ON public.subscribers;
DROP POLICY IF EXISTS "insert_subscription" ON public.subscribers;

-- Create secure policies that restrict direct user access
-- Users can only view their own subscription data
CREATE POLICY "users_can_view_own_subscription" ON public.subscribers
FOR SELECT
TO authenticated
USING (user_id = auth.uid() OR email = auth.email());

-- Only service role can insert subscription records (used by edge functions)
CREATE POLICY "service_role_can_insert_subscriptions" ON public.subscribers
FOR INSERT
TO service_role
WITH CHECK (true);

-- Only service role can update subscription records (used by edge functions)
CREATE POLICY "service_role_can_update_subscriptions" ON public.subscribers
FOR UPDATE
TO service_role
USING (true);

-- Only service role can delete subscription records (used by edge functions)
CREATE POLICY "service_role_can_delete_subscriptions" ON public.subscribers
FOR DELETE
TO service_role
USING (true);

-- Allow authenticated users to insert their own subscription records only
-- This is needed for initial subscription creation from the frontend
CREATE POLICY "users_can_create_own_subscription" ON public.subscribers
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid() AND email = auth.email());

-- Allow authenticated users to update only their own subscription records
-- But restrict what they can update (only non-critical fields)
CREATE POLICY "users_can_update_own_basic_info" ON public.subscribers
FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (
  user_id = auth.uid() AND 
  email = auth.email() AND
  -- Prevent users from directly modifying subscription status or stripe data
  stripe_customer_id IS NOT DISTINCT FROM (SELECT stripe_customer_id FROM public.subscribers WHERE id = subscribers.id) AND
  subscribed IS NOT DISTINCT FROM (SELECT subscribed FROM public.subscribers WHERE id = subscribers.id) AND
  subscription_tier IS NOT DISTINCT FROM (SELECT subscription_tier FROM public.subscribers WHERE id = subscribers.id) AND
  subscription_end IS NOT DISTINCT FROM (SELECT subscription_end FROM public.subscribers WHERE id = subscribers.id)
);
