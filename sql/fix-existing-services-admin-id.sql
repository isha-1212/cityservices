-- Fix existing services by assigning them to the first admin user
-- This is a temporary fix to ensure analytics work

DO $$
DECLARE
    first_admin_id UUID;
BEGIN
    -- Get the first admin user
    SELECT id INTO first_admin_id 
    FROM profiles 
    WHERE is_admin = true OR role = 'admin'
    LIMIT 1;
    
    IF first_admin_id IS NOT NULL THEN
        -- Update all services that don't have admin_id set
        UPDATE services 
        SET admin_id = first_admin_id 
        WHERE admin_id IS NULL;
        
        RAISE NOTICE 'Updated services with admin_id: %', first_admin_id;
    ELSE
        RAISE NOTICE 'No admin users found';
    END IF;
END $$;