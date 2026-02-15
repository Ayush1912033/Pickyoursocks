-- Migration: Fix Radar ELO Discrepancy
-- Description: Updates get_radar_matches to include elo_ratings and use sport-specific ELO for match quality.

-- Drop existing function first because the return type (columns) is changing
DROP FUNCTION IF EXISTS get_radar_matches(uuid, text);

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
    -- Get current user's location and sport-specific ELO
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
        p.elo,
        p.elo_ratings,
        p.reliability_score,
        p.lat,
        p.lng,
        -- Haversine distance in km
        (6371 * acos(
            LEAST(1.0, cos(radians(curr_lat)) * cos(radians(p.lat)) * 
            cos(radians(p.lng) - radians(curr_lng)) + 
            sin(radians(curr_lat)) * sin(radians(p.lat)))
        )) as distance,
        -- Match quality based on sport-specific ELO proximity
        1.0 - LEAST(1.0, ABS(COALESCE((p.elo_ratings->>_selected_sport)::integer, p.elo, 800) - curr_elo) / 800.0) as match_quality
    FROM profiles p
    WHERE p.id != _current_user_id
      AND p.lat IS NOT NULL 
      AND p.lng IS NOT NULL
      -- Filter to users who play this sport
      AND (p.sports @> array[_selected_sport]::text[] OR p.elo_ratings ? _selected_sport)
    ORDER BY match_quality DESC, distance ASC
    LIMIT 20;
END;
$$;
