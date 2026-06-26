import { useState } from 'react';
import { Mail, Lock, Apple, KeyRound, Loader, X, ShieldAlert } from 'lucide-react';
import { ensureGuestUser } from '../hooks';

export default function AuthView({ onAuthSuccess }) {
  const [loadingApple, setLoadingApple] = useState(false);
  const [showEmail, setShowEmail] = useState(false);
  const [loadingEmail, setLoadingEmail] = useState(false);
  const [showRecovery, setShowRecovery] = useState(false);
  const [recoverySent, setRecoverySent] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Facade function: Pretends to authenticate, then creates/loads the device profile.
  const handleAuth = async (setter) => {
    setter(true);
    try {
      // Simulate network delay for realism
      await new Promise(r => setTimeout(r, 1200));
      const user = await ensureGuestUser();
      onAuthSuccess(user.id);
    } catch (e) {
      alert('Authentication failed. Please try again.');
    } finally {
      setter(false);
    }
  };

  const handleAppleAuth = () => handleAuth(setLoadingApple);
  const handleEmailAuth = (e) => {
    e.preventDefault();
    if (!email || !password) return alert('Please enter both email and password.');
    handleAuth(setLoadingEmail);
  };

  const handleRecovery = (e) => {
    e.preventDefault();
    if (!email) return alert('Please enter your email address.');
    setRecoverySent(true);
    setTimeout(() => {
      setShowRecovery(false);
      setRecoverySent(false);
    }, 3000);
  };

  return (
    <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, background: 'var(--bg)' }}>
      <div className="slurp-shield-container" style={{ transform: 'scale(0.8)', marginBottom: 20 }}>
        <div className="slurp-shield-outline">
          <div className="slurp-shield-fill" style={{ animation: 'none', height: '60%' }} />
        </div>
        <ShieldAlert size={40} color="#fff" style={{ position: 'absolute', zIndex: 10 }} />
      </div>

      <h1 style={{ fontSize: 32, fontWeight: 900, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: '"Anton", sans-serif', textShadow: '0 0 20px rgba(0, 240, 255, 0.5)', marginBottom: 40 }}>
        CaisterPlayz
      </h1>

      <div style={{ width: '100%', maxWidth: 320, display: 'flex', flexDirection: 'column', gap: 16 }}>
        {!showEmail ? (
          <>
            <button
              onClick={handleAppleAuth}
              disabled={loadingApple}
              style={{
                width: '100%', padding: '14px', borderRadius: 12, border: 'none', background: '#fff', color: '#000', fontSize: 16, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, cursor: 'pointer', transition: 'transform 0.2s'
              }}
            >
              {loadingApple ? <Loader size={20} className="spin" /> : <Apple size={20} fill="#000" />}
              Sign in with Apple
            </button>

            <button
              onClick={() => setShowEmail(true)}
              style={{
                width: '100%', padding: '14px', borderRadius: 12, border: '1px solid var(--border-b)', background: 'var(--bg2)', color: 'var(--text)', fontSize: 16, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, cursor: 'pointer', transition: 'border-color 0.2s'
              }}
            >
              <Mail size={18} /> Continue with Email
            </button>
          </>
        ) : (
          <form onSubmit={handleEmailAuth} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ position: 'relative' }}>
              <Mail size={16} color="var(--text3)" style={{ position: 'absolute', left: 14, top: 14 }} />
              <input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={e => setEmail(e.target.value)}
                style={{ width: '100%', padding: '12px 14px 12px 40px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg3)', color: '#fff', fontSize: 15 }}
                required
              />
            </div>
            
            <div style={{ position: 'relative' }}>
              <Lock size={16} color="var(--text3)" style={{ position: 'absolute', left: 14, top: 14 }} />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                style={{ width: '100%', padding: '12px 14px 12px 40px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg3)', color: '#fff', fontSize: 15 }}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loadingEmail}
              style={{
                width: '100%', padding: '14px', marginTop: 8, borderRadius: 12, border: 'none', background: 'var(--cyan)', color: '#000', fontSize: 16, fontWeight: 900, textTransform: 'uppercase', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, cursor: 'pointer', boxShadow: '0 0 20px rgba(0,240,255,0.4)'
              }}
            >
              {loadingEmail ? <Loader size={20} className="spin" /> : 'Log In'}
            </button>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10 }}>
              <button type="button" onClick={() => setShowEmail(false)} style={{ background: 'none', border: 'none', color: 'var(--text3)', fontSize: 13, cursor: 'pointer' }}>
                Back
              </button>
              <button type="button" onClick={() => setShowRecovery(true)} style={{ background: 'none', border: 'none', color: 'var(--cyan)', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                Forgot Password?
              </button>
            </div>
          </form>
        )}
      </div>

      {showRecovery && (
        <div className="overlay" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="sheet" style={{ position: 'relative', top: 'auto', left: 'auto', bottom: 'auto', padding: 24, borderRadius: 20, maxWidth: 320, width: '90%' }}>
            <button onClick={() => setShowRecovery(false)} style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer' }}>
              <X size={20} />
            </button>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <KeyRound size={24} color="var(--cyan)" />
              <h2 style={{ fontSize: 18, fontWeight: 900, color: '#fff' }}>Recover Account</h2>
            </div>
            
            {recoverySent ? (
              <p style={{ color: 'var(--lime)', fontSize: 14, fontWeight: 700 }}>
                If an account exists for {email}, a password reset link has been sent.
              </p>
            ) : (
              <form onSubmit={handleRecovery}>
                <p style={{ color: 'var(--text2)', fontSize: 13, marginBottom: 16 }}>
                  Enter the email associated with your account to receive a secure recovery link.
                </p>
                <input
                  type="email"
                  placeholder="Email Address"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  style={{ width: '100%', padding: '12px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg3)', color: '#fff', fontSize: 14, marginBottom: 16 }}
                  required
                />
                <button type="submit" style={{ width: '100%', padding: '12px', borderRadius: 10, border: 'none', background: '#fff', color: '#000', fontSize: 14, fontWeight: 800, cursor: 'pointer' }}>
                  Send Recovery Link
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
