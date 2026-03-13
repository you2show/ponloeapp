-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 1. Profiles are viewable by everyone
DROP POLICY IF EXISTS "Profiles are viewable by everyone." ON public.profiles;
CREATE POLICY "Profiles are viewable by everyone."
  ON public.profiles FOR SELECT
  USING (true);

-- 2. Users can update their own profile
DROP POLICY IF EXISTS "Users can update their own profile." ON public.profiles;
CREATE POLICY "Users can update their own profile."
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- 3. Admins and Owner have full access to profiles
DROP POLICY IF EXISTS "Admins have full access to profiles." ON public.profiles;
CREATE POLICY "Admins have full access to profiles."
  ON public.profiles FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND (role = 'admin' OR auth.jwt() ->> 'email' = 'tg1276188382@ponloe.com')
    )
  );
