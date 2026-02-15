-- Run this in your Supabase SQL Editor to restore your ELO ratings.
-- Replace the placeholders with your actual usernames and ratings.

-- Account 1 (Intermediate)
UPDATE public.profiles
SET rating = 1200, elo = 1200
WHERE username = 'REPLACE_WITH_USER1_USERNAME';

-- Account 2 (Intermediate)
UPDATE public.profiles
SET rating = 1187, elo = 1187
WHERE username = 'REPLACE_WITH_USER2_USERNAME';

-- Reset Glicko-2 uncertainty so the next match moves their rating properly
UPDATE public.profiles
SET rd = 350, volatility = 0.06
WHERE username IN ('REPLACE_WITH_USER1_USERNAME', 'REPLACE_WITH_USER2_USERNAME');
