-- Update facilitators table structure
-- Add first_name and last_name columns
ALTER TABLE public.facilitators ADD COLUMN IF NOT EXISTS first_name text;
ALTER TABLE public.facilitators ADD COLUMN IF NOT EXISTS last_name text;

-- Make org and role required
ALTER TABLE public.facilitators ALTER COLUMN org SET NOT NULL;
ALTER TABLE public.facilitators ALTER COLUMN role SET NOT NULL;

-- Migrate existing data from name to first_name (if any exists)
UPDATE public.facilitators 
SET first_name = SPLIT_PART(name, ' ', 1),
    last_name = CASE 
      WHEN ARRAY_LENGTH(STRING_TO_ARRAY(name, ' '), 1) > 1 
      THEN SUBSTRING(name FROM POSITION(' ' IN name) + 1)
      ELSE ''
    END
WHERE name IS NOT NULL AND first_name IS NULL;

-- Set first_name and last_name as required
ALTER TABLE public.facilitators ALTER COLUMN first_name SET NOT NULL;
ALTER TABLE public.facilitators ALTER COLUMN last_name SET NOT NULL;

-- Drop old name column
ALTER TABLE public.facilitators DROP COLUMN IF EXISTS name;