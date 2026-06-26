import { useState } from 'react';
import { Mail, Lock, Apple, KeyRound, Loader, X, ShieldAlert } from 'lucide-react';
import pb from '../pocketbase';

const GoogleIcon = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

export default function AuthView({ onAuthSuccess }) {
  const [loadingApple, setLoadingApple] = useState(false);
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [showEmail, setShowEmail] = useState(false);
  const [loadingEmail, setLoadingEmail] = useState(false);
  const [showRecovery, setShowRecovery] = useState(false);
  const [recoverySent, setRecoverySent] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false);

  const handleAppleAuth = async () => {
    setLoadingApple(true);
    try {
      const authData = await pb.collection('users').authWithOAuth2({ provider: 'apple' });
      if (!authData.record.displayName) {
        await pb.collection('users').update(authData.record.id, { displayName: authData.meta.name || 'Apple_Operator' });
      }
      onAuthSuccess(authData.record.id);
    } catch (e) {
      console.error(e);
      alert('Apple authentication failed.');
    } finally {
      setLoadingApple(false);
    }
  };

  const handleGoogleAuth = async () => {
    setLoadingGoogle(true);
    try {
      const authData = await pb.collection('users').authWithOAuth2({ provider: 'google' });
      if (!authData.record.displayName) {
        await pb.collection('users').update(authData.record.id, { displayName: authData.meta.name || 'Google_Operator' });
      }
      onAuthSuccess(authData.record.id);
    } catch (e) {
      console.error(e);
      alert('Google authentication failed.');
    } finally {
      setLoadingGoogle(false);
    }
  };

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    if (!email || !password) return alert('Please enter both email and password.');
    
    setLoadingEmail(true);
    try {
      if (isRegister) {
        const user = await pb.collection('users').create({
          email,
          password,
          passwordConfirm: password,
          displayName: email.split('@')[0] || 'Operator',
          bio: ''
        });
        const authData = await pb.collection('users').authWithPassword(email, password);
        onAuthSuccess(authData.record.id);
      } else {
        const authData = await pb.collection('users').authWithPassword(email, password);
        onAuthSuccess(authData.record.id);
      }
    } catch (err) {
      console.error(err);
      alert(isRegister ? 'Registration failed. Email might be taken or password too short.' : 'Login failed. Check your credentials.');
    } finally {
      setLoadingEmail(false);
    }
  };

  const handleRecovery = async (e) => {
    e.preventDefault();
    if (!email) return alert('Please enter your email address.');
    try {
      await pb.collection('users').requestPasswordReset(email);
      setRecoverySent(true);
      setTimeout(() => {
        setShowRecovery(false);
        setRecoverySent(false);
      }, 3000);
    } catch(err) {
      alert('Failed to send recovery email.');
    }
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
              disabled={loadingApple || loadingGoogle}
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: 12,
                border: 'none',
                background: '#fff',
                color: '#000',
                fontSize: 16,
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 10,
                cursor: 'pointer',
                transition: 'transform 0.2s',
              }}
            >
              {loadingApple ? <Loader size={20} className="spin" /> : <Apple size={20} fill="#000" />}
              Sign in with Apple
            </button>

            <button
              onClick={handleGoogleAuth}
              disabled={loadingApple || loadingGoogle}
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: 12,
                border: 'none',
                background: '#fff',
                color: '#000',
                fontSize: 16,
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 10,
                cursor: 'pointer',
                transition: 'transform 0.2s',
              }}
            >
              {loadingGoogle ? <Loader size={20} className="spin" color="#000" /> : <GoogleIcon size={20} />}
              Sign in with Google
            </button>

            <button
              onClick={() => setShowEmail(true)}
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: 12,
                border: '1px solid var(--border-b)',
                background: 'var(--bg2)',
                color: 'var(--text)',
                fontSize: 16,
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 10,
                cursor: 'pointer',
                transition: 'border-color 0.2s',
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
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 14px 12px 40px',
                  borderRadius: 10,
                  border: '1px solid var(--border)',
                  background: 'var(--bg3)',
                  color: '#fff',
                  fontSize: 15,
                }}
                required
              />
            </div>

            <div style={{ position: 'relative' }}>
              <Lock size={16} color="var(--text3)" style={{ position: 'absolute', left: 14, top: 14 }} />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 14px 12px 40px',
                  borderRadius: 10,
                  border: '1px solid var(--border)',
                  background: 'var(--bg3)',
                  color: '#fff',
                  fontSize: 15,
                }}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loadingEmail}
              style={{
                width: '100%',
                padding: '14px',
                marginTop: 8,
                borderRadius: 12,
                border: 'none',
                background: 'var(--cyan)',
                color: '#000',
                fontSize: 16,
                fontWeight: 900,
                textTransform: 'uppercase',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 10,
                cursor: 'pointer',
                boxShadow: '0 0 20px rgba(0,240,255,0.4)',
              }}
            >
              {loadingEmail ? <Loader size={20} className="spin" /> : (isRegister ? 'Create Account' : 'Log In')}
            </button>

            <div style={{ display: 'flex', justifyContent: 'center', marginTop: 8 }}>
              <button type="button" onClick={() => setIsRegister(!isRegister)} style={{ background: 'none', border: 'none', color: 'var(--text)', fontSize: 13, cursor: 'pointer', textDecoration: 'underline' }}>
                {isRegister ? 'Already have an account? Log In' : 'Need an account? Register'}
              </button>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10 }}>
              <button
                type="button"
                onClick={() => setShowEmail(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text3)', fontSize: 13, cursor: 'pointer' }}
              >
                Back
              </button>
              {!isRegister && (
                <button type="button" onClick={() => setShowRecovery(true)} style={{ background: 'none', border: 'none', color: 'var(--cyan)', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                  Forgot Password?
                </button>
              )}
            </div>
          </form>
        )}
      </div>

      {showRecovery && (
        <div className="overlay" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="sheet" style={{ position: 'relative', top: 'auto', left: 'auto', bottom: 'auto', padding: 24, borderRadius: 20, maxWidth: 320, width: '90%' }}>
            <button
              onClick={() => setShowRecovery(false)}
              style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer' }}
            >
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
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: 10,
                    border: '1px solid var(--border)',
                    background: 'var(--bg3)',
                    color: '#fff',
                    fontSize: 14,
                    marginBottom: 16,
                  }}
                  required
                />

                <button
                  type="submit"
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: 10,
                    border: 'none',
                    background: '#fff',
                    color: '#000',
                    fontSize: 14,
                    fontWeight: 800,
                    cursor: 'pointer',
                  }}
                >
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
