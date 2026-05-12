# ⚡ CaisterPlayz

A real-time, gamer-centric social media platform built for the **Fortnite** and **Roblox Ghost Hunting** communities. Features a neon-glow dark UI, device-based zero-login auth, a full-screen Reels experience with royalty-free music, engagement analytics, native push notifications, and SMS alerts — all powered by PocketBase.

![Status](https://img.shields.io/badge/status-active-brightgreen) ![License](https://img.shields.io/badge/license-MIT-blue) ![Platform](https://img.shields.io/badge/platform-Web%20%7C%20iOS-blueviolet)

---

## 📑 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Project Structure](#-project-structure)
- [Database Schema](#-database-schema)
- [Getting Started](#-getting-started)
- [Configuration](#-configuration)
- [Deployment](#-deployment)
- [iOS Build](#-ios-build)
- [Contributing](#-contributing)
- [License](#-license)

---

## ✨ Features

### Core Social
| Feature | Description |
|---------|-------------|
| **Feed** | Chronological "For You" and "Following" tabs with infinite scroll |
| **Post Composer** | Text (280-char limit), image/video uploads with client-side compression, game tags (`#Fortnite`, `#RobloxGhosts`, `#LFG`) |
| **Engagement** | Like, repost, comment, bookmark, share — each with optimistic UI updates and sound effects |
| **View Tracking** | IntersectionObserver-based, 1.5s dwell time, excludes the post author's own views |
| **Reels** | Full-screen vertical-swipe media viewer with royalty-free music, double-tap to like, mute toggle |
| **Explore** | Search users/posts, "Who to Follow" carousel, trending feed ranked by engagement score |
| **Profiles** | Editable display name, bio, website, avatar (compressed client-side), follower/following/like counts |
| **Notifications** | Real-time via PocketBase subscriptions + 30s polling fallback, auto-expire after 15s |

### Gamification
| Feature | Description |
|---------|-------------|
| **Gamer Badges** | Deterministic per-user badge (e.g. "Pro Ghost Hunter 👻", "Victory Royale Elite 🏆") |
| **Game Tags** | Neon-glowing inline tags rendered as interactive badges |
| **Trending Marquee** | Scrolling ticker of community trends on the home feed |
| **Sound Effects** | Web Audio API synthesized tones for like, repost, and post actions |

### Platform & Infrastructure
| Feature | Description |
|---------|-------------|
| **Zero-Login Auth** | Device-based identity via `crypto.randomUUID()` stored in `localStorage` |
| **PWA** | Installable progressive web app with offline API caching (Workbox, NetworkFirst strategy) |
| **Push Notifications** | Native OS notifications via Service Worker (`reg.showNotification`) |
| **SMS Alerts** | Server-side PocketBase hook sends SMS via Vonage/Nexmo for new notifications and user signups |
| **Cross-Platform** | Vite dev server exposed on LAN (`0.0.0.0`), accessible from mobile devices on same WiFi |
| **iOS Native** | Capacitor wrapper for App Store distribution |

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 19, Vite 8, Tailwind CSS 4 |
| **Icons** | Lucide React |
| **Backend** | PocketBase (SQLite-backed, real-time subscriptions, JSVM hooks) |
| **Native** | Capacitor 8 (iOS) |
| **CI/CD** | GitHub Actions (build → sign → upload to App Store Connect) |
| **SMS** | Vonage/Nexmo REST API |
| **PWA** | vite-plugin-pwa (Workbox) |

---

## 🏗 Architecture

```
┌────────────────────────────────────────────────────────────────┐
│                        Client (Browser / iOS)                  │
│                                                                │
│   React SPA ──► Vite Dev Server (:5173)                        │
│       │              │                                         │
│       │         Proxy /api/* ────► PocketBase (:8090)           │
│       │         Proxy /_/*   ────►   ├─ REST API               │
│       │                              ├─ Real-time (SSE)        │
│       │                              ├─ Dashboard              │
│       │                              ├─ pb_hooks/ (JSVM)       │
│       │                              └─ pb_data/  (SQLite)     │
│       │                                                        │
│   Service Worker (PWA) ──► Cache API (NetworkFirst)            │
└────────────────────────────────────────────────────────────────┘
```

### Data Flow

1. **Auth**: On first visit, a `deviceId` is generated and stored in `localStorage`. The app queries `cplayz_users` for a match; if none, it creates a new user record.
2. **Posts**: Fetched via paginated REST calls, polled every 30s. A `refreshPosts` custom DOM event triggers instant re-fetch after post creation/deletion.
3. **Notifications**: Real-time PocketBase subscription (`cplayz_notifications`) + 30s polling fallback. Notifications auto-expire client-side after 15s and are cleaned from the DB.
4. **SMS**: PocketBase JSVM hooks (`pb_hooks/sms_notifications.pb.js`) fire on `cplayz_notifications` and `cplayz_users` record creation, sending SMS via Vonage to the admin phone.

---

## 📁 Project Structure

```
CaisterPlayz/
├── .github/
│   └── workflows/
│       └── build-ios.yml          # GitHub Actions: build → sign → App Store
├── src/
│   ├── App.jsx                    # Root component, tab routing, global state
│   ├── main.jsx                   # React DOM entry point
│   ├── index.css                  # Design system (Tailwind theme, animations, utilities)
│   ├── pocketbase.js              # PocketBase client singleton
│   ├── hooks.js                   # Custom React hooks (auth, posts, comments, notifications, follows)
│   ├── utils.js                   # Image compression, time formatting, engagement scoring, rich text parsing, gamification
│   ├── sounds.js                  # Web Audio API synthesizer for UI feedback
│   ├── musicLibrary.js            # Royalty-free music tracks + audio player singleton
│   └── components/
│       ├── HomeTab.jsx            # For You / Following feed with trending marquee
│       ├── ExploreTab.jsx         # Search, Who to Follow, trending posts
│       ├── ReelsTab.jsx           # Full-screen vertical-swipe Reels viewer
│       ├── NotificationsTab.jsx   # Notification list with push permission prompt
│       ├── ProfileTab.jsx         # User profile with edit modal
│       ├── PostCard.jsx           # Post card with all engagement actions
│       ├── Composer.jsx           # Post creation form with media, music, game tags
│       └── Shared.jsx             # Reusable UI: Avatar, Spinner, Toast, FollowButton, RichText, etc.
├── pb_hooks/
│   └── sms_notifications.pb.js   # PocketBase JSVM hook for SMS alerts
├── pb_migrations/                 # PocketBase auto-generated schema migrations
├── pb_data/                       # PocketBase SQLite database (auto-generated)
├── public/                        # Static assets (favicon, icons)
├── ios/                           # Capacitor iOS project (Xcode)
├── CaisterPlayz-iOS/              # iOS-specific assets
├── dist/                          # Production build output
├── pocketbase.exe                 # PocketBase server binary (Windows)
├── vite.config.js                 # Vite configuration (proxy, PWA, TailwindCSS)
├── capacitor.config.ts            # Capacitor native config (iOS scheme, splash, status bar)
├── package.json                   # Dependencies and scripts
└── index.html                     # HTML entry point
```

---

## 🗄 Database Schema

PocketBase collections (defined via `pb_migrations/`):

### `cplayz_users`
| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Auto-generated primary key |
| `deviceId` | string | Unique device identifier for zero-login auth |
| `displayName` | string | User's display name |
| `bio` | string | User bio (max 160 chars) |
| `website` | string | User website URL |
| `avatarUrl` | string | Base64-encoded compressed avatar image |
| `created` | datetime | Record creation timestamp |
| `updated` | datetime | Last update timestamp |

### `cplayz_posts`
| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Auto-generated primary key |
| `userId` | string | Author's user ID |
| `text` | string | Post content (max 280 chars) |
| `imageUrl` | string | Base64-encoded image or video data |
| `musicId` | string | Selected music track ID (for Reels) |
| `musicName` | string | Music track display name |
| `likedBy` | json (string[]) | Array of user IDs who liked |
| `viewedBy` | json (string[]) | Array of user IDs who viewed |
| `repostedBy` | json (string[]) | Array of user IDs who reposted |
| `favoritedBy` | json (string[]) | Array of user IDs who bookmarked |
| `created` | datetime | Record creation timestamp |

### `cplayz_comments`
| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Auto-generated primary key |
| `postId` | string | Parent post ID |
| `userId` | string | Commenter's user ID |
| `text` | string | Comment content |
| `created` | datetime | Record creation timestamp |

### `cplayz_follows`
| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Auto-generated primary key |
| `followerId` | string | User who is following |
| `followingId` | string | User being followed |

### `cplayz_notifications`
| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Auto-generated primary key |
| `recipientId` | string | User who receives the notification |
| `senderId` | string | User who triggered the notification |
| `type` | string | One of: `like`, `comment`, `repost`, `follow` |
| `postId` | string | Related post ID (empty for follows) |
| `read` | boolean | Whether the notification has been read |
| `created` | datetime | Record creation timestamp |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 22+
- **npm** 10+
- **PocketBase** binary (`pocketbase.exe` is included in the repo for Windows)

### 1. Install Dependencies

```bash
npm install
```

### 2. Start PocketBase

```bash
./pocketbase.exe serve
# Server starts at http://127.0.0.1:8090
# Dashboard at http://127.0.0.1:8090/_/
```

### 3. Start the Dev Server

```bash
npm run dev
# App runs at http://localhost:5173
# Also accessible on LAN at http://<your-ip>:5173
```

### 4. Access the App

- **Desktop**: Open `http://localhost:5173`
- **Mobile (same WiFi)**: Open `http://<your-local-ip>:5173`

> **Note**: The Vite dev server proxies all `/api/*` and `/_/*` requests to PocketBase on port 8090, so both frontend and backend run as a single origin.

---

## ⚙ Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_PB_URL` | `window.location.origin` | PocketBase server URL (set for production builds) |

### Vite Config Highlights (`vite.config.js`)

- **Proxy**: `/api/*` and `/_/*` → `http://127.0.0.1:8090`
- **Host**: `0.0.0.0` (LAN accessible)
- **PWA**: Auto-update, offline caching via Workbox (NetworkFirst for API, excludes `/api/realtime`)
- **TailwindCSS 4**: Via `@tailwindcss/vite` plugin

### Capacitor Config (`capacitor.config.ts`)

- **App ID**: `com.caisterplayz.app`
- **iOS Scheme**: `https`
- **Splash Screen**: 2s auto-hide, black background
- **Status Bar**: Dark style, black background

---

## 🌐 Deployment

### Production Build

```bash
npm run build
# Output: ./dist/
```

The `dist/` folder can be served by PocketBase itself or any static host (Netlify, Vercel, Cloudflare Pages). Set `VITE_PB_URL` to your hosted PocketBase URL before building.

### PocketBase Hosting

PocketBase is a single binary. Deploy it to any VPS or cloud provider:

```bash
./pocketbase serve --http=0.0.0.0:8090
```

For production, place the built `dist/` files so PocketBase serves them, or use a reverse proxy (Caddy, Nginx).

---

## 📱 iOS Build

The project uses **Capacitor** to wrap the web app as a native iOS app, with a **GitHub Actions** workflow for automated builds.

### Local Development

```bash
npm run build:ios    # Build web + sync to iOS
npx cap open ios     # Open in Xcode
```

### CI/CD Pipeline (`.github/workflows/build-ios.yml`)

Triggered on push to `main` or manual dispatch:

1. **Build** the web app with `npm run build`
2. **Sync** Capacitor iOS project
3. **Sign** with Apple certificate and provisioning profile (from GitHub Secrets)
4. **Archive** and **Export** signed IPA
5. **Upload** to App Store Connect via `altool`
6. **Artifact** the IPA for download

#### Required GitHub Secrets

| Secret | Description |
|--------|-------------|
| `POCKETBASE_URL` | Production PocketBase URL |
| `BUILD_CERTIFICATE_BASE64` | Base64-encoded .p12 certificate |
| `P12_PASSWORD` | Certificate password |
| `BUILD_PROVISION_PROFILE_BASE64` | Base64-encoded provisioning profile |
| `APPLE_ID` | Apple ID email for App Store Connect |
| `APP_SPECIFIC_PASSWORD` | App-specific password for `altool` |

---

## 🎨 Design System

The app uses a **neon gamer aesthetic** with a dark theme:

### Color Palette

| Token | Hex | Usage |
|-------|-----|-------|
| `brand-primary` | `#00f0ff` | Neon Cyan — primary actions, links, active states |
| `brand-secondary` | `#a855f7` | Phantom Purple — music, secondary accents |
| `brand-accent` | `#f50057` | Hot Pink — trending, emphasis |
| `brand-success` | `#39ff14` | Neon Green — online indicators, reposts, success |
| `brand-danger` | `#ff003c` | Error states, delete confirmations |
| `brand-warning` | `#eab308` | Content warnings, character limit |
| `dark-bg` | `#000000` | App background |
| `dark-surface` | `#16181c` | Cards, inputs |
| `dark-border` | `#2f3336` | Borders, dividers |
| `dark-text` | `#e7e9ea` | Primary text |
| `dark-muted` | `#71767b` | Secondary text, timestamps |

### Animations

- **Heart burst** — Like button bounce with color fill
- **Repost burst** — Repost icon spring animation
- **Bookmark burst** — Bookmark save pop
- **Number slide** — Slot-machine counter transitions
- **Toast notifications** — Slide-in from top
- **Shimmer skeleton** — Loading placeholder gradient
- **Waveform** — Music playing indicator bars
- **Marquee** — Infinite scroll trending ticker
- **Double-tap heart** — Instagram-style full-screen heart on Reels

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE.md](LICENSE.md) file for details.

---

<p align="center">
  <strong>⚡ CaisterPlayz</strong> — Built for gamers, by gamers.
</p>
