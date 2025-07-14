-- Fix RLS policies for admin operations on subscribers table

-- Allow admins to view all subscriber records (not just their own)
CREATE POLICY "admins_can_view_all_subscribers" ON public.subscribers
FOR SELECT 
TO authenticated
USING (is_current_user_admin());

-- Allow admins to insert subscriber records for any user
CREATE POLICY "admins_can_insert_subscribers" ON public.subscribers
FOR INSERT 
TO authenticated
WITH CHECK (is_current_user_admin());

-- Allow admins to update any subscriber record (broader than just admin status)
CREATE POLICY "admins_can_update_all_subscriber_data" ON public.subscribers
FOR UPDATE 
TO authenticated
USING (is_current_user_admin())
WITH CHECK (is_current_user_admin());

-- Remove the restrictive admin policy that only allowed admin status updates
DROP POLICY IF EXISTS "admins_can_manage_subscriber_admin_status" ON public.subscribers;