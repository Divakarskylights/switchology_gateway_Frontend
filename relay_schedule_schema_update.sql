-- Add scheduling fields to relaysetup table
ALTER TABLE public.relaysetup ADD COLUMN IF NOT EXISTS schedule_enabled BOOLEAN DEFAULT false;
ALTER TABLE public.relaysetup ADD COLUMN IF NOT EXISTS schedule_type VARCHAR(20) DEFAULT 'NONE';
ALTER TABLE public.relaysetup ADD COLUMN IF NOT EXISTS schedule_time_on TIME;
ALTER TABLE public.relaysetup ADD COLUMN IF NOT EXISTS schedule_time_off TIME;
ALTER TABLE public.relaysetup ADD COLUMN IF NOT EXISTS schedule_days VARCHAR(50); -- 'MON,TUE,WED' or 'DAILY' or specific date
ALTER TABLE public.relaysetup ADD COLUMN IF NOT EXISTS schedule_date DATE; -- For one-time schedules

-- Add check constraint for schedule types
ALTER TABLE public.relaysetup 
ADD CONSTRAINT IF NOT EXISTS relaysetup_schedule_type_check 
CHECK (schedule_type IN ('NONE', 'ONCE', 'DAILY', 'WEEKLY', 'CUSTOM_DAYS'));

-- Add comments
COMMENT ON COLUMN public.relaysetup.schedule_enabled IS 'Whether scheduling is active for this relay';
COMMENT ON COLUMN public.relaysetup.schedule_type IS 'Type of schedule: NONE, ONCE, DAILY, WEEKLY, CUSTOM_DAYS';
COMMENT ON COLUMN public.relaysetup.schedule_time_on IS 'Time to turn relay ON';
COMMENT ON COLUMN public.relaysetup.schedule_time_off IS 'Time to turn relay OFF';
COMMENT ON COLUMN public.relaysetup.schedule_days IS 'Days for schedule (MON,TUE,WED or DAILY)';
COMMENT ON COLUMN public.relaysetup.schedule_date IS 'Specific date for one-time schedules';
