-- Fix infinite recursion in RLS policies by simplifying them

-- Drop existing policies that cause recursion
DROP POLICY IF EXISTS "Students can view their invites" ON public.invites;
DROP POLICY IF EXISTS "Mentors can view their invites" ON public.invites;
DROP POLICY IF EXISTS "Students can view matched mentors" ON public.mentors;
DROP POLICY IF EXISTS "Mentors can view matched students" ON public.students;

-- Recreate simplified policies for invites
-- Students can view invites where they are the student
CREATE POLICY "Students can view their invites"
ON public.invites
FOR SELECT
TO authenticated
USING (
  student_id IN (
    SELECT id FROM public.students WHERE user_id = auth.uid()
  )
);

-- Mentors can view invites where they are the mentor
CREATE POLICY "Mentors can view their invites"
ON public.invites
FOR SELECT
TO authenticated
USING (
  mentor_id IN (
    SELECT id FROM public.mentors WHERE user_id = auth.uid()
  )
);

-- Recreate simplified policies for mentors
-- Students can view mentors they have invites with
CREATE POLICY "Students can view matched mentors"
ON public.mentors
FOR SELECT
TO authenticated
USING (
  id IN (
    SELECT mentor_id FROM public.invites 
    WHERE student_id IN (
      SELECT id FROM public.students WHERE user_id = auth.uid()
    )
    AND status IN ('proposed', 'accepted_by_student', 'accepted_by_mentor', 'confirmed')
  )
);

-- Recreate simplified policies for students
-- Mentors can view students they have invites with
CREATE POLICY "Mentors can view matched students"
ON public.students
FOR SELECT
TO authenticated
USING (
  id IN (
    SELECT student_id FROM public.invites 
    WHERE mentor_id IN (
      SELECT id FROM public.mentors WHERE user_id = auth.uid()
    )
    AND status IN ('accepted_by_student', 'accepted_by_mentor', 'confirmed')
  )
);