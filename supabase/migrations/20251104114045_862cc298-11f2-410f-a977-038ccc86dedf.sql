-- Ensure admins can SELECT from all tables explicitly

-- Drop and recreate admin policies with explicit SELECT for students
DROP POLICY IF EXISTS "Admins can manage students" ON public.students;

CREATE POLICY "Admins can view all students"
ON public.students
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'ADMIN'::app_role));

CREATE POLICY "Admins can manage students"
ON public.students
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'ADMIN'::app_role))
WITH CHECK (has_role(auth.uid(), 'ADMIN'::app_role));

-- Drop and recreate admin policies with explicit SELECT for mentors
DROP POLICY IF EXISTS "Admins can manage mentors" ON public.mentors;

CREATE POLICY "Admins can view all mentors"
ON public.mentors
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'ADMIN'::app_role));

CREATE POLICY "Admins can manage mentors"
ON public.mentors
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'ADMIN'::app_role))
WITH CHECK (has_role(auth.uid(), 'ADMIN'::app_role));

-- Drop and recreate admin policies with explicit SELECT for facilitators
DROP POLICY IF EXISTS "Admins can manage facilitators" ON public.facilitators;

CREATE POLICY "Admins can view all facilitators"
ON public.facilitators
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'ADMIN'::app_role));

CREATE POLICY "Admins can manage facilitators"
ON public.facilitators
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'ADMIN'::app_role))
WITH CHECK (has_role(auth.uid(), 'ADMIN'::app_role));