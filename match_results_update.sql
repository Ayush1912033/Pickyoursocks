CREATE TABLE IF NOT EXISTS match_results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  player1_id UUID REFERENCES profiles(id) NOT NULL,
  player2_id UUID REFERENCES profiles(id) NOT NULL,
  winner_id UUID REFERENCES profiles(id),
  sport TEXT NOT NULL,
  score TEXT,
  played_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  is_verified BOOLEAN DEFAULT FALSE
);

ALTER TABLE match_results ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public match results are visible to everyone" ON match_results;
CREATE POLICY "Public match results are visible to everyone" 
ON match_results FOR SELECT 
USING ( true );

DROP POLICY IF EXISTS "Players can insert their own matches" ON match_results;
CREATE POLICY "Players can insert their own matches" 
ON match_results FOR INSERT 
WITH CHECK ( 
  auth.uid() = player1_id OR 
  auth.uid() = player2_id 
);

ALTER TABLE match_requests 
ADD COLUMN IF NOT EXISTS accepted_by UUID REFERENCES profiles(id);

DROP POLICY IF EXISTS "Users can accept active matches" ON match_requests;
CREATE POLICY "Users can accept active matches" 
ON match_requests FOR UPDATE 
USING ( status = 'active' )
WITH CHECK ( status = 'accepted' );

DROP POLICY IF EXISTS "Public match requests are visible to everyone" ON match_requests;
CREATE POLICY "Public match requests are visible to everyone" 
ON match_requests FOR SELECT 
USING ( true );
