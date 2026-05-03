/* ═══════════════════════════════════════════
   CaisterPlayz Music Library
   Free / Uncopyrighted Tracks
   ═══════════════════════════════════════════ */

// All tracks are royalty-free and safe for content creation
// Sources: SoundHelix (free samples), public domain
export const MUSIC_TRACKS = [
  {
    id: 'lofi-chill',
    name: 'Lo-Fi Chill',
    artist: 'SoundHelix',
    genre: 'Lo-Fi',
    color: '#a78bfa',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
  },
  {
    id: 'summer-vibes',
    name: 'Summer Vibes',
    artist: 'SoundHelix',
    genre: 'Pop',
    color: '#f97316',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
  },
  {
    id: 'chill-abstract',
    name: 'Chill Abstract',
    artist: 'SoundHelix',
    genre: 'Ambient',
    color: '#06b6d4',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
  },
  {
    id: 'electronic-future',
    name: 'Electronic Future',
    artist: 'SoundHelix',
    genre: 'Electronic',
    color: '#22c55e',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
  },
  {
    id: 'upbeat-energy',
    name: 'Upbeat Energy',
    artist: 'SoundHelix',
    genre: 'Dance',
    color: '#ef4444',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
  },
  {
    id: 'mellow-groove',
    name: 'Mellow Groove',
    artist: 'SoundHelix',
    genre: 'R&B',
    color: '#ec4899',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3',
  },
  {
    id: 'deep-bass',
    name: 'Deep Bass',
    artist: 'SoundHelix',
    genre: 'Hip Hop',
    color: '#8b5cf6',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3',
  },
  {
    id: 'tropical-sunset',
    name: 'Tropical Sunset',
    artist: 'SoundHelix',
    genre: 'Tropical',
    color: '#eab308',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3',
  },
  {
    id: 'cinematic-epic',
    name: 'Cinematic Epic',
    artist: 'SoundHelix',
    genre: 'Cinematic',
    color: '#3b82f6',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3',
  },
  {
    id: 'acoustic-morning',
    name: 'Acoustic Morning',
    artist: 'SoundHelix',
    genre: 'Acoustic',
    color: '#d97706',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3',
  },
];

export function getTrackById(id) {
  return MUSIC_TRACKS.find(t => t.id === id) || null;
}

/* ─── Audio Player Singleton ─── */
let currentAudio = null;
let currentTrackId = null;

export function playTrack(trackId, options = {}) {
  const track = getTrackById(trackId);
  if (!track) return;

  // Same track already playing
  if (currentTrackId === trackId && currentAudio && !currentAudio.paused) {
    return;
  }

  stopTrack();

  currentAudio = new Audio(track.url);
  currentAudio.loop = options.loop !== false;
  currentAudio.volume = options.volume || 0.4;
  currentTrackId = trackId;

  currentAudio.play().catch(() => {
    // Autoplay blocked — will play on next user interaction
    console.log('Autoplay blocked, will retry on interaction');
  });
}

export function stopTrack() {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.src = '';
    currentAudio = null;
    currentTrackId = null;
  }
}

export function previewTrack(trackId) {
  const track = getTrackById(trackId);
  if (!track) return;

  stopTrack();

  currentAudio = new Audio(track.url);
  currentAudio.loop = false;
  currentAudio.volume = 0.5;
  currentTrackId = trackId;

  // Only play 10 seconds for preview
  currentAudio.play().catch(() => {});
  setTimeout(() => {
    if (currentTrackId === trackId && currentAudio) {
      stopTrack();
    }
  }, 10000);
}

export function isPlaying() {
  return currentAudio && !currentAudio.paused;
}

export function getCurrentTrackId() {
  return currentTrackId;
}
