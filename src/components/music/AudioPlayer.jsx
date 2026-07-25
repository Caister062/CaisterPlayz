import React, { useRef, useEffect, useState } from 'react';
import { Play, Pause, SkipForward, SkipBack, Volume2, VolumeX } from 'lucide-react';

export default function AudioPlayer({ currentTrack, onNext, onPrev }) {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    if (audioRef.current && currentTrack) {
      audioRef.current.play().then(() => setIsPlaying(true)).catch(e => console.log('Autoplay prevented', e));
    }
  }, [currentTrack]);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setProgress(audioRef.current.currentTime);
      setDuration(audioRef.current.duration);
    }
  };

  const handleSeek = (e) => {
    const time = Number(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setProgress(time);
    }
  };

  if (!currentTrack) return null;

  return (
    <div className="audio-player-container">
      <audio 
        ref={audioRef} 
        src={currentTrack.audioUrl} 
        onTimeUpdate={handleTimeUpdate}
        onEnded={onNext}
        autoPlay
      />
      <div className="player-track-info">
        <img src={currentTrack.coverUrl || 'https://placehold.co/100x100/111/333?text=Art'} alt="cover" className="player-cover" />
        <div className="player-text">
          <div className="player-title">{currentTrack.title}</div>
          <div className="player-artist">{currentTrack.artistName}</div>
        </div>
      </div>

      <div className="player-controls-main">
        <div className="player-buttons">
          <button onClick={onPrev} className="player-btn"><SkipBack size={20} /></button>
          <button onClick={togglePlay} className="player-btn play-btn">
            {isPlaying ? <Pause size={24} color="#000" /> : <Play size={24} color="#000" fill="#000" />}
          </button>
          <button onClick={onNext} className="player-btn"><SkipForward size={20} /></button>
        </div>
        <div className="player-progress-wrapper">
          <span className="time-text">{formatTime(progress)}</span>
          <input 
            type="range" 
            min="0" 
            max={duration || 0} 
            value={progress} 
            onChange={handleSeek} 
            className="player-slider"
          />
          <span className="time-text">{formatTime(duration)}</span>
        </div>
      </div>

      <div className="player-volume">
        <button onClick={() => {
          if (audioRef.current) {
            audioRef.current.muted = !isMuted;
            setIsMuted(!isMuted);
          }
        }} className="player-btn">
          {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
        </button>
      </div>
    </div>
  );
}

function formatTime(seconds) {
  if (!seconds || isNaN(seconds)) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s < 10 ? '0' : ''}${s}`;
}
