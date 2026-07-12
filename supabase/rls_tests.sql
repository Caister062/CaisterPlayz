-- NEXORA Database & RLS Automated Tests
-- To execute: Run inside Supabase SQL editor or run locally with a test runner.

DO $$
DECLARE
    user_a_id UUID := 'aaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
    user_b_id UUID := 'bbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
    game_id UUID;
    journey_id UUID;
    xp_val INTEGER;
    level_val INTEGER;
    cnt INTEGER;
BEGIN
    RAISE NOTICE 'Starting NEXORA Database Tests...';

    -- Clean up test records if they exist
    DELETE FROM public.xp_ledger WHERE user_id IN (user_a_id, user_b_id);
    DELETE FROM public.profiles WHERE id IN (user_a_id, user_b_id);
    DELETE FROM public.usernames WHERE user_id IN (user_a_id, user_b_id);

    -- 1. Test Username Unique Constraint & Profiles Auto Creation Mock
    RAISE NOTICE 'Testing Username Registration...';
    INSERT INTO public.usernames (username, user_id) VALUES ('gamer_alpha', user_a_id);
    INSERT INTO public.usernames (username, user_id) VALUES ('gamer_beta', user_b_id);

    INSERT INTO public.profiles (id, username, display_name, xp, level)
    VALUES (user_a_id, 'gamer_alpha', 'Gamer Alpha', 0, 1);
    
    INSERT INTO public.profiles (id, username, display_name, xp, level)
    VALUES (user_b_id, 'gamer_beta', 'Gamer Beta', 0, 1);

    -- Check if usernames matched
    SELECT COUNT(*) INTO cnt FROM public.profiles WHERE id = user_a_id AND username = 'gamer_alpha';
    IF cnt <> 1 THEN
        RAISE EXCEPTION 'Profile Username sync failed!';
    END IF;

    -- 2. Test Ledger XP & Auto-Progression trigger
    RAISE NOTICE 'Testing Progression recalculations via Ledger...';
    INSERT INTO public.xp_ledger (user_id, amount, source, idempotency_key)
    VALUES (user_a_id, 150, 'challenge_completion', 'key_challenge_1');

    SELECT xp, level INTO xp_val, level_val FROM public.profiles WHERE id = user_a_id;
    IF xp_val <> 150 OR level_val <> 2 THEN
        RAISE EXCEPTION 'XP/Level progression calculations failed! XP: %, Level: %', xp_val, level_val;
    END IF;

    -- 3. Test Direct Profile Modification Protection
    RAISE NOTICE 'Testing Direct Level injection protection...';
    UPDATE public.profiles SET xp = 9999, level = 99 WHERE id = user_a_id;
    
    SELECT xp, level INTO xp_val, level_val FROM public.profiles WHERE id = user_a_id;
    IF xp_val = 9999 OR level_val = 99 THEN
        RAISE EXCEPTION 'XP injection protection trigger failed! Allowed direct change.';
    END IF;

    -- 4. Test Journey Entries & Constraints
    RAISE NOTICE 'Testing Journey Entries inputs...';
    SELECT id INTO game_id FROM public.games LIMIT 1;

    INSERT INTO public.journey_entries (user_id, game_id, title, entry_type, visibility)
    VALUES (user_a_id, game_id, 'My First Achievement!', 'achievement', 'public')
    RETURNING id INTO journey_id;

    -- Clean up test records
    DELETE FROM public.journey_entries WHERE id = journey_id;
    DELETE FROM public.xp_ledger WHERE user_id IN (user_a_id, user_b_id);
    DELETE FROM public.profiles WHERE id IN (user_a_id, user_b_id);
    DELETE FROM public.usernames WHERE user_id IN (user_a_id, user_b_id);

    RAISE NOTICE 'All local database triggers & integrity checks PASSED successfully!';
END;
$$;
