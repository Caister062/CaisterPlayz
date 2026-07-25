import { useState, useEffect } from 'react';
import { Music, Search, Upload, User, ShieldAlert, Disc } from 'lucide-react';
import { Capacitor } from '@capacitor/core';
import { App as CapApp } from '@capacitor/app';
import pb from './pocketbase';
import { useUserProfile } from './hooks';
import AuthView from './components/AuthView';
import LoadingScreen from './components/LoadingScreen';

import AudioPlayer from './components/music/AudioPlayer';
import DiscoverView from './components/music/DiscoverView';
import UploadView from './components/music/UploadView';

export default function App() {
  const [tab, setTab] = useState('discover');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [userId, setUserId] = useState(localStorage.getItem('cplayz_user_id') || pb.authStore.model?.id || null);
  const [booting, setBooting] = useState(true);

  // Audio Player State
  const [currentTrack, setCurrentTrack] = useState(null);
  const [playlist, setPlaylist] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(-1);

  useEffect(() => {
    // Basic auth logic from original App.jsx
    const unsub = pb.authStore.onChange((token, model) => {
      const storedId = localStorage.getItem('cplayz_user_id');
      if (model?.id) {
        setUserId(model.id);
      } else if (!storedId || !storedId.startsWith('guest_')) {
        setUserId(null);
      }
    }, true);

    setTimeout(() => setBooting(false), 2000);

    return () => unsub();
  }, []);

  const { profile: me } = useUserProfile(userId);

  const goTab = t => {
    if (tab === t) return;
    if (navigator.vibrate) navigator.vibrate(8);
    setTab(t);
    setIsTransitioning(true);
    setTimeout(() => setIsTransitioning(false), 300);
  };

  const playTrack = (track, list, index) => {
    setCurrentTrack(track);
    if (list) {
      setPlaylist(list);
      setCurrentIndex(index);
    }
  };

  const handleNextTrack = () => {
    if (playlist.length > 0 && currentIndex < playlist.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setCurrentTrack(playlist[currentIndex + 1]);
    }
  };

  const handlePrevTrack = () => {
    if (playlist.length > 0 && currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setCurrentTrack(playlist[currentIndex - 1]);
    }
  };

  if (booting) {
    return <LoadingScreen />;
  }

  if (!userId) {
    return <AuthView onAuthSuccess={(id) => setUserId(id)} />;
  }

  return (
    <div className="music-app-container">
      <header className="music-top-nav">
        <div className="brand">
          <Disc size={28} className="spin-icon" color="#10b981" />
          <h1>CaisterPlayz Music</h1>
        </div>
      </header>

      <main className="music-main">
        <div className={`tab-content ${isTransitioning ? 'fade-enter' : ''}`}>
          {tab === 'discover' && <DiscoverView onPlayTrack={playTrack} />}
          {tab === 'upload' && <UploadView user={me} />}
          {tab === 'profile' && (
            <div className="centered">
              <h2>{me?.displayName || 'Artist Profile'}</h2>
              <p>Total Streams: 0</p>
              <button className="btn outline" onClick={() => { pb.authStore.clear(); localStorage.removeItem('cplayz_user_id'); setUserId(null); }}>Log Out</button>
            </div>
          )}
        </div>
      </main>

      {currentTrack && (
        <AudioPlayer 
          currentTrack={currentTrack} 
          onNext={handleNextTrack} 
          onPrev={handlePrevTrack} 
        />
      )}

      <nav className="music-bottom-nav">
        <button className={`nav-item ${tab === 'discover' ? 'active' : ''}`} onClick={() => goTab('discover')}>
          <Music size={24} />
          <span>Discover</span>
        </button>
        <button className={`nav-item ${tab === 'search' ? 'active' : ''}`} onClick={() => goTab('search')}>
          <Search size={24} />
          <span>Search</span>
        </button>
        <button className={`nav-item ${tab === 'upload' ? 'active' : ''}`} onClick={() => goTab('upload')}>
          <Upload size={24} />
          <span>Upload</span>
        </button>
        <button className={`nav-item ${tab === 'profile' ? 'active' : ''}`} onClick={() => goTab('profile')}>
          <User size={24} />
          <span>Profile</span>
        </button>
      </nav>
    </div>
  );
}
