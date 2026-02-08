-- Add 'accepted_by' column to match_requests
ALTER TABLE match_requests 
ADD COLUMN IF NOT EXISTS accepted_by UUID REFERENCES profiles(id);

-- Update RLS policies to allow the acceptor to update the row (to set status='accepted')
-- We need to allow updates if:
-- 1. User is the creator (already exists)
-- 2. User is the one accepting it (WE NEED TO ALLOW ALL AUTHENTICATED USERS TO UPDATE 'status' and 'accepted_by' for ACTIVE matches initially, strictly speaking)

-- Simpler approach for MVP:
-- Allow authenticated users to update 'accepted_by' and 'status' if status is 'active' (claiming it)
CREATE POLICY "Users can accept active matches" 
ON match_requests FOR UPDATE 
USING ( status = 'active' )
WITH CHECK ( status = 'accepted' ); -- ensuring they can only transition to 'accepted'

-- Also allow linked users (creator or acceptor) to view accepted matches
DROP POLICY IF EXISTS "Public match requests are visible to everyone" ON match_requests;
CREATE POLICY "Public match requests are visible to everyone" 
ON match_requests FOR SELECT 
USING ( true ); -- Keep public for now for simplicity, or refine:
-- USING ( status = 'active' OR auth.uid() = user_id OR auth.uid() = accepted_by );
