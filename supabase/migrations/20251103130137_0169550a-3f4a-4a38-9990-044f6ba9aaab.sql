-- Create students table
CREATE TABLE IF NOT EXISTS public.students (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  grade INTEGER NOT NULL,
  school TEXT,
  city TEXT,
  languages TEXT[] NOT NULL DEFAULT '{}',
  interests TEXT[] NOT NULL DEFAULT '{}',
  goals TEXT,
  meeting_pref TEXT NOT NULL DEFAULT 'online',
  availability TIMESTAMPTZ[] DEFAULT '{}',
  facilitator_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create mentors table
CREATE TABLE IF NOT EXISTS public.mentors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  employer TEXT,
  role TEXT,
  bio TEXT,
  skills TEXT[] NOT NULL DEFAULT '{}',
  languages TEXT[] NOT NULL DEFAULT '{}',
  age_pref TEXT DEFAULT 'any',
  meeting_pref TEXT NOT NULL DEFAULT 'both',
  availability TIMESTAMPTZ[] DEFAULT '{}',
  max_students INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create facilitators table
CREATE TABLE IF NOT EXISTS public.facilitators (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  org TEXT,
  role TEXT,
  city TEXT,
  max_matches INTEGER NOT NULL DEFAULT 10,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create invites table
CREATE TABLE IF NOT EXISTS public.invites (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  mentor_id UUID NOT NULL REFERENCES public.mentors(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'sent',
  score INTEGER NOT NULL,
  reasons TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.facilitators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invites ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (MVP - will be refined with auth later)
CREATE POLICY "Students are publicly viewable" ON public.students
  FOR SELECT USING (true);

CREATE POLICY "Anyone can insert students" ON public.students
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Mentors are publicly viewable" ON public.mentors
  FOR SELECT USING (true);

CREATE POLICY "Anyone can insert mentors" ON public.mentors
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Facilitators are publicly viewable" ON public.facilitators
  FOR SELECT USING (true);

CREATE POLICY "Anyone can insert facilitators" ON public.facilitators
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Invites are publicly viewable" ON public.invites
  FOR SELECT USING (true);

CREATE POLICY "Anyone can insert invites" ON public.invites
  FOR INSERT WITH CHECK (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_students_updated_at
  BEFORE UPDATE ON public.students
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_mentors_updated_at
  BEFORE UPDATE ON public.mentors
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_facilitators_updated_at
  BEFORE UPDATE ON public.facilitators
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_invites_updated_at
  BEFORE UPDATE ON public.invites
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert seed data for demo
INSERT INTO public.mentors (first_name, last_name, email, employer, role, bio, skills, languages, age_pref, meeting_pref, max_students) VALUES
  ('Sarah', 'Chen', 'sarah.chen@example.com', 'Tech Corp', 'Software Engineer', 'Passionate about helping students discover tech careers', ARRAY['💻 Technology', '🎨 Art & Design'], ARRAY['English', 'Mandarin'], 'any', 'both', 3),
  ('Marcus', 'Johnson', 'marcus.j@example.com', 'Design Studio', 'Product Designer', 'Former student mentor, loves creative problem solving', ARRAY['🎨 Art & Design', '💼 Business'], ARRAY['English', 'Spanish'], 'high school', 'online', 2),
  ('Amira', 'Hassan', 'amira.h@example.com', 'City Hospital', 'Healthcare Professional', 'Dedicated to inspiring future healthcare workers', ARRAY['🏥 Healthcare', '🔬 Science'], ARRAY['English', 'Arabic'], 'any', 'in-person', 1),
  ('David', 'Kim', 'david.k@example.com', 'Green Energy Co', 'Environmental Scientist', 'Helping students understand climate solutions', ARRAY['🌍 Environment', '🔬 Science'], ARRAY['English', 'Swedish'], 'college', 'both', 2),
  ('Elena', 'Rodriguez', 'elena.r@example.com', 'Media Group', 'Content Creator', 'Guiding aspiring storytellers and creators', ARRAY['🎬 Media', '🎨 Art & Design'], ARRAY['English', 'Spanish'], 'any', 'online', 3);

INSERT INTO public.facilitators (name, email, org, role, city, max_matches) VALUES
  ('Jennifer Martinez', 'j.martinez@school.edu', 'Central High School', 'School Counselor', 'San Francisco', 20),
  ('Thomas Anderson', 't.anderson@academy.edu', 'Tech Academy', 'Program Director', 'Seattle', 15);
