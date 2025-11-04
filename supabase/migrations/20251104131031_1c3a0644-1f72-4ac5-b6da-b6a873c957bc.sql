-- Fix nullable user_id columns in profile tables
-- This is critical for RLS policies to work correctly

-- First, delete any orphaned records with NULL user_id
-- These are test/incomplete records that bypass access control
DELETE FROM students WHERE user_id IS NULL;
DELETE FROM mentors WHERE user_id IS NULL;
DELETE FROM facilitators WHERE user_id IS NULL;

-- Now make user_id NOT NULL to prevent future orphaned records
ALTER TABLE students ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE mentors ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE facilitators ALTER COLUMN user_id SET NOT NULL;

-- Add comment to document the security requirement
COMMENT ON COLUMN students.user_id IS 'Required for RLS access control. Must always be set to auth.uid()';
COMMENT ON COLUMN mentors.user_id IS 'Required for RLS access control. Must always be set to auth.uid()';
COMMENT ON COLUMN facilitators.user_id IS 'Required for RLS access control. Must always be set to auth.uid()';