-- Migration: Add Folder Permissions System
-- This migration adds folder-level permissions for granular access control

-- Create folder permissions table
CREATE TABLE folderpermissions (
    folder_permission_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    folder_id UUID NOT NULL,
    department_id UUID NULL,
    user_id UUID NULL,
    permission_type VARCHAR(50) NOT NULL,
    granted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    granted_by_user_id UUID NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    
    FOREIGN KEY (folder_id) REFERENCES folders(folder_id) ON DELETE CASCADE,
    FOREIGN KEY (department_id) REFERENCES departments(department_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (granted_by_user_id) REFERENCES users(user_id),
    
    -- Ensure either department_id or user_id is set, but not both
    CONSTRAINT chk_department_or_user_not_both CHECK (
        (department_id IS NOT NULL AND user_id IS NULL) OR 
        (department_id IS NULL AND user_id IS NOT NULL)
    ),
    
    -- Ensure permission type is valid
    CONSTRAINT chk_permission_type CHECK (
        permission_type IN ('read', 'write', 'delete', 'manage')
    ),
    
    -- Unique constraint to prevent duplicate permissions
    UNIQUE (folder_id, department_id, user_id, permission_type)
);

-- Add indexes for better performance
CREATE INDEX idx_folder_permissions_folder_id ON folderpermissions(folder_id);
CREATE INDEX idx_folder_permissions_department_id ON folderpermissions(department_id);
CREATE INDEX idx_folder_permissions_user_id ON folderpermissions(user_id);
CREATE INDEX idx_folder_permissions_type ON folderpermissions(permission_type);

-- Add folder access level field to folders table
ALTER TABLE folders ADD COLUMN access_level VARCHAR(20) DEFAULT 'inherited';
ALTER TABLE folders ADD CONSTRAINT chk_access_level CHECK (
    access_level IN ('public', 'restricted', 'private', 'inherited')
);

-- Add permission inheritance field
ALTER TABLE folders ADD COLUMN inherit_permissions BOOLEAN DEFAULT TRUE;

-- Create function to check folder permissions for a user
CREATE OR REPLACE FUNCTION user_has_folder_permission(
    p_user_id UUID,
    p_folder_id UUID,
    p_permission_type VARCHAR
) RETURNS BOOLEAN AS $$
DECLARE
    v_has_permission BOOLEAN := FALSE;
    v_current_folder_id UUID := p_folder_id;
    v_max_depth INTEGER := 10; -- Prevent infinite loops
    v_depth INTEGER := 0;
BEGIN
    -- Check if user has global manage_folders permission (admin override)
    IF user_has_permission(p_user_id, 'manage_folders') THEN
        RETURN TRUE;
    END IF;
    
    -- Check permissions starting from the current folder and walking up the hierarchy
    WHILE v_current_folder_id IS NOT NULL AND v_depth < v_max_depth LOOP
        -- Check direct user permission for this folder
        SELECT EXISTS (
            SELECT 1 FROM folderpermissions fp
            WHERE fp.folder_id = v_current_folder_id
            AND fp.user_id = p_user_id
            AND fp.permission_type = p_permission_type
            AND fp.is_active = TRUE
        ) INTO v_has_permission;
        
        IF v_has_permission THEN
            RETURN TRUE;
        END IF;
        
        -- Check department permission for this folder
        SELECT EXISTS (
            SELECT 1 FROM folderpermissions fp
            JOIN users u ON fp.department_id = u.department_id
            WHERE fp.folder_id = v_current_folder_id
            AND u.user_id = p_user_id
            AND fp.permission_type = p_permission_type
            AND fp.is_active = TRUE
            AND u.is_active = TRUE
        ) INTO v_has_permission;
        
        IF v_has_permission THEN
            RETURN TRUE;
        END IF;
        
        -- Check if folder inherits permissions, if not stop here
        IF NOT (SELECT COALESCE(inherit_permissions, TRUE) FROM folders WHERE folder_id = v_current_folder_id) THEN
            EXIT;
        END IF;
        
        -- Move to parent folder
        SELECT parent_folder_id INTO v_current_folder_id
        FROM folders 
        WHERE folder_id = v_current_folder_id;
        
        v_depth := v_depth + 1;
    END LOOP;
    
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql;

-- Create function to get user's accessible folders
CREATE OR REPLACE FUNCTION get_user_accessible_folders(
    p_user_id UUID,
    p_permission_type VARCHAR DEFAULT 'read'
) RETURNS TABLE (
    folder_id UUID,
    folder_name VARCHAR,
    parent_folder_id UUID,
    access_level VARCHAR,
    permission_source VARCHAR
) AS $$
BEGIN
    RETURN QUERY
    WITH RECURSIVE folder_hierarchy AS (
        -- Base case: folders where user has direct permissions
        SELECT 
            f.folder_id,
            f.folder_name,
            f.parent_folder_id,
            f.access_level,
            'direct'::VARCHAR as permission_source,
            f.inherit_permissions
        FROM folders f
        WHERE f.is_active = TRUE
        AND (
            -- User has global manage_folders permission
            user_has_permission(p_user_id, 'manage_folders')
            OR
            -- User has specific folder permission
            user_has_folder_permission(p_user_id, f.folder_id, p_permission_type)
            OR
            -- Folder is public
            f.access_level = 'public'
        )
        
        UNION ALL
        
        -- Recursive case: child folders of accessible folders (if they inherit permissions)
        SELECT 
            f.folder_id,
            f.folder_name,
            f.parent_folder_id,
            f.access_level,
            'inherited'::VARCHAR as permission_source,
            f.inherit_permissions
        FROM folders f
        JOIN folder_hierarchy fh ON f.parent_folder_id = fh.folder_id
        WHERE f.is_active = TRUE
        AND f.inherit_permissions = TRUE
        AND f.access_level != 'private'
    )
    SELECT 
        fh.folder_id,
        fh.folder_name,
        fh.parent_folder_id,
        fh.access_level,
        fh.permission_source
    FROM folder_hierarchy fh
    ORDER BY fh.folder_name;
END;
$$ LANGUAGE plpgsql;

-- Insert default folder permissions for root folders
DO $$
DECLARE
    admin_dept_id UUID;
    documents_folder_id UUID;
BEGIN
    -- Get admin department ID
    SELECT department_id INTO admin_dept_id FROM departments WHERE department_name = 'Admin';
    
    -- Get Documents folder ID
    SELECT folder_id INTO documents_folder_id FROM folders 
    WHERE folder_name = 'Documents' AND parent_folder_id IS NULL;
    
    IF documents_folder_id IS NOT NULL AND admin_dept_id IS NOT NULL THEN
        -- Give admin department full access to Documents folder
        INSERT INTO folderpermissions (folder_id, department_id, permission_type, granted_by_user_id)
        SELECT documents_folder_id, admin_dept_id, 'manage', 
               (SELECT user_id FROM users WHERE email = 'admin@example.com')
        WHERE NOT EXISTS (
            SELECT 1 FROM folderpermissions 
            WHERE folder_id = documents_folder_id 
            AND department_id = admin_dept_id 
            AND permission_type = 'manage'
        );
        
        -- Set public access for Documents folder
        UPDATE folders 
        SET access_level = 'public' 
        WHERE folder_id = documents_folder_id;
    END IF;
END $$; 