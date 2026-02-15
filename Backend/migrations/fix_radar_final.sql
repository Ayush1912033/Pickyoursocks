-- Migration: Final ELO Sync & Radar Fix
-- Description: Adds missing columns and ensures ELO consistency across Radar and Profile.

-- 1. Ensure location columns exist
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS lat DOUBLE PRECISION;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS lng DOUBLE PRECISION;

-- 2. Drop existing function to update return signature
DROP FUNCTION IF EXISTS get_radar_matches(uuid, text);

-- 3. Redefine get_radar_matches with robust ELO fallback
-- This logic mirrors the Profile page: 
-- 1. Use sport-specific rating if it exists in elo_ratings.
-- 2. Otherwise fall back to the main 'elo' column (the "better data").
-- 3. Final default to 800.
CREATE OR REPLACE FUNCTION get_radar_matches(
    _current_user_id UUID,
    _selected_sport TEXT
)
RETURNS TABLE (
    id UUID,
    name TEXT,
    username TEXT,
    profile_photo TEXT,
    elo INTEGER,
    elo_ratings JSONB,
    reliability_score INTEGER,
    lat DOUBLE PRECISION,
    lng DOUBLE PRECISION,
    distance DOUBLE PRECISION,
    match_quality DOUBLE PRECISION
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    curr_lat DOUBLE PRECISION;
    curr_lng DOUBLE PRECISION;
    curr_elo INTEGER;
BEGIN
    -- Get current user's location and their "best" ELO for this sport
    SELECT 
        profiles.lat, 
        profiles.lng,
        COALESCE((profiles.elo_ratings->>_selected_sport)::integer, profiles.elo, 800)
    INTO curr_lat, curr_lng, curr_elo
    FROM profiles
    WHERE profiles.id = _current_user_id;

    RETURN QUERY
    SELECT 
        p.id,
        p.name,
        p.username,
        p.profile_photo,
        -- We return the calculated effective ELO so the frontend is always in sync
        COALESCE((p.elo_ratings->>_selected_sport)::integer, p.elo, 800) as elo,
        p.elo_ratings,
        p.reliability_score,
        p.lat,
        p.lng,
        -- Haversine distance calculate
        CASE 
            WHEN curr_lat IS NOT NULL AND curr_lng IS NOT NULL AND p.lat IS NOT NULL AND p.lng IS NOT NULL
            THEN (6371 * acos(LEAST(1.0, cos(radians(curr_lat)) * cos(radians(p.lat)) * cos(radians(p.lng) - radians(curr_lng)) + sin(radians(curr_lat)) * sin(radians(p.lat)))))
            ELSE 0.0 -- Fallback to 0 distance if location is missing
        END as distance,
        -- Match quality based on score proximity
        1.0 - LEAST(1.0, ABS(COALESCE((p.elo_ratings->>_selected_sport)::integer, p.elo, 800) - curr_elo) / 800.0) as match_quality
    FROM profiles p
    WHERE p.id != _current_user_id
      -- Only show users who either have coordinates OR are in the same general region/have played before
      -- For now, we filter to those with coordinates to keep the Radar accurate
      AND p.lat IS NOT NULL 
      AND p.lng IS NOT NULL
      -- Filter to users who play this sport
      AND (p.sports @> array[_selected_sport]::text[] OR p.elo_ratings ? _selected_sport)
    ORDER BY match_quality DESC, distance ASC
    LIMIT 20;
END;
$$;
