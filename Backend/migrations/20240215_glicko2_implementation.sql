-- Glicko-2 Rating System Implementation

-- 1. Initialize Glicko-2 parameters for existing users if null
UPDATE public.profiles
SET 
    rating = COALESCE(rating, COALESCE(elo, 1500)),
    rd = COALESCE(rd, 350.0),
    volatility = COALESCE(volatility, 0.06),
    elo = COALESCE(elo, 1500)
WHERE rating IS NULL OR rd IS NULL OR volatility IS NULL;

-- 2. Create Glicko-2 Math Helpers
CREATE OR REPLACE FUNCTION public.glicko2_g(phi DOUBLE PRECISION) 
RETURNS DOUBLE PRECISION AS $$
BEGIN
    RETURN 1.0 / SQRT(1.0 + 3.0 * phi * phi / (PI() * PI()));
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.glicko2_e(mu DOUBLE PRECISION, mu_j DOUBLE PRECISION, phi_j DOUBLE PRECISION) 
RETURNS DOUBLE PRECISION AS $$
BEGIN
    RETURN 1.0 / (1.0 + EXP(-glicko2_g(phi_j) * (mu - mu_j)));
END;
$$ LANGUAGE plpgsql;

-- 3. Glicko-2 New Volatility Helper
CREATE OR REPLACE FUNCTION public.glicko2_new_volatility(
    phi DOUBLE PRECISION, 
    v DOUBLE PRECISION, 
    delta DOUBLE PRECISION, 
    sigma DOUBLE PRECISION, 
    tau DOUBLE PRECISION
) 
RETURNS DOUBLE PRECISION AS $$
DECLARE
    a DOUBLE PRECISION;
    A_val DOUBLE PRECISION;
    B_val DOUBLE PRECISION;
    f_A DOUBLE PRECISION;
    f_B DOUBLE PRECISION;
    C_val DOUBLE PRECISION;
    f_C DOUBLE PRECISION;
    k INTEGER := 1;
    epsilon DOUBLE PRECISION := 0.000001;
BEGIN
    a := LN(sigma * sigma);
    A_val := a;
    
    IF delta * delta > phi * phi + v THEN
        B_val := LN(delta * delta - phi * phi - v);
    ELSE
        WHILE ( (EXP(a - k * tau) * (delta * delta - phi * phi - v - EXP(a - k * tau)) / (2.0 * POWER(phi * phi + v + EXP(a - k * tau), 2))) - ((a - k * tau - a) / (tau * tau)) ) < 0 LOOP
            k := k + 1;
        END LOOP;
        B_val := a - k * tau;
    END IF;

    f_A := (EXP(A_val) * (delta * delta - phi * phi - v - EXP(A_val)) / (2.0 * POWER(phi * phi + v + EXP(A_val), 2))) - ((A_val - a) / (tau * tau));
    f_B := (EXP(B_val) * (delta * delta - phi * phi - v - EXP(B_val)) / (2.0 * POWER(phi * phi + v + EXP(B_val), 2))) - ((B_val - a) / (tau * tau));

    WHILE ABS(B_val - A_val) > epsilon LOOP
        C_val := A_val + (A_val - B_val) * f_A / (f_B - f_A);
        f_C := (EXP(C_val) * (delta * delta - phi * phi - v - EXP(C_val)) / (2.0 * POWER(phi * phi + v + EXP(C_val), 2))) - ((C_val - a) / (tau * tau));
        
        IF f_C * f_B < 0 THEN
            A_val := B_val;
            f_A := f_B;
        ELSE
            f_A := f_A / 2.0;
        END IF;
        
        B_val := C_val;
        f_B := f_C;
    END LOOP;

    RETURN EXP(A_val / 2.0);
END;
$$ LANGUAGE plpgsql;

-- 4. Glicko-2 Update Function
CREATE OR REPLACE FUNCTION public.update_player_glicko2()
RETURNS TRIGGER AS $$
DECLARE
    winner_id_val UUID;
    loser_id_val UUID;
    
    r1 DOUBLE PRECISION;
    RD1 DOUBLE PRECISION;
    sigma1 DOUBLE PRECISION;
    mu1 DOUBLE PRECISION;
    phi1 DOUBLE PRECISION;
    
    r2 DOUBLE PRECISION;
    RD2 DOUBLE PRECISION;
    sigma2 DOUBLE PRECISION;
    mu2 DOUBLE PRECISION;
    phi2 DOUBLE PRECISION;
    
    v1 DOUBLE PRECISION;
    delta1 DOUBLE PRECISION;
    sigma1_prime DOUBLE PRECISION;
    phi1_star DOUBLE PRECISION;
    phi1_prime DOUBLE PRECISION;
    mu1_prime DOUBLE PRECISION;
    
    v2 DOUBLE PRECISION;
    delta2 DOUBLE PRECISION;
    sigma2_prime DOUBLE PRECISION;
    phi2_star DOUBLE PRECISION;
    phi2_prime DOUBLE PRECISION;
    mu2_prime DOUBLE PRECISION;
    
    tau DOUBLE PRECISION := 0.5; -- System constant
    scale CONSTANT DOUBLE PRECISION := 173.7178;
    
    should_process BOOLEAN := false;
BEGIN
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
        
        IF NEW.player1_id = winner_id_val THEN
            loser_id_val := NEW.player2_id;
        ELSE
            loser_id_val := NEW.player1_id;
        END IF;

        SELECT COALESCE(rating, 1500), COALESCE(rd, 350.0), COALESCE(volatility, 0.06) 
        INTO r1, RD1, sigma1 FROM profiles WHERE id = winner_id_val;
        
        SELECT COALESCE(rating, 1500), COALESCE(rd, 350.0), COALESCE(volatility, 0.06) 
        INTO r2, RD2, sigma2 FROM profiles WHERE id = loser_id_val;

        mu1 := (r1 - 1500.0) / scale;
        phi1 := RD1 / scale;
        mu2 := (r2 - 1500.0) / scale;
        phi2 := RD2 / scale;

        v1 := 1.0 / (POWER(glicko2_g(phi2), 2) * glicko2_e(mu1, mu2, phi2) * (1.0 - glicko2_e(mu1, mu2, phi2)));
        delta1 := v1 * glicko2_g(phi2) * (1.0 - glicko2_e(mu1, mu2, phi2));
        
        v2 := 1.0 / (POWER(glicko2_g(phi1), 2) * glicko2_e(mu2, mu1, phi1) * (1.0 - glicko2_e(mu2, mu1, phi1)));
        delta2 := v2 * glicko2_g(phi1) * (0.0 - glicko2_e(mu2, mu1, phi1));

        sigma1_prime := glicko2_new_volatility(phi1, v1, delta1, sigma1, tau);
        sigma2_prime := glicko2_new_volatility(phi2, v2, delta2, sigma2, tau);

        phi1_star := SQRT(phi1 * phi1 + sigma1_prime * sigma1_prime);
        phi2_star := SQRT(phi2 * phi2 + sigma2_prime * sigma2_prime);

        phi1_prime := 1.0 / SQRT(1.0 / (phi1_star * phi1_star) + 1.0 / v1);
        mu1_prime := mu1 + (phi1_prime * phi1_prime) * (glicko2_g(phi2) * (1.0 - glicko2_e(mu1, mu2, phi2)));
        
        phi2_prime := 1.0 / SQRT(1.0 / (phi2_star * phi2_star) + 1.0 / v2);
        mu2_prime := mu2 + (phi2_prime * phi2_prime) * (glicko2_g(phi1) * (0.0 - glicko2_e(mu2, mu1, phi1)));

        UPDATE public.profiles SET 
            rating = ROUND((mu1_prime * scale + 1500.0)::NUMERIC),
            rd = ROUND((phi1_prime * scale)::NUMERIC, 2),
            volatility = ROUND(sigma1_prime::NUMERIC, 6),
            elo = ROUND((mu1_prime * scale + 1500.0)::NUMERIC), 
            games_played = COALESCE(games_played, 0) + 1,
            last_match_at = NOW(),
            updated_at = NOW()
        WHERE id = winner_id_val;

        UPDATE public.profiles SET 
            rating = ROUND((mu2_prime * scale + 1500.0)::NUMERIC),
            rd = ROUND((phi2_prime * scale)::NUMERIC, 2),
            volatility = ROUND(sigma2_prime::NUMERIC, 6),
            elo = ROUND((mu2_prime * scale + 1500.0)::NUMERIC),
            games_played = COALESCE(games_played, 0) + 1,
            last_match_at = NOW(),
            updated_at = NOW()
        WHERE id = loser_id_val;

    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5. Replace the trigger
DROP TRIGGER IF EXISTS trigger_update_elo ON public.match_results;

CREATE TRIGGER trigger_update_glicko
AFTER INSERT OR UPDATE ON public.match_results
FOR EACH ROW EXECUTE FUNCTION public.update_player_glicko2();
