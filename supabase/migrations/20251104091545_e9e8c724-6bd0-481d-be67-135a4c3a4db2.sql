-- Create user roles enum
CREATE TYPE public.app_role AS ENUM ('STUDENT', 'MENTOR', 'FACILITATOR');

-- Create profiles table linked to auth.users
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  role app_role NOT NULL,
  photo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles RLS policies
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Authenticated users can view other profiles"
  ON public.profiles FOR SELECT
  USING (auth.role() = 'authenticated');

-- Create function to check user role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = _user_id
      AND role = _role
  )
$$;

-- Update students table to link to profiles
ALTER TABLE public.students
  ADD COLUMN user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Update mentors table to link to profiles
ALTER TABLE public.mentors
  ADD COLUMN user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Update facilitators table to link to profiles
ALTER TABLE public.facilitators
  ADD COLUMN user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Add hobbies to mentors
ALTER TABLE public.mentors
  ADD COLUMN hobbies TEXT[] DEFAULT '{}';

-- Add subjects to students
ALTER TABLE public.students
  ADD COLUMN subjects TEXT[] DEFAULT '{}';

-- Update invites table for two-sided acceptance
ALTER TABLE public.invites
  RENAME COLUMN status TO old_status;

ALTER TABLE public.invites
  ADD COLUMN status TEXT NOT NULL DEFAULT 'proposed';

ALTER TABLE public.invites
  ADD COLUMN accepted_by_student BOOLEAN DEFAULT FALSE;

ALTER TABLE public.invites
  ADD COLUMN accepted_by_mentor BOOLEAN DEFAULT FALSE;

ALTER TABLE public.invites
  ADD COLUMN created_by TEXT DEFAULT 'system';

-- Migrate old status data
UPDATE public.invites
  SET status = CASE
    WHEN old_status = 'sent' THEN 'proposed'
    WHEN old_status = 'accepted' THEN 'confirmed'
    WHEN old_status = 'rejected' THEN 'rejected'
    ELSE 'proposed'
  END;

ALTER TABLE public.invites
  DROP COLUMN old_status;

-- Create meetings table
CREATE TABLE public.meetings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL,
  mentor_id UUID NOT NULL,
  facilitator_id UUID,
  starts_at TIMESTAMP WITH TIME ZONE NOT NULL,
  ends_at TIMESTAMP WITH TIME ZONE NOT NULL,
  location TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS on meetings
ALTER TABLE public.meetings ENABLE ROW LEVEL SECURITY;

-- Meetings RLS policies
CREATE POLICY "Students can view their own meetings"
  ON public.meetings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.students s
      WHERE s.id = meetings.student_id
        AND s.user_id = auth.uid()
    )
  );

CREATE POLICY "Mentors can view their own meetings"
  ON public.meetings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.mentors m
      WHERE m.id = meetings.mentor_id
        AND m.user_id = auth.uid()
    )
  );

CREATE POLICY "Facilitators can view and manage meetings"
  ON public.meetings FOR ALL
  USING (public.has_role(auth.uid(), 'FACILITATOR'));

CREATE POLICY "Facilitators can create meetings"
  ON public.meetings FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'FACILITATOR'));

-- Update RLS policies for students table
DROP POLICY IF EXISTS "Students are publicly viewable" ON public.students;
DROP POLICY IF EXISTS "Anyone can insert students" ON public.students;

CREATE POLICY "Students can view their own profile"
  ON public.students FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Facilitators can view students"
  ON public.students FOR SELECT
  USING (public.has_role(auth.uid(), 'FACILITATOR'));

CREATE POLICY "Mentors can view matched students"
  ON public.students FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.invites i
      INNER JOIN public.mentors m ON i.mentor_id = m.id
      WHERE i.student_id = students.id
        AND m.user_id = auth.uid()
        AND i.status IN ('accepted_by_student', 'accepted_by_mentor', 'confirmed')
    )
  );

CREATE POLICY "Authenticated users can create student profiles"
  ON public.students FOR INSERT
  WITH CHECK (user_id = auth.uid() AND public.has_role(auth.uid(), 'STUDENT'));

CREATE POLICY "Students can update their own profile"
  ON public.students FOR UPDATE
  USING (user_id = auth.uid());

-- Update RLS policies for mentors table
DROP POLICY IF EXISTS "Mentors are publicly viewable" ON public.mentors;
DROP POLICY IF EXISTS "Anyone can insert mentors" ON public.mentors;

CREATE POLICY "Mentors can view their own profile"
  ON public.mentors FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Facilitators can view mentors"
  ON public.mentors FOR SELECT
  USING (public.has_role(auth.uid(), 'FACILITATOR'));

CREATE POLICY "Students can view matched mentors"
  ON public.mentors FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.invites i
      INNER JOIN public.students s ON i.student_id = s.id
      WHERE i.mentor_id = mentors.id
        AND s.user_id = auth.uid()
        AND i.status IN ('proposed', 'accepted_by_student', 'accepted_by_mentor', 'confirmed')
    )
  );

CREATE POLICY "Authenticated users can create mentor profiles"
  ON public.mentors FOR INSERT
  WITH CHECK (user_id = auth.uid() AND public.has_role(auth.uid(), 'MENTOR'));

CREATE POLICY "Mentors can update their own profile"
  ON public.mentors FOR UPDATE
  USING (user_id = auth.uid());

-- Update RLS policies for facilitators table
DROP POLICY IF EXISTS "Facilitators are publicly viewable" ON public.facilitators;
DROP POLICY IF EXISTS "Anyone can insert facilitators" ON public.facilitators;

CREATE POLICY "Facilitators can view their own profile"
  ON public.facilitators FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Authenticated users can create facilitator profiles"
  ON public.facilitators FOR INSERT
  WITH CHECK (user_id = auth.uid() AND public.has_role(auth.uid(), 'FACILITATOR'));

CREATE POLICY "Facilitators can update their own profile"
  ON public.facilitators FOR UPDATE
  USING (user_id = auth.uid());

-- Update RLS policies for invites table
DROP POLICY IF EXISTS "Invites are publicly viewable" ON public.invites;
DROP POLICY IF EXISTS "Anyone can insert invites" ON public.invites;

CREATE POLICY "Students can view their invites"
  ON public.invites FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.students s
      WHERE s.id = invites.student_id
        AND s.user_id = auth.uid()
    )
  );

CREATE POLICY "Mentors can view their invites"
  ON public.invites FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.mentors m
      WHERE m.id = invites.mentor_id
        AND m.user_id = auth.uid()
    )
  );

CREATE POLICY "Facilitators can view and manage invites"
  ON public.invites FOR ALL
  USING (public.has_role(auth.uid(), 'FACILITATOR'));

CREATE POLICY "Students can update their invites"
  ON public.invites FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.students s
      WHERE s.id = invites.student_id
        AND s.user_id = auth.uid()
    )
  );

CREATE POLICY "Mentors can update their invites"
  ON public.invites FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.mentors m
      WHERE m.id = invites.mentor_id
        AND m.user_id = auth.uid()
    )
  );

CREATE POLICY "System can create invites"
  ON public.invites FOR INSERT
  WITH CHECK (true);

-- Trigger for updating updated_at on profiles
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger for updating updated_at on meetings
CREATE TRIGGER update_meetings_updated_at
  BEFORE UPDATE ON public.meetings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to automatically create profile when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role, photo_url)
  VALUES (
    NEW.id,
    NEW.email,
    (NEW.raw_user_meta_data->>'role')::app_role,
    NEW.raw_user_meta_data->>'photo_url'
  );
  RETURN NEW;
END;
$$;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();