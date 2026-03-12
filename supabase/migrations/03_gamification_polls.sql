-- 1. Create user_points table
CREATE TABLE IF NOT EXISTS public.user_points (
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE PRIMARY KEY,
  total_points INT DEFAULT 0,
  level INT DEFAULT 1,
  next_level_points INT DEFAULT 500,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create user_streaks table
CREATE TABLE IF NOT EXISTS public.user_streaks (
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE PRIMARY KEY,
  current_streak INT DEFAULT 0,
  longest_streak INT DEFAULT 0,
  last_activity_date TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create user_badges table
CREATE TABLE IF NOT EXISTS public.user_badges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  badge_id TEXT NOT NULL,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, badge_id)
);

-- 4. Create user_behavior_metrics table
CREATE TABLE IF NOT EXISTS public.user_behavior_metrics (
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE PRIMARY KEY,
  posts_created INT DEFAULT 0,
  comments_created INT DEFAULT 0,
  likes_given INT DEFAULT 0,
  likes_received INT DEFAULT 0,
  quran_verses_read INT DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Create polls table
CREATE TABLE IF NOT EXISTS public.polls (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'general',
  created_by UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  allow_multiple BOOLEAN DEFAULT false
);

-- 6. Create poll_options table
CREATE TABLE IF NOT EXISTS public.poll_options (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  poll_id UUID REFERENCES public.polls(id) ON DELETE CASCADE NOT NULL,
  text TEXT NOT NULL,
  votes INT DEFAULT 0
);

-- 7. Create poll_votes table
CREATE TABLE IF NOT EXISTS public.poll_votes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  poll_id UUID REFERENCES public.polls(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  option_ids JSONB NOT NULL,
  voted_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(poll_id, user_id)
);

-- Enable RLS
ALTER TABLE public.user_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_behavior_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.poll_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.poll_votes ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Public read access for user_points" ON public.user_points FOR SELECT USING (true);
CREATE POLICY "Users can update their own points" ON public.user_points FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Public read access for user_streaks" ON public.user_streaks FOR SELECT USING (true);
CREATE POLICY "Users can update their own streaks" ON public.user_streaks FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Public read access for user_badges" ON public.user_badges FOR SELECT USING (true);
CREATE POLICY "Users can insert their own badges" ON public.user_badges FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Public read access for user_behavior_metrics" ON public.user_behavior_metrics FOR SELECT USING (true);
CREATE POLICY "Users can update their own metrics" ON public.user_behavior_metrics FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Public read access for polls" ON public.polls FOR SELECT USING (true);
CREATE POLICY "Users can insert their own polls" ON public.polls FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Public read access for poll_options" ON public.poll_options FOR SELECT USING (true);
CREATE POLICY "Users can insert options for their polls" ON public.poll_options FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update options" ON public.poll_options FOR UPDATE USING (true);

CREATE POLICY "Public read access for poll_votes" ON public.poll_votes FOR SELECT USING (true);
CREATE POLICY "Users can insert their own votes" ON public.poll_votes FOR INSERT WITH CHECK (auth.uid() = user_id);
