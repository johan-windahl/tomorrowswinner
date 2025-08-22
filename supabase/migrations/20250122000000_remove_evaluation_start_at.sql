-- Remove evaluation_start_at column from competitions table
-- The evaluation period now starts immediately after deadline_at

ALTER TABLE public.competitions DROP COLUMN IF EXISTS evaluation_start_at;
