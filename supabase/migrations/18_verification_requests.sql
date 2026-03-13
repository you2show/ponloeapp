-- Create verification_requests table
CREATE TABLE IF NOT EXISTS verification_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  requested_role TEXT NOT NULL CHECK (requested_role IN ('scholar', 'creator')),
  full_name TEXT NOT NULL,
  graduation_place TEXT NOT NULL,
  major TEXT NOT NULL,
  graduation_year TEXT NOT NULL,
  photo_url TEXT NOT NULL,
  document_url TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS
ALTER TABLE verification_requests ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own requests"
  ON verification_requests FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own requests"
  ON verification_requests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Admins can view and update all requests (assuming role='admin' in profiles)
CREATE POLICY "Admins can view all requests"
  ON verification_requests FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  ));

CREATE POLICY "Admins can update requests"
  ON verification_requests FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  ));

-- Create storage bucket for verification docs if it doesn't exist
INSERT INTO storage.buckets (id, name, public) 
VALUES ('verification_docs', 'verification_docs', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for verification_docs
CREATE POLICY "Users can upload their own verification docs"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'verification_docs' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own verification docs"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'verification_docs' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Admins can view all verification docs"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'verification_docs' AND EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  ));
