-- Temporarily disable RLS to test if that's the issue
ALTER TABLE public.app_settings DISABLE ROW LEVEL SECURITY;

-- Alternative: Create a more permissive policy for testing
-- ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;
-- DROP POLICY IF EXISTS "Admins can read app settings" ON public.app_settings;
-- DROP POLICY IF EXISTS "Admins can insert app settings" ON public.app_settings;
-- DROP POLICY IF EXISTS "Admins can update app settings" ON public.app_settings;

-- CREATE POLICY "Allow authenticated admin access" ON public.app_settings
--     FOR ALL TO authenticated
--     USING (
--         EXISTS (
--             SELECT 1 FROM public.profiles 
--             WHERE profiles.id = auth.uid() 
--             AND profiles.role = 'admin'
--         )
--     );

-- Check current user's role for debugging
SELECT p.id, p.role, auth.uid() 
FROM public.profiles p 
WHERE p.id = auth.uid(); 