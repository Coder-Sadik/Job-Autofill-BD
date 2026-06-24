-- Insert buckets
INSERT INTO storage.buckets (id, name, public) VALUES ('profile-photos', 'profile-photos', false) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('signatures', 'signatures', false) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('documents', 'documents', false) ON CONFLICT DO NOTHING;

-- Set up RLS for storage.objects

-- Allow users to insert their own files
CREATE POLICY "Users can upload files to their own profile folder" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id IN ('profile-photos', 'signatures', 'documents') AND 
  auth.uid() = owner
);

-- Allow users to update their own files
CREATE POLICY "Users can update their own files" ON storage.objects FOR UPDATE USING (
  bucket_id IN ('profile-photos', 'signatures', 'documents') AND 
  auth.uid() = owner
);

-- Allow users to read their own files
CREATE POLICY "Users can view their own files" ON storage.objects FOR SELECT USING (
  bucket_id IN ('profile-photos', 'signatures', 'documents') AND 
  auth.uid() = owner
);

-- Allow users to delete their own files
CREATE POLICY "Users can delete their own files" ON storage.objects FOR DELETE USING (
  bucket_id IN ('profile-photos', 'signatures', 'documents') AND 
  auth.uid() = owner
);
