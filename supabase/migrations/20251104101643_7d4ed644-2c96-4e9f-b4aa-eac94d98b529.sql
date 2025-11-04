-- Add linkedin_url column to mentors table
ALTER TABLE public.mentors ADD COLUMN IF NOT EXISTS linkedin_url text;