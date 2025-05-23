-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Departments Table
CREATE TABLE departments (
    department_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    department_name VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT chk_dept_name_not_empty CHECK (LENGTH(TRIM(department_name)) > 0)
);

CREATE TRIGGER update_departments_updated_at 
    BEFORE UPDATE ON departments 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Users Table
CREATE TABLE users (
    user_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    email VARCHAR(320) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    department_id UUID NOT NULL,
    is_ai_user BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    last_login_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (department_id) REFERENCES departments(department_id),
    
    CONSTRAINT chk_email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    CONSTRAINT chk_names_not_empty CHECK (
        LENGTH(TRIM(first_name)) > 0 AND 
        LENGTH(TRIM(last_name)) > 0
    )
);

CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Permissions Table
CREATE TABLE permissions (
    permission_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    permission_name VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    category VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT chk_perm_name_not_empty CHECK (LENGTH(TRIM(permission_name)) > 0)
);

-- Department Permissions Junction Table
CREATE TABLE departmentpermissions (
    department_id UUID NOT NULL,
    permission_id UUID NOT NULL,
    granted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    granted_by_user_id UUID,
    
    PRIMARY KEY (department_id, permission_id),
    FOREIGN KEY (department_id) REFERENCES departments(department_id) ON DELETE CASCADE,
    FOREIGN KEY (permission_id) REFERENCES permissions(permission_id) ON DELETE CASCADE,
    FOREIGN KEY (granted_by_user_id) REFERENCES users(user_id)
);

-- Folders Table
CREATE TABLE folders (
    folder_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    folder_name VARCHAR(255) NOT NULL,
    parent_folder_id UUID NULL,
    created_by_user_id UUID NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (parent_folder_id) REFERENCES folders(folder_id),
    FOREIGN KEY (created_by_user_id) REFERENCES users(user_id),
    
    CONSTRAINT chk_not_self_parent CHECK (folder_id != parent_folder_id),
    CONSTRAINT chk_folder_name_not_empty CHECK (LENGTH(TRIM(folder_name)) > 0)
);

CREATE TRIGGER update_folders_updated_at 
    BEFORE UPDATE ON folders 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Documents Table
CREATE TABLE documents (
    document_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(1000) NOT NULL,
    folder_id UUID NULL,
    uploaded_by_user_id UUID NOT NULL,
    file_size_bytes BIGINT DEFAULT 0,
    mime_type VARCHAR(255),
    file_hash VARCHAR(128),
    version_number INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (folder_id) REFERENCES folders(folder_id),
    FOREIGN KEY (uploaded_by_user_id) REFERENCES users(user_id),
    
    CONSTRAINT chk_doc_name_not_empty CHECK (LENGTH(TRIM(document_name)) > 0),
    CONSTRAINT chk_file_size_positive CHECK (file_size_bytes >= 0),
    CONSTRAINT chk_version_positive CHECK (version_number > 0)
);

CREATE TRIGGER update_documents_updated_at 
    BEFORE UPDATE ON documents 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- AI Models Table
CREATE TYPE ai_model_status AS ENUM ('active', 'deprecated', 'beta', 'maintenance');

CREATE TABLE aimodels (
    ai_model_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    model_name VARCHAR(255) UNIQUE NOT NULL,
    provider VARCHAR(255),
    version VARCHAR(100),
    description TEXT,
    status ai_model_status DEFAULT 'active',
    api_endpoint VARCHAR(500),
    max_tokens INTEGER,
    cost_per_1k_tokens DECIMAL(10, 6),
    capabilities JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT chk_model_name_not_empty CHECK (LENGTH(TRIM(model_name)) > 0),
    CONSTRAINT chk_max_tokens_positive CHECK (max_tokens IS NULL OR max_tokens > 0)
);

CREATE TRIGGER update_aimodels_updated_at 
    BEFORE UPDATE ON aimodels 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Conversations Table
CREATE TYPE conversation_status AS ENUM ('active', 'archived', 'deleted');

CREATE TABLE conversations (
    conversation_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_name VARCHAR(255),
    created_by_user_id UUID NOT NULL,
    ai_model_used_id UUID,
    status conversation_status DEFAULT 'active',
    total_messages INTEGER DEFAULT 0,
    total_tokens_used INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_message_at TIMESTAMP,
    
    FOREIGN KEY (created_by_user_id) REFERENCES users(user_id),
    FOREIGN KEY (ai_model_used_id) REFERENCES aimodels(ai_model_id),
    
    CONSTRAINT chk_total_messages_non_negative CHECK (total_messages >= 0),
    CONSTRAINT chk_total_tokens_non_negative CHECK (total_tokens_used >= 0)
);

CREATE TRIGGER update_conversations_updated_at 
    BEFORE UPDATE ON conversations 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Conversation Participants Table
CREATE TYPE participant_role AS ENUM ('human', 'ai', 'moderator');

CREATE TABLE conversationparticipants (
    conversation_id UUID NOT NULL,
    user_id UUID NOT NULL,
    role participant_role DEFAULT 'human',
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_active_at TIMESTAMP,
    
    PRIMARY KEY (conversation_id, user_id),
    FOREIGN KEY (conversation_id) REFERENCES conversations(conversation_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- Messages Table
CREATE TYPE message_type AS ENUM ('text', 'audio_input', 'audio_output', 'system', 'file_attachment');

CREATE TABLE messages (
    message_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL,
    sender_user_id UUID NOT NULL,
    message_type message_type NOT NULL,
    message_content TEXT,
    audio_file_path VARCHAR(1000),
    original_audio_transcription TEXT,
    ai_response_to_message_id UUID,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP,
    edited_at TIMESTAMP,
    is_deleted BOOLEAN DEFAULT FALSE,
    
    -- AI-specific fields
    ai_model_version VARCHAR(255),
    ai_processing_time_ms INTEGER,
    ai_tokens_used INTEGER,
    ai_confidence_score DECIMAL(3, 2),
    
    -- Message metadata
    message_metadata JSONB,
    
    FOREIGN KEY (conversation_id) REFERENCES conversations(conversation_id) ON DELETE CASCADE,
    FOREIGN KEY (sender_user_id) REFERENCES users(user_id),
    FOREIGN KEY (ai_response_to_message_id) REFERENCES messages(message_id),
    
    CONSTRAINT chk_processing_time_positive CHECK (ai_processing_time_ms IS NULL OR ai_processing_time_ms >= 0),
    CONSTRAINT chk_tokens_positive CHECK (ai_tokens_used IS NULL OR ai_tokens_used >= 0),
    CONSTRAINT chk_confidence_range CHECK (ai_confidence_score IS NULL OR (ai_confidence_score >= 0 AND ai_confidence_score <= 1))
);

-- Message Reactions Table
CREATE TYPE reaction_type AS ENUM ('like', 'dislike', 'helpful', 'not_helpful', 'funny', 'confused');

CREATE TABLE messagereactions (
    reaction_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    message_id UUID NOT NULL,
    user_id UUID NOT NULL,
    reaction_type reaction_type NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(message_id, user_id, reaction_type),
    FOREIGN KEY (message_id) REFERENCES messages(message_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- Audit Log Table
CREATE TYPE audit_action AS ENUM ('INSERT', 'UPDATE', 'DELETE');

CREATE TABLE auditlog (
    audit_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    table_name VARCHAR(255) NOT NULL,
    record_id UUID NOT NULL,
    action audit_action NOT NULL,
    old_values JSONB,
    new_values JSONB,
    changed_by_user_id UUID,
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (changed_by_user_id) REFERENCES users(user_id)
);

-- Indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_department ON users(department_id);
CREATE INDEX idx_users_active ON users(is_active);

CREATE INDEX idx_folders_parent ON folders(parent_folder_id);
CREATE INDEX idx_folders_created_by ON folders(created_by_user_id);

CREATE INDEX idx_documents_folder ON documents(folder_id);
CREATE INDEX idx_documents_uploaded_by ON documents(uploaded_by_user_id);
CREATE INDEX idx_documents_hash ON documents(file_hash);

CREATE INDEX idx_conversations_created_by ON conversations(created_by_user_id);
CREATE INDEX idx_conversations_last_message ON conversations(last_message_at DESC);
CREATE INDEX idx_conversations_status ON conversations(status);

CREATE INDEX idx_messages_conversation ON messages(conversation_id);
CREATE INDEX idx_messages_sender ON messages(sender_user_id);
CREATE INDEX idx_messages_sent_at ON messages(sent_at DESC);
CREATE INDEX idx_messages_type ON messages(message_type);
CREATE INDEX idx_messages_response_to ON messages(ai_response_to_message_id);

CREATE INDEX idx_messages_conv_sent ON messages(conversation_id, sent_at DESC);
CREATE INDEX idx_active_conversations ON conversations(created_by_user_id, status, last_message_at DESC); 