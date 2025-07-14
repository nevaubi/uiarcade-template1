-- Allow admins to manage subscription admin status
CREATE POLICY "admins_can_manage_subscriber_admin_status" ON public.subscribers
FOR UPDATE
TO authenticated
USING (is_current_user_admin())
WITH CHECK (is_current_user_admin());