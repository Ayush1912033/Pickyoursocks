ALTER TABLE match_requests 
ADD COLUMN IF NOT EXISTS opponent_id UUID REFERENCES profiles(id);

DROP POLICY IF EXISTS "Users can view relevant match requests" ON match_requests;
DROP POLICY IF EXISTS "Users can insert match requests" ON match_requests;
DROP POLICY IF EXISTS "Users can update their match requests" ON match_requests;

CREATE POLICY "Users can view relevant match requests"
ON match_requests FOR SELECT
USING (
    auth.uid() = user_id 
    OR auth.uid() = opponent_id 
    OR auth.uid() = accepted_by
    OR status = 'active'
);

CREATE POLICY "Users can insert match requests"
ON match_requests FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their match requests"
ON match_requests FOR UPDATE
USING (
    auth.uid() = user_id 
    OR auth.uid() = opponent_id
);

-- DROP old function to allow parameter name changes
DROP FUNCTION IF EXISTS get_radar_matches(uuid, text);

CREATE OR REPLACE FUNCTION get_radar_matches(
    _current_user_id UUID,
    _selected_sport TEXT
)
RETURNS TABLE (
    id UUID,
    name TEXT,
    profile_photo TEXT,
    elo INTEGER,
    match_quality NUMERIC,
    reliability_score INTEGER
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    _current_user_elo INTEGER;
BEGIN
    SELECT COALESCE(p.elo, 800) INTO _current_user_elo
    FROM profiles p
    WHERE p.id = _current_user_id;

    IF _current_user_elo IS NULL THEN
        _current_user_elo := 800;
    END IF;

    RETURN QUERY
    SELECT 
        p.id,
        p.name,
        p.profile_photo,
        COALESCE(p.elo, 800) as elo,
        CASE 
            WHEN ABS(COALESCE(p.elo, 800) - _current_user_elo) <= 200 THEN 0.9
            WHEN ABS(COALESCE(p.elo, 800) - _current_user_elo) <= 400 THEN 0.7
            ELSE 0.5
        END as match_quality,
        80 as reliability_score
    FROM profiles p
    WHERE p.id != _current_user_id
    AND p.sports @> ARRAY[LOWER(_selected_sport)]::TEXT[]
    AND NOT EXISTS (
        SELECT 1 FROM match_requests mr
        WHERE (mr.user_id = _current_user_id AND mr.opponent_id = p.id)
           OR (mr.user_id = p.id AND mr.opponent_id = _current_user_id)
        AND mr.status IN ('pending', 'accepted')
    )
    ORDER BY match_quality DESC
    LIMIT 20;
END;
$$;
