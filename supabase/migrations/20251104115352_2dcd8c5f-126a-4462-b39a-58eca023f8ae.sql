-- Drop all existing RLS policies that might be causing issues
DROP POLICY IF EXISTS "Admins can view all students" ON public.students;
DROP POLICY IF EXISTS "Admins can manage students" ON public.students;
DROP POLICY IF EXISTS "Admins can view all mentors" ON public.mentors;
DROP POLICY IF EXISTS "Admins can manage mentors" ON public.mentors;
DROP POLICY IF EXISTS "Admins can view all facilitators" ON public.facilitators;
DROP POLICY IF EXISTS "Admins can manage facilitators" ON public.facilitators;

-- Create new simple admin policies for students
CREATE POLICY "admin_select_students" ON public.students
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'ADMIN'::app_role
  )
);

CREATE POLICY "admin_all_students" ON public.students
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'ADMIN'::app_role
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'ADMIN'::app_role
  )
);

-- Create new simple admin policies for mentors
CREATE POLICY "admin_select_mentors" ON public.mentors
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'ADMIN'::app_role
  )
);

CREATE POLICY "admin_all_mentors" ON public.mentors
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'ADMIN'::app_role
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'ADMIN'::app_role
  )
);

-- Create new simple admin policies for facilitators
CREATE POLICY "admin_select_facilitators" ON public.facilitators
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'ADMIN'::app_role
  )
);

CREATE POLICY "admin_all_facilitators" ON public.facilitators
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'ADMIN'::app_role
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'ADMIN'::app_role
  )
);