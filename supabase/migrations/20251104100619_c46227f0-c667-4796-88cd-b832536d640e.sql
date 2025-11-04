-- Add bio column to students table (for "Talk about yourself")
ALTER TABLE public.students ADD COLUMN bio TEXT;

-- Add talk_about_yourself column to mentors table
ALTER TABLE public.mentors ADD COLUMN talk_about_yourself TEXT;