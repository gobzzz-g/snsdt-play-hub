-- Create user roles enum
CREATE TYPE public.app_role AS ENUM ('admin', 'floor_mentor', 'mentor');

-- Create user_roles table (separate from profiles for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profile policies
CREATE POLICY "Users can view all profiles"
ON public.profiles FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id);

-- Create trigger for new user profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
    NEW.email
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Games table
CREATE TABLE public.games (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL, -- 'quiz_blitz', 'emoji_story', 'meme_forge', 'reaction_dash', 'escape_room'
  is_active BOOLEAN DEFAULT false,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  ended_at TIMESTAMPTZ
);

ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view games"
ON public.games FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Mentors can create games"
ON public.games FOR INSERT
TO authenticated
WITH CHECK (
  public.has_role(auth.uid(), 'mentor') OR 
  public.has_role(auth.uid(), 'floor_mentor') OR 
  public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Mentors can update their games"
ON public.games FOR UPDATE
TO authenticated
USING (
  created_by = auth.uid() OR 
  public.has_role(auth.uid(), 'admin')
);

-- Leaderboard table
CREATE TABLE public.leaderboard (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  game_id UUID REFERENCES public.games(id) ON DELETE CASCADE,
  score INTEGER DEFAULT 0,
  time_taken INTEGER, -- in seconds
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, game_id)
);

ALTER TABLE public.leaderboard ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view leaderboard"
ON public.leaderboard FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Users can insert their own scores"
ON public.leaderboard FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own scores"
ON public.leaderboard FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- Quiz questions table
CREATE TABLE public.quiz_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID REFERENCES public.games(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  options JSONB NOT NULL, -- array of options
  correct_answer INTEGER NOT NULL, -- index of correct option
  time_limit INTEGER DEFAULT 30, -- seconds
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view quiz questions"
ON public.quiz_questions FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Mentors can create quiz questions"
ON public.quiz_questions FOR INSERT
TO authenticated
WITH CHECK (
  public.has_role(auth.uid(), 'mentor') OR 
  public.has_role(auth.uid(), 'floor_mentor') OR 
  public.has_role(auth.uid(), 'admin')
);

-- Enable realtime for leaderboard
ALTER PUBLICATION supabase_realtime ADD TABLE public.leaderboard;
ALTER PUBLICATION supabase_realtime ADD TABLE public.games;