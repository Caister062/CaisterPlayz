import React, { useState, useEffect } from 'react';
import { ShieldAlert, Zap } from 'lucide-react';

const MESSAGES = [
  "Initializing Training...",
  "Loading Today's Quest...",
  "Preparing Mission...",
  "Syncing Progress...",
  "Loading Fitness Profile..."
];

const MOTIVATIONS = [
  "Every workout earns XP.",
  "Small victories build legendary streaks.",
  "Consistency beats intensity.",
  "Complete today's quest to level up.",
  "One workout closer to your next achievement."
];

export default function LoadingScreen() {
  const [message, setMessage] = useState(MESSAGES[0]);
  const [motivation, setMotivation] = useState(MOTIVATIONS[0]);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    setMessage(MESSAGES[Math.floor(Math.random() * MESSAGES.length)]);
    setMotivation(MOTIVATIONS[Math.floor(Math.random() * MOTIVATIONS.length)]);

    // Simulate an XP loading bar filling up quickly
    const startTime = Date.now();
    const duration = 800; // Fast fake load

    const animateProgress = () => {
      const now = Date.now();
      const elapsed = now - startTime;
      const newProgress = Math.min((elapsed / duration) * 100, 100);
      
      setProgress(newProgress);
      
      if (newProgress < 100) {
        requestAnimationFrame(animateProgress);
      }
    };

    requestAnimationFrame(animateProgress);
  }, []);

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      overflow: 'hidden'
    }}>
      {/* Subtle Background Glows */}
      <div style={{
        position: 'absolute',
        top: '20%', left: '10%',
        width: '40vw', height: '40vw',
        background: 'radial-gradient(circle, rgba(0,240,255,0.1) 0%, transparent 70%)',
        borderRadius: '50%',
        filter: 'blur(40px)',
        animation: 'pulseGlow 4s infinite alternate'
      }} />
      <div style={{
        position: 'absolute',
        bottom: '10%', right: '10%',
        width: '50vw', height: '50vw',
        background: 'radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 70%)',
        borderRadius: '50%',
        filter: 'blur(50px)',
        animation: 'pulseGlow 5s infinite alternate-reverse'
      }} />

      {/* Main Logo Container */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 24,
        zIndex: 10,
        animation: 'fadeInUp 0.8s ease-out forwards'
      }}>
        {/* Animated Shield Logo */}
        <div style={{ position: 'relative', width: 80, height: 80, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{
            position: 'absolute',
            inset: -10,
            background: 'var(--cyan)',
            filter: 'blur(20px)',
            opacity: 0.3,
            animation: 'pulseGlow 2s infinite alternate'
          }} />
          <svg viewBox="0 0 24 24" fill="none" stroke="var(--cyan)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 64, height: 64, filter: 'drop-shadow(0 0 10px rgba(0,240,255,0.5))' }}>
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
            <path d="m9 12 2 2 4-4" />
          </svg>
        </div>

        {/* Title */}
        <h1 style={{
          fontSize: 32,
          fontWeight: 900,
          color: '#fff',
          textTransform: 'uppercase',
          letterSpacing: '0.15em',
          fontFamily: '"Anton", sans-serif',
          textShadow: '0 0 20px rgba(0, 240, 255, 0.4)',
          margin: 0
        }}>
          CaisterPlayz
        </h1>

        {/* Loading Progress Bar Container */}
        <div style={{ width: 240, marginTop: 20 }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            marginBottom: 8,
            fontSize: 11,
            color: 'var(--cyan)',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.1em'
          }}>
            <span>{message}</span>
            <span>{Math.floor(progress)}%</span>
          </div>
          
          <div style={{
            width: '100%',
            height: 4,
            background: 'rgba(255,255,255,0.1)',
            borderRadius: 4,
            overflow: 'hidden',
            boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.5)'
          }}>
            <div style={{
              height: '100%',
              width: `${progress}%`,
              background: 'var(--cyan)',
              boxShadow: '0 0 10px var(--cyan)',
              transition: 'width 0.1s linear'
            }} />
          </div>
        </div>

        {/* Motivational Tip */}
        <div style={{
          marginTop: 40,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          background: 'rgba(255,255,255,0.05)',
          padding: '12px 20px',
          borderRadius: 16,
          border: '1px solid rgba(255,255,255,0.1)',
          backdropFilter: 'blur(10px)',
          maxWidth: '80%',
          textAlign: 'center'
        }}>
          <Zap size={16} color="var(--cyan)" style={{ flexShrink: 0 }} />
          <span style={{ fontSize: 13, color: 'var(--text2)', fontWeight: 600, lineHeight: 1.4 }}>
            {motivation}
          </span>
        </div>
      </div>

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes pulseGlow {
          from { opacity: 0.3; transform: scale(1); }
          to { opacity: 0.7; transform: scale(1.1); }
        }
      `}</style>
    </div>
  );
}
