# NEXORA - Gaming Journey & Teammate Matchmaker

**Tagline**: Your gaming journey lives here.

NEXORA is a native React Native & Expo mobile application designed for gamers to build a visual timeline record of their gaming milestones, discover compatible team members using Match Beacons, participate in curated Community Challenges, and level up through progression.

---

## Technical Stack & Selected Versions
- **Framework**: React Native with Expo Router (SDK 51 compatible)
- **Programming Language**: TypeScript v6.0+
- **State Management**: TanStack Query (React Query)
- **Forms & Validation**: React Hook Form + Zod
- **Backend & Database**: Supabase (PostgreSQL, Auth, Storage, Realtime, Edge Functions)
- **Key Modules**:
  - `expo-secure-store` (Secure session persistence)
  - `expo-image` (High performance asset caching)
  - `expo-notifications` (Push token registration)
  - `lucide-react-native` (Native vector icon representation)

---

## Features Implemented
1. **Secure Registration & Auth**: Email verification, Apple Sign In structure, secure session storage, and Terms acceptance.
2. **Interactive Gaming Journey Timeline**: Post milestones, personal records, and screenshot memories. Toggle visibility settings (Public, Followers-only, Private) and pin entries to profiles.
3. **Match Beacons**: LFG broadcast lobbys. Filter match searches by region, play style, and platform. Coordination reply states (Ready, Joining soon, Need 5m, Invited, Session completed).
4. **Community Challenges**: Submit Journey entries to complete active admin-curated tasks and earn level progression XP.
5. **Trusted Progression Engine**: Level and XP calculations are computed securely in the database triggers on ledger additions. Directly changing stats is restricted by database constraints.
6. **Safety & Moderation**: Text and comment moderation, reporting queues, user mute, and user block mechanics filtering search feeds.
7. **App Store Compliance Account Deletion**: Self-initiated account purge under settings erasing username registry, files, database records, and authentication credentials.

---

## Supabase Database Setup Guide

1. **Deploy Migrations**:
   Run the initial migration SQL code found in `supabase/migrations/20260712000000_nexora_init.sql` directly into your Supabase SQL Editor.
2. **Apply Row Level Security (RLS)**:
   Policies are already enabled in the script by default.
3. **Populate Curated Seed Content**:
   Execute the query commands in `supabase/seed.sql` to populate game catalogs, starter challenges, and founder badges.
4. **Deploy Edge Functions**:
   Deploy the account deletion and text moderation functions:
   ```bash
   supabase functions deploy delete-account
   supabase functions deploy moderate-text
   ```
5. **Environment Configuration**:
   Create a `.env.development` or `.env` using `.env.example` as a template:
   ```env
   EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-publishable-key
   ```
