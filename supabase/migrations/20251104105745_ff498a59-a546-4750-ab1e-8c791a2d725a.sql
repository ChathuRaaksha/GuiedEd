-- Update RLS policies to allow admins full access to all tables

-- Students table: Allow admins to view, update, and delete
CREATE POLICY "Admins can manage students"
ON public.students
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'ADMIN'::app_role))
WITH CHECK (has_role(auth.uid(), 'ADMIN'::app_role));

-- Mentors table: Allow admins to view, update, and delete
CREATE POLICY "Admins can manage mentors"
ON public.mentors
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'ADMIN'::app_role))
WITH CHECK (has_role(auth.uid(), 'ADMIN'::app_role));

-- Facilitators table: Allow admins to view, update, and delete
CREATE POLICY "Admins can manage facilitators"
ON public.facilitators
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'ADMIN'::app_role))
WITH CHECK (has_role(auth.uid(), 'ADMIN'::app_role));

-- Profiles table: Allow admins to view all profiles
CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'ADMIN'::app_role));

-- Invites table: Allow admins full access
CREATE POLICY "Admins can manage invites"
ON public.invites
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'ADMIN'::app_role))
WITH CHECK (has_role(auth.uid(), 'ADMIN'::app_role));