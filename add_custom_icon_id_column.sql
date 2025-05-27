-- Add custom_icon_id column to POIs table
-- This allows POIs to reference custom icons directly in the database

ALTER TABLE public.pois 
ADD COLUMN custom_icon_id uuid REFERENCES public.custom_icons(id) ON DELETE SET NULL;

-- Add index for performance
CREATE INDEX idx_pois_custom_icon_id ON public.pois(custom_icon_id);

-- Add comment for documentation
COMMENT ON COLUMN public.pois.custom_icon_id IS 'Optional reference to custom icon. When set, overrides the POI type default icon.'; 