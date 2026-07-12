-- NEXORA Database Seed Script
-- Populates curated games, badges, and initial challenges.

-- 1. SEED GAMES
INSERT INTO public.games (title, genre, cover_url, platforms) VALUES
('Minecraft', 'Sandbox', 'https://images.unsplash.com/photo-1607988795691-3d0147b43231?w=500', ARRAY['PC', 'Xbox One', 'PS4', 'Switch', 'iOS', 'Android']),
('Elden Ring', 'Action RPG', 'https://images.unsplash.com/photo-1655821889508-8e6d8a39a2d3?w=500', ARRAY['PC', 'PS5', 'Xbox Series X', 'PS4', 'Xbox One']),
('Valorant', 'Tactical Shooter', 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=500', ARRAY['PC', 'PS5', 'Xbox Series X']),
('Apex Legends', 'Battle Royale', 'https://images.unsplash.com/photo-1553481187-be93c21490a9?w=500', ARRAY['PC', 'PS5', 'Xbox Series X', 'PS4', 'Xbox One', 'Switch']),
('Fortnite', 'Battle Royale', 'https://images.unsplash.com/photo-1589241062272-c0a000072dfa?w=500', ARRAY['PC', 'PS5', 'Xbox Series X', 'PS4', 'Xbox One', 'Switch', 'Android', 'iOS']),
('Genshin Impact', 'Action RPG', 'https://images.unsplash.com/photo-1612287230202-1bf1d85d1bdf?w=500', ARRAY['PC', 'PS5', 'PS4', 'Switch', 'iOS', 'Android']);

-- 2. SEED BADGES
INSERT INTO public.badges (name, description, icon_url, xp_bonus) VALUES
('Journey Starter', 'Earned by publishing your first Gaming Journey entry.', 'trophy', 50),
('Matchmate', 'Created or joined your first Match Beacon session.', 'users', 50),
('Challenge Conqueror', 'Completed a Curated Community Challenge.', 'award', 100),
('GG Reactionist', 'Given or received 10 GG reactions on journey entries.', 'smile', 25),
('Level 5 Vanguard', 'Reach user progression Level 5.', 'star', 100),
('NEXORA Founder', 'Participate during the NEXORA Beta Launch phase.', 'shield', 200);

-- 3. SEED COMMUNITY CHALLENGES
INSERT INTO public.challenges (title, description, game_id, start_date, end_date, rules, banner_url, xp_reward, participation_limit) 
SELECT 
    'Share Your Legendary Build', 
    'Post a screenshot memory showcasing your best character loadout, gear build, or housing base designs in any game!', 
    id, 
    now(), 
    now() + INTERVAL '30 days', 
    '1. Must feature clean, original interface design. 2. Tag with correct platform. 3. Include a description detailing choices.', 
    'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=600', 
    150, 
    NULL
FROM public.games 
WHERE title = 'Minecraft' 
LIMIT 1;

INSERT INTO public.challenges (title, description, game_id, start_date, end_date, rules, banner_url, xp_reward, participation_limit) 
SELECT 
    'Co-op Success Victory', 
    'Publish a journey entry showing completion of a co-operative dungeon run, raid boss, or teammate victory!', 
    id, 
    now(), 
    now() + INTERVAL '14 days', 
    '1. Post must include screenshot memory. 2. Tag at least 1 teammate profile username. 3. Entry type must be team_accomplishment.', 
    'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=600', 
    200, 
    500
FROM public.games 
WHERE title = 'Elden Ring' 
LIMIT 1;
