-- Fix RLS policies for app_settings table

-- Drop the existing policy
DROP POLICY IF EXISTS "Only admins can manage app settings" ON public.app_settings;

-- Create separate policies for read and write operations
CREATE POLICY "Admins can read app settings" ON public.app_settings
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

CREATE POLICY "Admins can insert app settings" ON public.app_settings
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

CREATE POLICY "Admins can update app settings" ON public.app_settings
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- Check if there are any existing records that might be causing conflicts
SELECT setting_key, setting_value FROM public.app_settings WHERE setting_key = 'hagga_basin_settings'; 