import React, { useState, useEffect } from 'react';

export default function LoadingScreen() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Simulate a smooth 60fps loading bar filling up
    const startTime = Date.now();
    const duration = 2500; // 2.5 seconds loading for effect

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
      background: 'linear-gradient(135deg, #0a0e27 0%, #1a1640 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      overflow: 'hidden',
      fontFamily: '"Inter", sans-serif'
    }}>
      {/* Background Soft Gradients */}
      <div style={{
        position: 'absolute',
        top: '10%', left: '-10%',
        width: '60vw', height: '60vw',
        background: 'radial-gradient(circle, rgba(0, 240, 255, 0.08) 0%, transparent 60%)',
        borderRadius: '50%',
        filter: 'blur(60px)',
        animation: 'pulseBg 4s infinite alternate ease-in-out'
      }} />
      <div style={{
        position: 'absolute',
        bottom: '-10%', right: '-10%',
        width: '70vw', height: '70vw',
        background: 'radial-gradient(circle, rgba(139, 92, 246, 0.08) 0%, transparent 60%)',
        borderRadius: '50%',
        filter: 'blur(70px)',
        animation: 'pulseBg 5s infinite alternate-reverse ease-in-out'
      }} />

      {/* Floating Particles */}
      {[...Array(12)].map((_, i) => (
        <div key={i} className={`particle particle-${i}`} style={{
          position: 'absolute',
          width: Math.random() * 4 + 2,
          height: Math.random() * 4 + 2,
          background: 'var(--cyan)',
          borderRadius: '50%',
          boxShadow: '0 0 10px var(--cyan)',
          opacity: 0,
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          animation: `floatUp ${3 + Math.random() * 4}s infinite linear ${Math.random() * 2}s`
        }} />
      ))}

      {/* Main Container */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        zIndex: 10,
        animation: 'fadeInScale 0.8s ease-out forwards'
      }}>
        
        {/* Custom Training HQ Emblem */}
        <div style={{ position: 'relative', width: 140, height: 140, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 40 }}>
          
          {/* Subtle animated glow behind emblem */}
          <div style={{
            position: 'absolute',
            inset: -20,
            background: 'var(--cyan)',
            filter: 'blur(25px)',
            opacity: 0.25,
            borderRadius: '50%',
            animation: 'pulseGlow 2s infinite alternate ease-in-out'
          }} />

          {/* Rotating Energy Ring */}
          <svg style={{ position: 'absolute', width: 140, height: 140, animation: 'spin 8s linear infinite' }} viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="46" fill="none" stroke="rgba(0,240,255,0.15)" strokeWidth="2" />
            <circle cx="50" cy="50" r="46" fill="none" stroke="var(--cyan)" strokeWidth="2" strokeDasharray="60 220" strokeLinecap="round" />
            <circle cx="50" cy="50" r="46" fill="none" stroke="var(--emerald)" strokeWidth="2" strokeDasharray="30 250" strokeLinecap="round" style={{ transformOrigin: '50% 50%', transform: 'rotate(120deg)' }} />
          </svg>

          {/* Counter-rotating inner ring */}
          <svg style={{ position: 'absolute', width: 110, height: 110, animation: 'spinReverse 12s linear infinite' }} viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="48" fill="none" stroke="var(--hot)" strokeWidth="1" strokeDasharray="40 240" strokeLinecap="round" />
            <circle cx="50" cy="50" r="48" fill="none" stroke="var(--cyan)" strokeWidth="1" strokeDasharray="20 260" strokeLinecap="round" style={{ transformOrigin: '50% 50%', transform: 'rotate(180deg)' }} />
          </svg>

          {/* Emblem Icon (Gamepad / Crosshair fusion) */}
          <div style={{ position: 'relative', animation: 'float 3s infinite ease-in-out' }}>
            <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="#00f0ff" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" style={{ filter: 'drop-shadow(0 0 15px rgba(0, 240, 255, 0.8))' }}>
              <line x1="6" y1="12" x2="10" y2="12" />
              <line x1="8" y1="10" x2="8" y2="14" />
              <line x1="15" y1="11" x2="15.01" y2="11" strokeWidth="3" />
              <line x1="17" y1="13" x2="17.01" y2="13" strokeWidth="3" />
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
            </svg>
          </div>
        </div>

        {/* Title */}
        <h1 style={{
          fontSize: 26,
          fontWeight: 900,
          color: '#fff',
          textTransform: 'uppercase',
          letterSpacing: '0.15em',
          margin: '0 0 8px 0',
          textAlign: 'center',
          textShadow: '0 0 25px rgba(0, 240, 255, 0.6), 0 0 10px rgba(124, 58, 237, 0.5)'
        }}>
          DROPPING INTO THE ISLAND
        </h1>

        {/* Subtitle */}
        <p style={{
          color: '#94a3b8',
          fontSize: 13,
          fontWeight: 700,
          letterSpacing: '0.04em',
          margin: '0 0 40px 0',
          textAlign: 'center',
          maxWidth: 320,
          textTransform: 'uppercase'
        }}>
          Connecting to Battle Bus • Loading Squad Beacons & Item Shop...
        </p>

        {/* Loading Progress Bar Container */}
        <div style={{ width: 280 }}>
          <div style={{
            width: '100%',
            height: 6,
            background: 'rgba(255,255,255,0.05)',
            borderRadius: 6,
            overflow: 'hidden',
            border: '1px solid rgba(0,240,255,0.1)',
            boxShadow: 'inset 0 1px 4px rgba(0,0,0,0.5)',
            position: 'relative'
          }}>
            {/* Glossy Bar */}
            <div style={{
              height: '100%',
              width: `${progress}%`,
              background: 'linear-gradient(90deg, #00f0ff 0%, #3b82f6 100%)',
              boxShadow: '0 0 15px rgba(0,240,255,0.5)',
              borderRadius: 6,
              transition: 'width 0.1s linear',
              position: 'relative',
              overflow: 'hidden'
            }}>
              {/* Shine effect across bar */}
              <div style={{
                position: 'absolute',
                top: 0, left: 0, bottom: 0, width: '100%',
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
                transform: 'skewX(-20deg) translateX(-150%)',
                animation: 'shine 2s infinite linear'
              }} />
            </div>
          </div>
          
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            marginTop: 12,
            fontSize: 11,
            color: 'var(--cyan)',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.1em'
          }}>
            <span style={{ opacity: Math.floor(progress) === 100 ? 1 : 0.7, transition: 'opacity 0.3s' }}>
              {Math.floor(progress) === 100 ? 'System Ready' : 'Connecting...'}
            </span>
            <span style={{ textShadow: '0 0 10px rgba(0,240,255,0.5)' }}>
              {Math.floor(progress)}%
            </span>
          </div>
        </div>

      </div>

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeInScale {
          from { opacity: 0; transform: scale(0.95) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes pulseBg {
          from { opacity: 0.5; transform: scale(0.95); }
          to { opacity: 0.8; transform: scale(1.05); }
        }
        @keyframes pulseGlow {
          from { opacity: 0.15; transform: scale(0.9); }
          to { opacity: 0.35; transform: scale(1.1); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes spinReverse {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        @keyframes floatUp {
          0% { transform: translateY(100vh) scale(0); opacity: 0; }
          20% { opacity: 0.6; transform: translateY(80vh) scale(1); }
          80% { opacity: 0.6; }
          100% { transform: translateY(-20vh) scale(0.5); opacity: 0; }
        }
        @keyframes shine {
          0% { transform: skewX(-20deg) translateX(-150%); }
          100% { transform: skewX(-20deg) translateX(150%); }
        }
      `}</style>
    </div>
  );
}
