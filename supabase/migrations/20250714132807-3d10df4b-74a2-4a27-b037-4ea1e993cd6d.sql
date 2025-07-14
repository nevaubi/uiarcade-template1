-- Add RLS policy to allow admins to update all profiles
CREATE POLICY "Admins can update all profiles" 
ON public.profiles 
FOR UPDATE 
TO authenticated
USING (is_current_user_admin())
WITH CHECK (is_current_user_admin());