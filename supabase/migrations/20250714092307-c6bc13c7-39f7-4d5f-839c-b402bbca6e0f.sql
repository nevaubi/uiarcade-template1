
-- Drop the vulnerable policy that allows users to modify their admin status
DROP POLICY IF EXISTS "users_can_update_own_basic_info" ON public.subscribers;

-- Create the secure version with is_admin protection
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
  subscription_end IS NOT DISTINCT FROM (SELECT subscription_end FROM public.subscribers WHERE id = subscribers.id) AND
  -- Critical fix: Prevent users from modifying their admin status
  is_admin IS NOT DISTINCT FROM (SELECT is_admin FROM public.subscribers WHERE id = subscribers.id)
);
