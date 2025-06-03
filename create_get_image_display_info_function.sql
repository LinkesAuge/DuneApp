-- Create the get_image_display_info function for the shared images system
-- This function handles image display logic with fallback support

CREATE OR REPLACE FUNCTION get_image_display_info(
  p_icon_image_id UUID DEFAULT NULL,
  p_icon_fallback TEXT DEFAULT NULL
) RETURNS TABLE (
  image_url TEXT,
  is_image BOOLEAN,
  display_value TEXT
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- If icon_image_id is provided, try to get the shared image
  IF p_icon_image_id IS NOT NULL THEN
    RETURN QUERY
    SELECT 
      si.image_url::TEXT,
      true::BOOLEAN as is_image,
      si.filename::TEXT as display_value
    FROM shared_images si
    WHERE si.id = p_icon_image_id 
      AND si.is_active = true
    LIMIT 1;
    
    -- If we found a record, return it
    IF FOUND THEN
      RETURN;
    END IF;
  END IF;
  
  -- Fallback to text icon
  RETURN QUERY
  SELECT 
    NULL::TEXT as image_url,
    false::BOOLEAN as is_image,
    COALESCE(p_icon_fallback, '')::TEXT as display_value;
END;
$$;

-- Grant access to authenticated users
GRANT EXECUTE ON FUNCTION get_image_display_info(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_image_display_info(UUID, TEXT) TO anon; 