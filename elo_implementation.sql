CREATE OR REPLACE FUNCTION update_player_elos()
RETURNS TRIGGER AS $$
DECLARE
    winner_id_val UUID;
    loser_id_val UUID;
    winner_rating INTEGER;
    loser_rating INTEGER;
    winner_expected DECIMAL;
    loser_expected DECIMAL;
    winner_new_rating INTEGER;
    loser_new_rating INTEGER;
    k_factor INTEGER := 32;
    should_process BOOLEAN := false;
BEGIN
    -- Determine if we should process this row
    IF TG_OP = 'INSERT' THEN
        IF NEW.is_verified = true THEN
            should_process := true;
        END IF;
    ELSIF TG_OP = 'UPDATE' THEN
        IF NEW.is_verified = true AND (OLD.is_verified = false OR OLD.is_verified IS NULL) THEN
            should_process := true;
        END IF;
    END IF;

    IF should_process THEN
        winner_id_val := NEW.winner_id;
        
        -- Determine loser
        IF NEW.player1_id = winner_id_val THEN
            loser_id_val := NEW.player2_id;
        ELSE
            loser_id_val := NEW.player1_id;
        END IF;

        -- Get current ratings (default 800 if null)
        SELECT COALESCE(elo, 800) INTO winner_rating FROM profiles WHERE id = winner_id_val;
        SELECT COALESCE(elo, 800) INTO loser_rating FROM profiles WHERE id = loser_id_val;

        -- Calculate Expected Score
        winner_expected := calculate_expected_score(winner_rating, loser_rating);
        loser_expected := calculate_expected_score(loser_rating, winner_rating);

        -- Calculate New Ratings
        winner_new_rating := winner_rating + ROUND(k_factor * (1 - winner_expected));
        loser_new_rating := loser_rating + ROUND(k_factor * (0 - loser_expected));

        -- Update Profiles
        UPDATE profiles SET elo = winner_new_rating WHERE id = winner_id_val;
        UPDATE profiles SET elo = loser_new_rating WHERE id = loser_id_val;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_elo ON match_results;
CREATE TRIGGER trigger_update_elo
AFTER INSERT OR UPDATE ON match_results
FOR EACH ROW
EXECUTE FUNCTION update_player_elos();
