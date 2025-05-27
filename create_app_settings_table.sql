-- Create app_settings table for storing application configuration
CREATE TABLE IF NOT EXISTS public.app_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    setting_key TEXT NOT NULL UNIQUE,
    setting_value JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Add RLS (Row Level Security)
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- Create policy: Only admins can read/write app settings
CREATE POLICY "Only admins can manage app settings" ON public.app_settings
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_app_settings_setting_key ON public.app_settings(setting_key);

-- Add comment for documentation
COMMENT ON TABLE public.app_settings IS 'Application-wide settings and configuration stored as JSON';
COMMENT ON COLUMN public.app_settings.setting_key IS 'Unique identifier for the setting (e.g., hagga_basin_settings)';
COMMENT ON COLUMN public.app_settings.setting_value IS 'JSON value containing the setting data'; 