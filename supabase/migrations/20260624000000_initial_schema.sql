-- job-autofill-bd initial schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Ensure pgsodium is enabled for encryption (assuming Supabase env)
-- CREATE EXTENSION IF NOT EXISTS "pgsodium";

-------------------------------------------------------------------------------
-- 1. PROFILES (High-level containers: Personal, Brother, Sister, etc.)
-------------------------------------------------------------------------------
CREATE TABLE profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL, -- e.g., 'My Profile', 'Brother's Profile'
    is_deleted BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_profiles_user_id ON profiles(user_id);

-------------------------------------------------------------------------------
-- 2. PERSONAL INFO
-------------------------------------------------------------------------------
CREATE TABLE personal_info (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
    full_name VARCHAR(255) NOT NULL,
    father_name VARCHAR(255),
    mother_name VARCHAR(255),
    date_of_birth DATE,
    gender VARCHAR(50),
    religion VARCHAR(100),
    marital_status VARCHAR(50),
    -- Encrypted fields ideally should use pgsodium, but for now we store them securely via RLS
    nid VARCHAR(100),
    birth_registration VARCHAR(100),
    passport_number VARCHAR(100),
    mobile VARCHAR(50),
    email VARCHAR(255),
    is_deleted BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-------------------------------------------------------------------------------
-- 3. ADDRESSES
-------------------------------------------------------------------------------
CREATE TABLE addresses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL CHECK (type IN ('Present', 'Permanent')),
    village_road_house TEXT,
    post_office VARCHAR(255),
    post_code VARCHAR(50),
    union_ward VARCHAR(255),
    upazila VARCHAR(255),
    district VARCHAR(255),
    is_deleted BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(profile_id, type)
);

-------------------------------------------------------------------------------
-- 4. EDUCATION
-------------------------------------------------------------------------------
CREATE TABLE education (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    level VARCHAR(100) NOT NULL, -- SSC, HSC, Bachelor, etc.
    institution VARCHAR(255),
    board_university VARCHAR(255),
    roll VARCHAR(100),
    registration VARCHAR(100),
    group_subject VARCHAR(255),
    gpa_cgpa VARCHAR(50),
    passing_year VARCHAR(10),
    is_deleted BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_education_profile_id ON education(profile_id);

-------------------------------------------------------------------------------
-- 5. EMPLOYMENT
-------------------------------------------------------------------------------
CREATE TABLE employment (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    company VARCHAR(255) NOT NULL,
    designation VARCHAR(255) NOT NULL,
    start_date DATE,
    end_date DATE,
    responsibilities TEXT,
    is_deleted BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_employment_profile_id ON employment(profile_id);

-------------------------------------------------------------------------------
-- 6. DOCUMENTS
-------------------------------------------------------------------------------
CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    type VARCHAR(100) NOT NULL, -- Photo, Signature, CV, NID_Front, NID_Back, Certificate
    storage_path TEXT NOT NULL,
    is_deleted BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_documents_profile_id ON documents(profile_id);

-------------------------------------------------------------------------------
-- 7. SUBSCRIPTIONS
-------------------------------------------------------------------------------
CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    plan VARCHAR(50) DEFAULT 'Free' CHECK (plan IN ('Free', 'Premium')),
    status VARCHAR(50) DEFAULT 'active',
    stripe_customer_id VARCHAR(255),
    sslcommerz_id VARCHAR(255),
    current_period_end TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-------------------------------------------------------------------------------
-- 8. FORM TEMPLATES & FIELD MAPPINGS
-------------------------------------------------------------------------------
CREATE TABLE form_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL, -- e.g., 'Teletalk Standard'
    url_pattern VARCHAR(255),   -- e.g., '*.teletalk.com.bd/*'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE field_mappings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    template_id UUID REFERENCES form_templates(id) ON DELETE CASCADE,
    field_name VARCHAR(255) NOT NULL, -- e.g., 'applicant_name'
    mapped_to VARCHAR(255) NOT NULL,  -- e.g., 'personal_info.full_name'
    confidence_score FLOAT DEFAULT 1.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-------------------------------------------------------------------------------
-- 9. AUDIT LOGS
-------------------------------------------------------------------------------
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    action VARCHAR(255) NOT NULL, -- e.g., 'Form Filled', 'Profile Created'
    target_url VARCHAR(255),
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-------------------------------------------------------------------------------
-- AUTOMATIC TIMESTAMP UPDATES
-------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_modtime BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
CREATE TRIGGER update_personal_info_modtime BEFORE UPDATE ON personal_info FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
CREATE TRIGGER update_addresses_modtime BEFORE UPDATE ON addresses FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
CREATE TRIGGER update_education_modtime BEFORE UPDATE ON education FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
CREATE TRIGGER update_employment_modtime BEFORE UPDATE ON employment FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
CREATE TRIGGER update_documents_modtime BEFORE UPDATE ON documents FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
CREATE TRIGGER update_subscriptions_modtime BEFORE UPDATE ON subscriptions FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

-------------------------------------------------------------------------------
-- AUTO CREATE FREE SUBSCRIPTION ON USER SIGNUP
-------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.subscriptions (user_id, plan, status)
  VALUES (new.id, 'Free', 'active');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-------------------------------------------------------------------------------
-- ROW LEVEL SECURITY (RLS)
-------------------------------------------------------------------------------

-- Enable RLS for all user-data tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE personal_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE education ENABLE ROW LEVEL SECURITY;
ALTER TABLE employment ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper to check profile ownership
CREATE OR REPLACE FUNCTION user_owns_profile(profile_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = profile_uuid AND user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Profiles Policies
CREATE POLICY "Users can view their own profiles" ON profiles FOR SELECT USING (auth.uid() = user_id AND is_deleted = false);
CREATE POLICY "Users can insert their own profiles" ON profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own profiles" ON profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can soft delete their own profiles" ON profiles FOR DELETE USING (auth.uid() = user_id);

-- Personal Info Policies
CREATE POLICY "Users can view personal info of their profiles" ON personal_info FOR SELECT USING (user_owns_profile(profile_id) AND is_deleted = false);
CREATE POLICY "Users can insert personal info" ON personal_info FOR INSERT WITH CHECK (user_owns_profile(profile_id));
CREATE POLICY "Users can update personal info" ON personal_info FOR UPDATE USING (user_owns_profile(profile_id));
CREATE POLICY "Users can delete personal info" ON personal_info FOR DELETE USING (user_owns_profile(profile_id));

-- Addresses Policies
CREATE POLICY "Users can view addresses of their profiles" ON addresses FOR SELECT USING (user_owns_profile(profile_id) AND is_deleted = false);
CREATE POLICY "Users can insert addresses" ON addresses FOR INSERT WITH CHECK (user_owns_profile(profile_id));
CREATE POLICY "Users can update addresses" ON addresses FOR UPDATE USING (user_owns_profile(profile_id));
CREATE POLICY "Users can delete addresses" ON addresses FOR DELETE USING (user_owns_profile(profile_id));

-- Education Policies
CREATE POLICY "Users can view education of their profiles" ON education FOR SELECT USING (user_owns_profile(profile_id) AND is_deleted = false);
CREATE POLICY "Users can insert education" ON education FOR INSERT WITH CHECK (user_owns_profile(profile_id));
CREATE POLICY "Users can update education" ON education FOR UPDATE USING (user_owns_profile(profile_id));
CREATE POLICY "Users can delete education" ON education FOR DELETE USING (user_owns_profile(profile_id));

-- Employment Policies
CREATE POLICY "Users can view employment of their profiles" ON employment FOR SELECT USING (user_owns_profile(profile_id) AND is_deleted = false);
CREATE POLICY "Users can insert employment" ON employment FOR INSERT WITH CHECK (user_owns_profile(profile_id));
CREATE POLICY "Users can update employment" ON employment FOR UPDATE USING (user_owns_profile(profile_id));
CREATE POLICY "Users can delete employment" ON employment FOR DELETE USING (user_owns_profile(profile_id));

-- Documents Policies
CREATE POLICY "Users can view documents of their profiles" ON documents FOR SELECT USING (user_owns_profile(profile_id) AND is_deleted = false);
CREATE POLICY "Users can insert documents" ON documents FOR INSERT WITH CHECK (user_owns_profile(profile_id));
CREATE POLICY "Users can update documents" ON documents FOR UPDATE USING (user_owns_profile(profile_id));
CREATE POLICY "Users can delete documents" ON documents FOR DELETE USING (user_owns_profile(profile_id));

-- Subscriptions Policies
CREATE POLICY "Users can view their own subscription" ON subscriptions FOR SELECT USING (auth.uid() = user_id);

-- Audit Logs Policies
CREATE POLICY "Users can view their own audit logs" ON audit_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own audit logs" ON audit_logs FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Templates and Mappings are globally readable
ALTER TABLE form_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE field_mappings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view templates" ON form_templates FOR SELECT USING (true);
CREATE POLICY "Anyone can view mappings" ON field_mappings FOR SELECT USING (true);
