CREATE OR REPLACE FUNCTION verify_match_result()
RETURNS TRIGGER AS $$
DECLARE
    _winner_id UUID;
    _score TEXT;
BEGIN
    -- Check if both parties have submitted their claims
    -- CORRECTED: player1_claim instead of player_1_claim
    IF NEW.player1_claim IS NOT NULL AND NEW.player2_claim IS NOT NULL THEN
        
        -- Check if both agree on the winner
        IF (NEW.player1_claim->>'winner_id')::UUID = (NEW.player2_claim->>'winner_id')::UUID THEN
            
            _winner_id := (NEW.player1_claim->>'winner_id')::UUID;
            _score := NEW.player1_claim->>'score'; 
            
            NEW.is_verified := true;
            NEW.winner_id := _winner_id;
            NEW.score := _score;
            
            UPDATE match_requests
            SET status = 'completed'
            WHERE id = NEW.match_id;
            
        ELSE
            NEW.is_verified := false;
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
