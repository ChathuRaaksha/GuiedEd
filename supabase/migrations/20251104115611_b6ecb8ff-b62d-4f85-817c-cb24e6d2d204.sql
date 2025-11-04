-- Drop ALL existing RLS policies on the three tables
DROP POLICY IF EXISTS "Authenticated users can create facilitator profiles" ON public.facilitators;
DROP POLICY IF EXISTS "Facilitators can update their own profile" ON public.facilitators;
DROP POLICY IF EXISTS "Facilitators can view their own profile" ON public.facilitators;
DROP POLICY IF EXISTS "admin_all_facilitators" ON public.facilitators;
DROP POLICY IF EXISTS "admin_select_facilitators" ON public.facilitators;

DROP POLICY IF EXISTS "Authenticated users can create mentor profiles" ON public.mentors;
DROP POLICY IF EXISTS "Facilitators can view mentors" ON public.mentors;
DROP POLICY IF EXISTS "Mentors can update their own profile" ON public.mentors;
DROP POLICY IF EXISTS "Mentors can view their own profile" ON public.mentors;
DROP POLICY IF EXISTS "Students can view matched mentors" ON public.mentors;
DROP POLICY IF EXISTS "admin_all_mentors" ON public.mentors;
DROP POLICY IF EXISTS "admin_select_mentors" ON public.mentors;

DROP POLICY IF EXISTS "Authenticated users can create student profiles" ON public.students;
DROP POLICY IF EXISTS "Facilitators can view students" ON public.students;
DROP POLICY IF EXISTS "Mentors can view matched students" ON public.students;
DROP POLICY IF EXISTS "Students can update their own profile" ON public.students;
DROP POLICY IF EXISTS "Students can view their own profile" ON public.students;
DROP POLICY IF EXISTS "admin_all_students" ON public.students;
DROP POLICY IF EXISTS "admin_select_students" ON public.students;

-- Create simple, non-recursive policies for students
CREATE POLICY "students_own_profile" ON public.students
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "students_admin_access" ON public.students
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

CREATE POLICY "students_facilitator_view" ON public.students
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'FACILITATOR'::app_role
  )
);

-- Create simple, non-recursive policies for mentors
CREATE POLICY "mentors_own_profile" ON public.mentors
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "mentors_admin_access" ON public.mentors
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

CREATE POLICY "mentors_facilitator_view" ON public.mentors
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'FACILITATOR'::app_role
  )
);

-- Create simple, non-recursive policies for facilitators
CREATE POLICY "facilitators_own_profile" ON public.facilitators
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "facilitators_admin_access" ON public.facilitators
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