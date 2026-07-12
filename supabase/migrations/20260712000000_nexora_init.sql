-- NEXORA Supabase Database Migration
-- Target: PostgreSQL 15+ (Supabase)

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TABLES

-- Curated list of games
CREATE TABLE IF NOT EXISTS public.games (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT UNIQUE NOT NULL,
    genre TEXT,
    cover_url TEXT,
    platforms TEXT[] NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Username registry (prevents race conditions/impersonation)
CREATE TABLE IF NOT EXISTS public.usernames (
    username TEXT PRIMARY KEY,
    user_id UUID UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    CONSTRAINT username_length CHECK (char_length(username) >= 3 AND char_length(username) <= 20),
    CONSTRAINT username_chars CHECK (username ~* '^[a-zA-Z0-9_\.]+$')
);

-- Profiles linked to auth.users
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY,
    username TEXT UNIQUE,
    display_name TEXT NOT NULL,
    avatar_url TEXT,
    banner_url TEXT,
    bio TEXT,
    region TEXT,
    play_style TEXT,
    xp INTEGER NOT NULL DEFAULT 0 CONSTRAINT xp_non_negative CHECK (xp >= 0),
    level INTEGER NOT NULL DEFAULT 1 CONSTRAINT level_positive CHECK (level >= 1),
    is_private BOOLEAN NOT NULL DEFAULT false,
    hide_activity BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    CONSTRAINT fk_profiles_usernames FOREIGN KEY (username) REFERENCES public.usernames(username) ON DELETE SET NULL
);

-- User preferences
CREATE TABLE IF NOT EXISTS public.user_preferences (
    user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    notification_follows BOOLEAN NOT NULL DEFAULT true,
    notification_reactions BOOLEAN NOT NULL DEFAULT true,
    notification_comments BOOLEAN NOT NULL DEFAULT true,
    notification_beacons BOOLEAN NOT NULL DEFAULT true,
    notification_challenges BOOLEAN NOT NULL DEFAULT true,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- User's library games (favorite/owned)
CREATE TABLE IF NOT EXISTS public.user_games (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    game_id UUID NOT NULL REFERENCES public.games(id) ON DELETE CASCADE,
    platform TEXT,
    skill_level TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    CONSTRAINT uq_user_game_platform UNIQUE (user_id, game_id, platform)
);

-- Gaming Journey Entries
CREATE TABLE IF NOT EXISTS public.journey_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    game_id UUID REFERENCES public.games(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    entry_type TEXT NOT NULL CONSTRAINT check_entry_type CHECK (entry_type IN ('achievement', 'personal_record', 'rank_milestone', 'first_time', 'completed_game', 'screenshot_memory', 'tournament_result', 'challenge_completion', 'team_accomplishment', 'custom')),
    visibility TEXT NOT NULL DEFAULT 'public' CONSTRAINT check_visibility CHECK (visibility IN ('public', 'followers_only', 'private')),
    platform TEXT,
    is_pinned BOOLEAN NOT NULL DEFAULT false,
    achievement_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
    moderation_status TEXT NOT NULL DEFAULT 'approved' CONSTRAINT check_moderation_status CHECK (moderation_status IN ('pending', 'approved', 'quarantined', 'removed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Journey Media assets
CREATE TABLE IF NOT EXISTS public.journey_media (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entry_id UUID NOT NULL REFERENCES public.journey_entries(id) ON DELETE CASCADE,
    media_url TEXT NOT NULL,
    media_type TEXT NOT NULL DEFAULT 'image',
    file_size INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Journey Reactions (GG, Fire, Heart, Trophy, Shocked)
CREATE TABLE IF NOT EXISTS public.journey_reactions (
    entry_id UUID NOT NULL REFERENCES public.journey_entries(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    emoji TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    PRIMARY KEY (entry_id, user_id, emoji)
);

-- Journey Comments
CREATE TABLE IF NOT EXISTS public.journey_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entry_id UUID NOT NULL REFERENCES public.journey_entries(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    comment_text TEXT NOT NULL,
    moderation_status TEXT NOT NULL DEFAULT 'approved' CONSTRAINT check_comment_mod CHECK (moderation_status IN ('pending', 'approved', 'quarantined', 'removed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Social follows table
CREATE TABLE IF NOT EXISTS public.follows (
    follower_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    following_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'accepted' CONSTRAINT check_follow_status CHECK (status IN ('pending', 'accepted')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    PRIMARY KEY (follower_id, following_id)
);

-- Blocks
CREATE TABLE IF NOT EXISTS public.blocks (
    blocker_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    blocked_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    PRIMARY KEY (blocker_id, blocked_id)
);

-- Mutes
CREATE TABLE IF NOT EXISTS public.mutes (
    muter_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    muted_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    PRIMARY KEY (muter_id, muted_id)
);

-- Match Beacons
CREATE TABLE IF NOT EXISTS public.match_beacons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    creator_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    game_id UUID NOT NULL REFERENCES public.games(id) ON DELETE CASCADE,
    mode TEXT,
    platform TEXT,
    region TEXT,
    play_style TEXT,
    skill_preference TEXT,
    mic_preference BOOLEAN NOT NULL DEFAULT false,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    max_group_size INTEGER NOT NULL DEFAULT 4 CONSTRAINT check_group_size CHECK (max_group_size >= 2 AND max_group_size <= 20),
    description TEXT,
    visibility TEXT NOT NULL DEFAULT 'public' CONSTRAINT check_beacon_visibility CHECK (visibility IN ('public', 'friends_only')),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Match Beacon Join Requests
CREATE TABLE IF NOT EXISTS public.beacon_join_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    beacon_id UUID NOT NULL REFERENCES public.match_beacons(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'pending' CONSTRAINT check_request_status CHECK (status IN ('pending', 'accepted', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    CONSTRAINT uq_beacon_user_req UNIQUE (beacon_id, user_id)
);

-- Match Beacon Members
CREATE TABLE IF NOT EXISTS public.beacon_members (
    beacon_id UUID NOT NULL REFERENCES public.match_beacons(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    is_ready BOOLEAN NOT NULL DEFAULT false,
    coordination_status TEXT NOT NULL DEFAULT 'none' CONSTRAINT check_coord CHECK (coordination_status IN ('ready', 'joining_soon', 'need_five', 'invite_sent', 'session_completed', 'none')),
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    PRIMARY KEY (beacon_id, user_id)
);

-- Challenges
CREATE TABLE IF NOT EXISTS public.challenges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    game_id UUID REFERENCES public.games(id) ON DELETE CASCADE,
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    rules TEXT,
    banner_url TEXT,
    xp_reward INTEGER NOT NULL DEFAULT 100,
    participation_limit INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Challenge Submissions
CREATE TABLE IF NOT EXISTS public.challenge_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    challenge_id UUID NOT NULL REFERENCES public.challenges(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    entry_id UUID NOT NULL REFERENCES public.journey_entries(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'pending' CONSTRAINT check_submission_status CHECK (status IN ('pending', 'approved', 'rejected')),
    xp_awarded BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    CONSTRAINT uq_challenge_user UNIQUE (challenge_id, user_id)
);

-- Badges
CREATE TABLE IF NOT EXISTS public.badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    icon_url TEXT,
    xp_bonus INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- User Badges Earned
CREATE TABLE IF NOT EXISTS public.user_badges (
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    badge_id UUID NOT NULL REFERENCES public.badges(id) ON DELETE CASCADE,
    earned_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    PRIMARY KEY (user_id, badge_id)
);

-- XP Ledger (trusted progression history)
CREATE TABLE IF NOT EXISTS public.xp_ledger (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    amount INTEGER NOT NULL,
    source TEXT NOT NULL,
    source_id UUID,
    idempotency_key TEXT UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Notifications
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    source_id UUID,
    message TEXT,
    is_read BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Devices mapping for Push Tokens
CREATE TABLE IF NOT EXISTS public.devices (
    user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    expo_push_token TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Policy Acceptances history
CREATE TABLE IF NOT EXISTS public.policy_acceptances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL, -- references auth.users (validated on trigger/edge func)
    policy_version TEXT NOT NULL,
    accepted_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Account Deletion Requests
CREATE TABLE IF NOT EXISTS public.account_deletion_requests (
    user_id UUID PRIMARY KEY, -- references auth.users
    scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Support Requests
CREATE TABLE IF NOT EXISTS public.support_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    email TEXT NOT NULL,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'open',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- User Reports
CREATE TABLE IF NOT EXISTS public.reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reporter_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    reported_user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    content_type TEXT NOT NULL CONSTRAINT check_report_content CHECK (content_type IN ('profile', 'journey_entry', 'comment', 'match_beacon', 'challenge_submission')),
    content_id UUID NOT NULL,
    reason TEXT NOT NULL,
    details TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CONSTRAINT check_report_status CHECK (status IN ('pending', 'under_review', 'resolved', 'dismissed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Moderation Actions
CREATE TABLE IF NOT EXISTS public.moderation_actions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    target_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    action_type TEXT NOT NULL CONSTRAINT check_mod_action CHECK (action_type IN ('warning', 'mute_24h', 'mute_7d', 'suspend_permanent')),
    reason TEXT NOT NULL,
    moderator_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Moderation Audit Logs
CREATE TABLE IF NOT EXISTS public.moderation_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    moderator_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    target_id UUID,
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 3. INDEXES FOR SPEED AND QUERY OPTIMIZATION
CREATE INDEX IF NOT EXISTS idx_journey_entries_user ON public.journey_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_journey_entries_visibility ON public.journey_entries(visibility) WHERE (moderation_status = 'approved');
CREATE INDEX IF NOT EXISTS idx_journey_comments_entry ON public.journey_comments(entry_id);
CREATE INDEX IF NOT EXISTS idx_match_beacons_expires ON public.match_beacons(expires_at);
CREATE INDEX IF NOT EXISTS idx_xp_ledger_user ON public.xp_ledger(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_reports_status ON public.reports(status);

-- 4. DATABASE FUNCTIONS AND TRIGGERS FOR PROGRESSION AND SECURITY

-- Profile XP Recalculation Trigger Function
CREATE OR REPLACE FUNCTION public.recalculate_user_progression()
RETURNS TRIGGER AS $$
DECLARE
    total_xp INTEGER;
    new_level INTEGER;
BEGIN
    -- Sum user's total XP from the ledger
    SELECT COALESCE(SUM(amount), 0) INTO total_xp
    FROM public.xp_ledger
    WHERE user_id = NEW.user_id;

    -- Calculate level (Level = 1 + floor(sqrt(xp / 100)))
    new_level := 1 + floor(sqrt(total_xp::double precision / 100.0));

    -- Update profile XP and Level
    UPDATE public.profiles
    SET xp = total_xp,
        level = new_level,
        updated_at = now()
    WHERE id = NEW.user_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER trg_xp_ledger_insert
AFTER INSERT ON public.xp_ledger
FOR EACH ROW
EXECUTE FUNCTION public.recalculate_user_progression();

-- Trigger to prevent direct profiles XP and Level updates from Client RLS writes
CREATE OR REPLACE FUNCTION public.protect_profile_progression()
RETURNS TRIGGER AS $$
BEGIN
    NEW.xp := OLD.xp;
    NEW.level := OLD.level;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_protect_profile_progression
BEFORE UPDATE OF xp, level ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.protect_profile_progression();

-- Sync usernames to profiles
CREATE OR REPLACE FUNCTION public.sync_profile_username()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.profiles
    SET username = NEW.username
    WHERE id = NEW.user_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER trg_sync_profile_username
AFTER INSERT ON public.usernames
FOR EACH ROW
EXECUTE FUNCTION public.sync_profile_username();

-- Trigger for auto-profile creation on auth signup
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER AS $$
DECLARE
    rand_username TEXT;
BEGIN
    rand_username := 'user_' || substring(md5(random()::text) from 1 for 10);
    
    INSERT INTO public.usernames (username, user_id)
    VALUES (rand_username, NEW.id);

    INSERT INTO public.profiles (id, username, display_name, avatar_url, bio, xp, level)
    VALUES (
        NEW.id,
        rand_username,
        COALESCE(NEW.raw_user_meta_data->>'display_name', 'Gamer_' || substring(md5(random()::text) from 1 for 4)),
        NEW.raw_user_meta_data->>'avatar_url',
        'Welcome to my NEXORA gaming journey!',
        0,
        1
    );

    INSERT INTO public.user_preferences (user_id)
    VALUES (NEW.id);

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. ROW LEVEL SECURITY (RLS) ACTIVATION
ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usernames ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_games ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journey_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journey_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journey_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journey_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mutes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_beacons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.beacon_join_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.beacon_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenge_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.xp_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.policy_acceptances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.account_deletion_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.moderation_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.moderation_audit_logs ENABLE ROW LEVEL SECURITY;

-- 6. RLS POLICIES

-- Public static tables (games, badges, challenges)
CREATE POLICY "Anyone can view games" ON public.games FOR SELECT USING (true);
CREATE POLICY "Anyone can view badges" ON public.badges FOR SELECT USING (true);
CREATE POLICY "Anyone can view challenges" ON public.challenges FOR SELECT USING (true);

-- Usernames
CREATE POLICY "Anyone can view usernames" ON public.usernames FOR SELECT USING (true);
CREATE POLICY "Users can claim their own username" ON public.usernames FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own username" ON public.usernames FOR UPDATE USING (auth.uid() = user_id);

-- Profiles
CREATE POLICY "Users can view public profiles or followers-only private profiles" ON public.profiles FOR SELECT
    USING (
        is_private = false 
        OR auth.uid() = id
        OR EXISTS (
            SELECT 1 FROM public.follows 
            WHERE follower_id = auth.uid() 
              AND following_id = id 
              AND status = 'accepted'
        )
    );
CREATE POLICY "Users can edit their own profiles" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- User Preferences
CREATE POLICY "Users can view their own preferences" ON public.user_preferences FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own preferences" ON public.user_preferences FOR UPDATE USING (auth.uid() = user_id);

-- User Games library
CREATE POLICY "Anyone can view library games" ON public.user_games FOR SELECT USING (true);
CREATE POLICY "Users can manage their game library" ON public.user_games FOR ALL USING (auth.uid() = user_id);

-- Journey Entries
CREATE POLICY "Select approved journey entries based on visibility settings" ON public.journey_entries FOR SELECT
    USING (
        moderation_status = 'approved' AND (
            visibility = 'public'
            OR user_id = auth.uid()
            OR (visibility = 'followers_only' AND EXISTS (
                SELECT 1 FROM public.follows 
                WHERE follower_id = auth.uid() 
                  AND following_id = user_id 
                  AND status = 'accepted'
            ))
        )
    );
CREATE POLICY "Users can manage their own journey entries" ON public.journey_entries FOR ALL
    USING (auth.uid() = user_id);

-- Journey Comments
CREATE POLICY "Select approved comments of viewable entries" ON public.journey_comments FOR SELECT
    USING (
        moderation_status = 'approved' AND EXISTS (
            SELECT 1 FROM public.journey_entries
            WHERE id = entry_id
        )
    );
CREATE POLICY "Users can add comments if not blocked/muted by author" ON public.journey_comments FOR INSERT
    WITH CHECK (
        auth.uid() = user_id AND NOT EXISTS (
            SELECT 1 FROM public.blocks
            WHERE (blocker_id = user_id AND blocked_id = auth.uid())
               OR (blocker_id = auth.uid() AND blocked_id = user_id)
        )
    );
CREATE POLICY "Users can delete their own comments" ON public.journey_comments FOR DELETE
    USING (auth.uid() = user_id);

-- Follows
CREATE POLICY "Anyone can see follow connections" ON public.follows FOR SELECT USING (true);
CREATE POLICY "Users can follow others" ON public.follows FOR INSERT WITH CHECK (auth.uid() = follower_id);
CREATE POLICY "Users can unfollow or approve follow requests" ON public.follows FOR UPDATE USING (auth.uid() = follower_id OR auth.uid() = following_id);
CREATE POLICY "Users can remove followers" ON public.follows FOR DELETE USING (auth.uid() = follower_id OR auth.uid() = following_id);

-- Blocks & Mutes
CREATE POLICY "Users can manage their block list" ON public.blocks FOR ALL USING (auth.uid() = blocker_id);
CREATE POLICY "Users can manage their mute list" ON public.mutes FOR ALL USING (auth.uid() = muter_id);

-- Match Beacons
CREATE POLICY "Anyone can view public beacons except blocked" ON public.match_beacons FOR SELECT
    USING (
        expires_at > now() AND (
            visibility = 'public' 
            OR creator_id = auth.uid() 
            OR (visibility = 'friends_only' AND EXISTS (
                SELECT 1 FROM public.follows 
                WHERE follower_id = auth.uid() 
                  AND following_id = creator_id 
                  AND status = 'accepted'
            ))
        ) AND NOT EXISTS (
            SELECT 1 FROM public.blocks 
            WHERE (blocker_id = creator_id AND blocked_id = auth.uid())
               OR (blocker_id = auth.uid() AND blocked_id = creator_id)
        )
    );
CREATE POLICY "Users can create beacons" ON public.match_beacons FOR INSERT WITH CHECK (auth.uid() = creator_id);
CREATE POLICY "Users can update/delete their own beacons" ON public.match_beacons FOR ALL USING (auth.uid() = creator_id);

-- Beacon Join Requests
CREATE POLICY "Beacon creators and request owners can see requests" ON public.beacon_join_requests FOR SELECT
    USING (
        auth.uid() = user_id 
        OR EXISTS (
            SELECT 1 FROM public.match_beacons 
            WHERE id = beacon_id AND creator_id = auth.uid()
        )
    );
CREATE POLICY "Users can request to join beacons" ON public.beacon_join_requests FOR INSERT
    WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Beacon creators can accept or reject requests" ON public.beacon_join_requests FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.match_beacons 
            WHERE id = beacon_id AND creator_id = auth.uid()
        )
    );

-- XP Ledger
CREATE POLICY "Read own ledger history" ON public.xp_ledger FOR SELECT USING (auth.uid() = user_id);

-- Notifications
CREATE POLICY "Read and update own notifications" ON public.notifications FOR ALL USING (auth.uid() = user_id);

-- Policy acceptances
CREATE POLICY "Manage policy acceptances" ON public.policy_acceptances FOR ALL USING (auth.uid() = user_id);

-- Reports
CREATE POLICY "Users can submit reports" ON public.reports FOR INSERT WITH CHECK (auth.uid() = reporter_id);
