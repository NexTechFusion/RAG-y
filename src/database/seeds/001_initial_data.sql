-- Insert default departments
INSERT INTO departments (department_name, description) VALUES
('Admin', 'System administrators with full access'),
('IT', 'Information Technology department'),
('HR', 'Human Resources department'),
('Finance', 'Finance and accounting department'),
('Marketing', 'Marketing and communications department'),
('Operations', 'Operations and management department'),
('AI Assistant', 'Department for AI users');

-- Insert permissions
INSERT INTO permissions (permission_name, description, category) VALUES
-- Document permissions
('view_documents', 'View documents in accessible folders', 'documents'),
('create_documents', 'Upload and create new documents', 'documents'),
('edit_documents', 'Edit and update documents', 'documents'),
('delete_documents', 'Delete documents', 'documents'),
('manage_folders', 'Create, edit, and delete folders', 'documents'),

-- Chat permissions
('view_conversations', 'View own chat conversations', 'chat'),
('view_all_conversations', 'View all chat conversations', 'chat'),
('create_conversations', 'Create new chat conversations', 'chat'),
('delete_messages', 'Delete chat messages', 'chat'),
('manage_conversations', 'Manage conversation settings and participants', 'chat'),

-- User management permissions
('view_users', 'View user profiles and lists', 'users'),
('create_users', 'Create new user accounts', 'users'),
('edit_users', 'Edit user profiles and settings', 'users'),
('delete_users', 'Deactivate user accounts', 'users'),
('manage_permissions', 'Assign and modify user permissions', 'users'),

-- Admin permissions
('view_analytics', 'Access usage analytics and reports', 'admin'),
('manage_ai_models', 'Configure and manage AI models', 'admin'),
('system_settings', 'Modify system-wide settings', 'admin'),
('audit_logs', 'View system audit logs', 'admin'),
('backup_restore', 'Perform system backup and restore operations', 'admin');

-- Get department IDs for permission assignment
DO $$
DECLARE
    admin_dept_id UUID;
    it_dept_id UUID;
    hr_dept_id UUID;
    finance_dept_id UUID;
    marketing_dept_id UUID;
    operations_dept_id UUID;
    ai_dept_id UUID;
BEGIN
    -- Get department IDs
    SELECT department_id INTO admin_dept_id FROM departments WHERE department_name = 'Admin';
    SELECT department_id INTO it_dept_id FROM departments WHERE department_name = 'IT';
    SELECT department_id INTO hr_dept_id FROM departments WHERE department_name = 'HR';
    SELECT department_id INTO finance_dept_id FROM departments WHERE department_name = 'Finance';
    SELECT department_id INTO marketing_dept_id FROM departments WHERE department_name = 'Marketing';
    SELECT department_id INTO operations_dept_id FROM departments WHERE department_name = 'Operations';
    SELECT department_id INTO ai_dept_id FROM departments WHERE department_name = 'AI Assistant';

    -- Admin department gets all permissions
    INSERT INTO departmentpermissions (department_id, permission_id)
    SELECT admin_dept_id, permission_id FROM permissions;

    -- IT department permissions
    INSERT INTO departmentpermissions (department_id, permission_id)
    SELECT it_dept_id, permission_id FROM permissions 
    WHERE permission_name IN (
        'view_documents', 'create_documents', 'edit_documents', 'manage_folders',
        'view_conversations', 'create_conversations', 'manage_conversations',
        'view_users', 'create_users', 'edit_users',
        'view_analytics', 'manage_ai_models', 'system_settings', 'audit_logs'
    );

    -- HR department permissions
    INSERT INTO departmentpermissions (department_id, permission_id)
    SELECT hr_dept_id, permission_id FROM permissions 
    WHERE permission_name IN (
        'view_documents', 'create_documents', 'edit_documents',
        'view_conversations', 'create_conversations',
        'view_users', 'create_users', 'edit_users', 'manage_permissions'
    );

    -- Finance department permissions
    INSERT INTO departmentpermissions (department_id, permission_id)
    SELECT finance_dept_id, permission_id FROM permissions 
    WHERE permission_name IN (
        'view_documents', 'create_documents', 'edit_documents',
        'view_conversations', 'create_conversations',
        'view_users', 'view_analytics'
    );

    -- Marketing department permissions
    INSERT INTO departmentpermissions (department_id, permission_id)
    SELECT marketing_dept_id, permission_id FROM permissions 
    WHERE permission_name IN (
        'view_documents', 'create_documents', 'edit_documents',
        'view_conversations', 'create_conversations',
        'view_users'
    );

    -- Operations department permissions
    INSERT INTO departmentpermissions (department_id, permission_id)
    SELECT operations_dept_id, permission_id FROM permissions 
    WHERE permission_name IN (
        'view_documents', 'create_documents', 'edit_documents', 'manage_folders',
        'view_conversations', 'create_conversations', 'manage_conversations',
        'view_users', 'view_analytics'
    );

    -- AI Assistant department permissions (minimal, mostly for system operations)
    INSERT INTO departmentpermissions (department_id, permission_id)
    SELECT ai_dept_id, permission_id FROM permissions 
    WHERE permission_name IN (
        'view_conversations', 'create_conversations'
    );
END $$;

-- Insert sample AI models
INSERT INTO aimodels (model_name, provider, version, description, max_tokens, cost_per_1k_tokens, capabilities) VALUES
('GPT-4o', 'OpenAI', '2024-08-06', 'Most capable GPT-4 model with vision capabilities', 128000, 0.0025, 
 '{"text_generation": true, "image_analysis": true, "code_generation": true, "reasoning": true}'),

('GPT-4o-mini', 'OpenAI', '2024-07-18', 'Faster and more affordable GPT-4 model', 128000, 0.00015,
 '{"text_generation": true, "code_generation": true, "reasoning": true}'),

('Claude-3.5-Sonnet', 'Anthropic', '20241022', 'Advanced reasoning and coding capabilities', 200000, 0.003,
 '{"text_generation": true, "code_generation": true, "reasoning": true, "analysis": true}'),

('Claude-3-Haiku', 'Anthropic', '20240307', 'Fast and efficient model for simple tasks', 200000, 0.00025,
 '{"text_generation": true, "simple_reasoning": true}'),

('Gemini-1.5-Pro', 'Google', '002', 'Long context window with multimodal support', 2097152, 0.00125,
 '{"text_generation": true, "image_analysis": true, "video_analysis": true, "long_context": true}'),

('Gemini-1.5-Flash', 'Google', '002', 'Fast and efficient multimodal model', 1048576, 0.000075,
 '{"text_generation": true, "image_analysis": true, "fast_inference": true}');

-- Create default admin user
DO $$
DECLARE
    admin_dept_id UUID;
    ai_dept_id UUID;
    admin_user_id UUID;
    ai_user_id UUID;
BEGIN
    -- Get department IDs
    SELECT department_id INTO admin_dept_id FROM departments WHERE department_name = 'Admin';
    SELECT department_id INTO ai_dept_id FROM departments WHERE department_name = 'AI Assistant';

    -- Create admin user (password: Admin123!)
    -- Note: In production, this should be changed immediately
    INSERT INTO users (first_name, last_name, email, password_hash, department_id)
    VALUES (
        'System',
        'Administrator',
        'admin@example.com',
        '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LeakKV7dg7OO.KSHu', -- bcrypt hash of 'Admin123!'
        admin_dept_id
    ) RETURNING user_id INTO admin_user_id;

    -- Create AI assistant user
    INSERT INTO users (first_name, last_name, email, password_hash, department_id, is_ai_user)
    VALUES (
        'AI',
        'Assistant',
        'ai@system.internal',
        '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LeakKV7dg7OO.KSHu', -- Same hash, but AI users don't actually log in
        ai_dept_id,
        true
    ) RETURNING user_id INTO ai_user_id;

    -- Create a sample root folder
    INSERT INTO folders (folder_name, created_by_user_id, description)
    VALUES (
        'Documents',
        admin_user_id,
        'Root folder for all documents'
    );

    -- Create sample subfolders
    INSERT INTO folders (folder_name, parent_folder_id, created_by_user_id, description)
    SELECT 
        'Public Documents',
        folder_id,
        admin_user_id,
        'Publicly accessible documents'
    FROM folders WHERE folder_name = 'Documents' AND parent_folder_id IS NULL;

    INSERT INTO folders (folder_name, parent_folder_id, created_by_user_id, description)
    SELECT 
        'Templates',
        folder_id,
        admin_user_id,
        'Document templates and forms'
    FROM folders WHERE folder_name = 'Documents' AND parent_folder_id IS NULL;

    INSERT INTO folders (folder_name, parent_folder_id, created_by_user_id, description)
    SELECT 
        'Policies',
        folder_id,
        admin_user_id,
        'Company policies and procedures'
    FROM folders WHERE folder_name = 'Documents' AND parent_folder_id IS NULL;

END $$;

-- Create function to check user permissions
CREATE OR REPLACE FUNCTION user_has_permission(
    p_user_id UUID,
    p_permission_name VARCHAR
) RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 
        FROM users u
        JOIN departmentpermissions dp ON u.department_id = dp.department_id
        JOIN permissions p ON dp.permission_id = p.permission_id
        WHERE u.user_id = p_user_id 
        AND p.permission_name = p_permission_name
        AND u.is_active = TRUE
        AND p.is_active = TRUE
    );
END;
$$ LANGUAGE plpgsql; 