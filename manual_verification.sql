-- 1. Find an active match request for a specific user (Replace YOUR_USER_ID with the actual ID from the frontend if known, or just pick one)
-- For this test, I will assume we are logged in as User A. I need to find a match where User A is involved.
-- Let's list active matches first to pick one.
SELECT * FROM match_requests WHERE status = 'accepted' LIMIT 1;

-- 2. Once we have a match_id (let's say 'MATCH_UUID'), and we know who is who.
-- Assume User A (logged in) reported a WIN.
-- Use this SQL to simulate User B reporting a LOSS (which confirms User A's win).

-- Replace 'MATCH_UUID' with the actual ID
-- Replace 'USER_B_UUID' with the opponent's ID
-- Replace 'USER_A_UUID' with the winner's ID
/*
INSERT INTO match_results (match_id, sport, player1_id, player2_id, player2_claim)
VALUES (
    'MATCH_UUID', 
    'Badminton', 
    'USER_A_UUID', 
    'USER_B_UUID', 
    '{"winner_id": "USER_A_UUID", "score": "21-19"}'::jsonb
)
ON CONFLICT (match_id) 
DO UPDATE SET 
    player2_claim = EXCLUDED.player2_claim;
*/
