export interface Profile {
  id: string;
  username: string;
  display_name: string;
  avatar_url?: string;
  banner_url?: string;
  bio?: string;
  region?: string;
  play_style?: string;
  xp: number;
  level: number;
  is_private: boolean;
  hide_activity: boolean;
  created_at: string;
  updated_at: string;
}

export interface Game {
  id: string;
  title: string;
  genre?: string;
  cover_url?: string;
  platforms: string[];
  created_at: string;
}

export interface UserGame {
  id: string;
  user_id: string;
  game_id: string;
  platform?: string;
  skill_level?: string;
  created_at: string;
}

export type JourneyEntryType =
  | 'achievement'
  | 'personal_record'
  | 'rank_milestone'
  | 'first_time'
  | 'completed_game'
  | 'screenshot_memory'
  | 'tournament_result'
  | 'challenge_completion'
  | 'team_accomplishment'
  | 'custom';

export type JourneyVisibility = 'public' | 'followers_only' | 'private';

export interface JourneyEntry {
  id: string;
  user_id: string;
  game_id?: string;
  title: string;
  description?: string;
  entry_type: JourneyEntryType;
  visibility: JourneyVisibility;
  platform?: string;
  is_pinned: boolean;
  achievement_date: string;
  moderation_status: 'pending' | 'approved' | 'quarantined' | 'removed';
  created_at: string;
  updated_at: string;
  profiles?: Profile; // Populated from relation join
  games?: Game; // Populated from relation join
  journey_media?: JourneyMedia[];
}

export interface JourneyMedia {
  id: string;
  entry_id: string;
  media_url: string;
  media_type: string;
  file_size?: number;
  created_at: string;
}

export interface JourneyReaction {
  entry_id: string;
  user_id: string;
  emoji: string;
  created_at: string;
  profiles?: Profile;
}

export interface JourneyComment {
  id: string;
  entry_id: string;
  user_id: string;
  comment_text: string;
  moderation_status: 'pending' | 'approved' | 'quarantined' | 'removed';
  created_at: string;
  updated_at: string;
  profiles?: Profile;
}

export interface Follow {
  follower_id: string;
  following_id: string;
  status: 'pending' | 'accepted';
  created_at: string;
}

export interface Block {
  blocker_id: string;
  blocked_id: string;
  created_at: string;
}

export interface Mute {
  muter_id: string;
  muted_id: string;
  created_at: string;
}

export interface MatchBeacon {
  id: string;
  creator_id: string;
  game_id: string;
  mode?: string;
  platform?: string;
  region?: string;
  play_style?: string;
  skill_preference?: string;
  mic_preference: boolean;
  start_time: string;
  max_group_size: number;
  description?: string;
  visibility: 'public' | 'friends_only';
  expires_at: string;
  created_at: string;
  profiles?: Profile;
  games?: Game;
}

export interface BeaconJoinRequest {
  id: string;
  beacon_id: string;
  user_id: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  profiles?: Profile;
}

export interface BeaconMember {
  beacon_id: string;
  user_id: string;
  is_ready: boolean;
  coordination_status: 'ready' | 'joining_soon' | 'need_five' | 'invite_sent' | 'session_completed' | 'none';
  joined_at: string;
  profiles?: Profile;
}

export interface Challenge {
  id: string;
  title: string;
  description?: string;
  game_id?: string;
  start_date?: string;
  end_date?: string;
  rules?: string;
  banner_url?: string;
  xp_reward: number;
  participation_limit?: number;
  created_at: string;
  games?: Game;
}

export interface ChallengeSubmission {
  id: string;
  challenge_id: string;
  user_id: string;
  entry_id: string;
  status: 'pending' | 'approved' | 'rejected';
  xp_awarded: boolean;
  created_at: string;
  journey_entries?: JourneyEntry;
}

export interface Badge {
  id: string;
  name: string;
  description?: string;
  icon_url?: string;
  xp_bonus: number;
  created_at: string;
}

export interface UserBadge {
  user_id: string;
  badge_id: string;
  earned_at: string;
  badges?: Badge;
}

export interface XPLedgerEntry {
  id: string;
  user_id: string;
  amount: number;
  source: string;
  source_id?: string;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  sender_id?: string;
  source_id?: string;
  message?: string;
  is_read: boolean;
  created_at: string;
  sender_profile?: Profile;
}

export interface Report {
  id: string;
  reporter_id: string;
  reported_user_id?: string;
  content_type: 'profile' | 'journey_entry' | 'comment' | 'match_beacon' | 'challenge_submission';
  content_id: string;
  reason: string;
  details?: string;
  status: 'pending' | 'under_review' | 'resolved' | 'dismissed';
  created_at: string;
}
