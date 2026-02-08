-- 1. Add reliability fields to profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS reliability_score INTEGER DEFAULT 100;

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS calibration_games_remaining INTEGER DEFAULT 5;

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS rating_deviation INTEGER DEFAULT 350;

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS elo INTEGER DEFAULT 1200;


-- 2. Create match_requests table
CREATE TABLE IF NOT EXISTS match_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  sport TEXT NOT NULL,
  status TEXT DEFAULT 'active', -- active, accepted, expired, cancelled
  scheduled_time TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Enable RLS
ALTER TABLE match_requests ENABLE ROW LEVEL SECURITY;

-- 4. Create Policies (Drop existing if any to avoid errors on rerun)
DROP POLICY IF EXISTS "Public match requests are visible to everyone" ON match_requests;
CREATE POLICY "Public match requests are visible to everyone" 
ON match_requests FOR SELECT 
USING ( true );

DROP POLICY IF EXISTS "Users can insert their own requests" ON match_requests;
CREATE POLICY "Users can insert their own requests" 
ON match_requests FOR INSERT 
WITH CHECK ( auth.uid() = user_id );

DROP POLICY IF EXISTS "Users can update their own requests" ON match_requests;
CREATE POLICY "Users can update their own requests" 
ON match_requests FOR UPDATE 
USING ( auth.uid() = user_id );
