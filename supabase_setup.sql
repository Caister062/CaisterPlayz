-- Supabase Setup Script for IndieStream Music App

-- 1. Create custom users profile table (Supabase manages auth.users internally)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  display_name TEXT,
  xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public profiles are viewable by everyone." ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile." ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own profile." ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- 2. Create tracks table
CREATE TABLE public.tracks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  artist_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  artist_name TEXT NOT NULL,
  audio_url TEXT NOT NULL,
  cover_url TEXT,
  liked_by UUID[] DEFAULT '{}',
  play_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for tracks
ALTER TABLE public.tracks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tracks are viewable by everyone." ON public.tracks FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert tracks." ON public.tracks FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = artist_id);
CREATE POLICY "Users can update their own tracks or like tracks." ON public.tracks FOR UPDATE USING (auth.role() = 'authenticated');

-- 3. Create Storage Bucket for music and covers
INSERT INTO storage.buckets (id, name, public) VALUES ('music-assets', 'music-assets', true) ON CONFLICT DO NOTHING;

-- Storage Policies
CREATE POLICY "Music assets are public." ON storage.objects FOR SELECT USING (bucket_id = 'music-assets');
CREATE POLICY "Authenticated users can upload music assets." ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'music-assets' AND auth.role() = 'authenticated');

-- 4. Triggers to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (new.id, COALESCE(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)));
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
