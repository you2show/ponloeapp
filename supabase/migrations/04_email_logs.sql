-- Create email_logs table
CREATE TABLE IF NOT EXISTS public.email_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "to" TEXT NOT NULL,
  subject TEXT NOT NULL,
  html TEXT,
  text TEXT,
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'sent'
);

-- Enable RLS
ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Only admins can read email logs" ON public.email_logs FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
);

CREATE POLICY "System can insert email logs" ON public.email_logs FOR INSERT WITH CHECK (true);
