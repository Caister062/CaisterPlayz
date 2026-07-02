import { useState } from 'react';
import { Loader, ShieldAlert, Mail, Lock, User as UserIcon } from 'lucide-react';
import pb from '../pocketbase';

export default function AuthView({ onAuthSuccess }) {
  const [view, setView] = useState('LOGIN'); // LOGIN, SIGNUP, FORGOT
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [displayName, setDisplayName] = useState('');

  const handleOAuth = async (providerName) => {
    try {
      setLoading(true);
      setError('');
      const authMethods = await pb.collection('users').listAuthMethods();
      const provider = authMethods.oauth2?.providers?.find((p) => p.name === providerName);
      if (!provider) throw new Error(`${providerName} login is not enabled in backend.`);
      
      const redirectUrl = window.location.origin + window.location.pathname;
      localStorage.setItem('oauth_provider', JSON.stringify({ ...provider, redirectUrl }));
      document.cookie = `oauth_provider=${encodeURIComponent(JSON.stringify({ ...provider, redirectUrl }))}; path=/; max-age=3600`;
      
      window.location.href = provider.authUrl + redirectUrl;
    } catch (err) {
      console.error(err);
      setError(`Failed to start ${providerName} login: ${err.message}`);
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    let loginEmail = email.trim();
    if (!loginEmail.includes('@')) {
      loginEmail = `${loginEmail.toLowerCase().replace(/[^a-z0-9]/g, '')}@guest.caisterplayz.com`;
    }

    try {
      const authData = await pb.collection('users').authWithPassword(loginEmail, password);
      localStorage.setItem('cplayz_user_id', authData.record.id);
      onAuthSuccess(authData.record.id);
    } catch (err) {
      console.error(err);
      
      let errorText = err.message || 'Login failed.';
      
      const validationData = err.response?.data || err.data?.data || err.data;
      
      if (validationData && typeof validationData === 'object') {
        const fieldErrors = Object.entries(validationData)
          .map(([field, errorObj]) => {
            if (errorObj && errorObj.message) {
              return `${field}: ${errorObj.message}`;
            }
            return null;
          })
          .filter(Boolean)
          .join(' | ');
          
        if (fieldErrors) {
          errorText = fieldErrors;
        } else {
          errorText = `Raw Error: ${JSON.stringify(err.response || err.data || err)}`;
        }
      } else {
        errorText = `Raw Error: ${JSON.stringify(err.response || err.data || err)}`;
      }
      
      setError(errorText);
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    if (password !== passwordConfirm) {
      setError('Passwords do not match.');
      setLoading(false);
      return;
    }

    try {
      const trimmedEmail = email.trim();
      const isEmail = trimmedEmail.includes('@');
      const data = {
        password,
        passwordConfirm,
        displayName: displayName || (isEmail ? trimmedEmail.split('@')[0] : trimmedEmail),
        xp: 0,
        level: 1,
        streak: 0,
        badges: []
      };
      
      if (isEmail) {
        data.email = trimmedEmail;
      } else {
        // PocketBase requires an email by default. If the user only provided a username,
        // we map it to username and generate a dummy email so it passes backend validation.
        data.username = trimmedEmail;
        data.email = `${trimmedEmail.toLowerCase().replace(/[^a-z0-9]/g, '')}@guest.caisterplayz.com`;
      }

      await pb.collection('users').create(data);
      
      // Auto-login after signup
      const authData = await pb.collection('users').authWithPassword(data.email, password);
      localStorage.setItem('cplayz_user_id', authData.record.id);
      onAuthSuccess(authData.record.id);
    } catch (err) {
      console.error(err);
      
      let errorText = err.message || 'Signup failed.';
      
      const validationData = err.response?.data || err.data?.data || err.data;
      
      if (validationData && typeof validationData === 'object') {
        const fieldErrors = Object.entries(validationData)
          .map(([field, errorObj]) => {
            if (errorObj && errorObj.message) {
              return `${field}: ${errorObj.message}`;
            }
            return null;
          })
          .filter(Boolean)
          .join(' | ');
          
        if (fieldErrors) {
          errorText = fieldErrors;
        } else {
          errorText = `Raw Error: ${JSON.stringify(err.response || err.data || err)}`;
        }
      } else {
        errorText = `Raw Error: ${JSON.stringify(err.response || err.data || err)}`;
      }
      
      setError(errorText);
    } finally {
      setLoading(false);
    }
  };

  const handleForgot = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      await pb.collection('users').requestPasswordReset(email);
      setMessage('Password reset email sent. Check your inbox.');
      setView('LOGIN');
    } catch (err) {
      console.error(err);
      setError('Failed to send reset email.');
    } finally {
      setLoading(false);
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

      <h1 style={{ fontSize: 32, fontWeight: 900, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: '"Anton", sans-serif', textShadow: '0 0 20px rgba(0, 240, 255, 0.5)', marginBottom: 10 }}>
        CaisterPlayz
      </h1>
      
      <p style={{ color: 'var(--cyan)', textTransform: 'uppercase', fontSize: 14, fontWeight: 800, letterSpacing: '0.1em', marginBottom: 30 }}>
        Level Up Your Fitness
      </p>

      {error && (
        <div style={{ background: 'rgba(244, 63, 94, 0.1)', color: '#f43f5e', padding: '12px 16px', borderRadius: 8, marginBottom: 20, fontSize: 14, border: '1px solid rgba(244, 63, 94, 0.3)', width: '100%', maxWidth: 320, textAlign: 'center' }}>
          {error}
        </div>
      )}

      {message && (
        <div style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', padding: '12px 16px', borderRadius: 8, marginBottom: 20, fontSize: 14, border: '1px solid rgba(16, 185, 129, 0.3)', width: '100%', maxWidth: 320, textAlign: 'center' }}>
          {message}
        </div>
      )}

      <div style={{ width: '100%', maxWidth: 320 }}>
        {view === 'LOGIN' && (
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="input-group">
              <Mail size={18} color="var(--text2)" style={{ position: 'absolute', left: 16, top: 15 }} />
              <input type="text" placeholder="Email Address or Username" required value={email} onChange={e => setEmail(e.target.value)} style={{ width: '100%', padding: '14px 14px 14px 44px', background: 'var(--surface)', border: '1px solid var(--border)', color: '#fff', borderRadius: 12, outline: 'none' }} />
            </div>
            
            <div className="input-group" style={{ position: 'relative' }}>
              <Lock size={18} color="var(--text2)" style={{ position: 'absolute', left: 16, top: 15 }} />
              <input type="password" placeholder="Password" required value={password} onChange={e => setPassword(e.target.value)} style={{ width: '100%', padding: '14px 14px 14px 44px', background: 'var(--surface)', border: '1px solid var(--border)', color: '#fff', borderRadius: 12, outline: 'none' }} />
            </div>

            <button type="submit" disabled={loading} style={{ width: '100%', padding: '14px', background: 'var(--cyan)', color: '#000', border: 'none', borderRadius: 12, fontWeight: 900, fontSize: 16, textTransform: 'uppercase', cursor: 'pointer', display: 'flex', justifyContent: 'center', marginTop: 8 }}>
              {loading ? <Loader className="spin" size={20} /> : 'Login'}
            </button>

            <button type="button" onClick={() => handleOAuth('google')} disabled={loading} style={{ width: '100%', padding: '14px', background: '#fff', color: '#000', border: 'none', borderRadius: 12, fontWeight: 900, fontSize: 15, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
              <svg width="18" height="18" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
              Continue with Google
            </button>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginTop: 8 }}>
              <button type="button" onClick={() => { setView('FORGOT'); setError(''); }} style={{ background: 'none', border: 'none', color: 'var(--text2)', cursor: 'pointer' }}>Forgot Password?</button>
              <button type="button" onClick={() => { setView('SIGNUP'); setError(''); }} style={{ background: 'none', border: 'none', color: 'var(--cyan)', cursor: 'pointer', fontWeight: 800 }}>Create Account</button>
            </div>
          </form>
        )}

        {view === 'SIGNUP' && (
          <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="input-group" style={{ position: 'relative' }}>
              <UserIcon size={18} color="var(--text2)" style={{ position: 'absolute', left: 16, top: 15 }} />
              <input type="text" placeholder="Gamer Tag / Username" required value={displayName} onChange={e => setDisplayName(e.target.value)} style={{ width: '100%', padding: '14px 14px 14px 44px', background: 'var(--surface)', border: '1px solid var(--border)', color: '#fff', borderRadius: 12, outline: 'none' }} />
            </div>

            <div className="input-group" style={{ position: 'relative' }}>
              <Mail size={18} color="var(--text2)" style={{ position: 'absolute', left: 16, top: 15 }} />
              <input type="text" placeholder="Email Address or Username" required value={email} onChange={e => setEmail(e.target.value)} style={{ width: '100%', padding: '14px 14px 14px 44px', background: 'var(--surface)', border: '1px solid var(--border)', color: '#fff', borderRadius: 12, outline: 'none' }} />
            </div>
            
            <div className="input-group" style={{ position: 'relative' }}>
              <Lock size={18} color="var(--text2)" style={{ position: 'absolute', left: 16, top: 15 }} />
              <input type="password" placeholder="Password (Min 8 chars)" required minLength={8} value={password} onChange={e => setPassword(e.target.value)} style={{ width: '100%', padding: '14px 14px 14px 44px', background: 'var(--surface)', border: '1px solid var(--border)', color: '#fff', borderRadius: 12, outline: 'none' }} />
            </div>

            <div className="input-group" style={{ position: 'relative' }}>
              <Lock size={18} color="var(--text2)" style={{ position: 'absolute', left: 16, top: 15 }} />
              <input type="password" placeholder="Confirm Password" required minLength={8} value={passwordConfirm} onChange={e => setPasswordConfirm(e.target.value)} style={{ width: '100%', padding: '14px 14px 14px 44px', background: 'var(--surface)', border: '1px solid var(--border)', color: '#fff', borderRadius: 12, outline: 'none' }} />
            </div>

            <button type="submit" disabled={loading} style={{ width: '100%', padding: '14px', background: 'linear-gradient(90deg, #10b981, #3b82f6)', color: '#fff', border: 'none', borderRadius: 12, fontWeight: 900, fontSize: 16, textTransform: 'uppercase', cursor: 'pointer', display: 'flex', justifyContent: 'center', marginTop: 8 }}>
              {loading ? <Loader className="spin" size={20} /> : 'Start The Grind'}
            </button>

            <button type="button" onClick={() => handleOAuth('google')} disabled={loading} style={{ width: '100%', padding: '14px', background: '#fff', color: '#000', border: 'none', borderRadius: 12, fontWeight: 900, fontSize: 15, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
              <svg width="18" height="18" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
              Continue with Google
            </button>

            <div style={{ textAlign: 'center', fontSize: 13, marginTop: 8 }}>
              <span style={{ color: 'var(--text2)' }}>Already playing? </span>
              <button type="button" onClick={() => { setView('LOGIN'); setError(''); }} style={{ background: 'none', border: 'none', color: 'var(--cyan)', cursor: 'pointer', fontWeight: 800 }}>Log In</button>
            </div>
          </form>
        )}

        {view === 'FORGOT' && (
          <form onSubmit={handleForgot} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <p style={{ color: 'var(--text2)', fontSize: 14, textAlign: 'center', marginBottom: 8 }}>
              Enter your email address and we'll send you a link to reset your password.
            </p>

            <div className="input-group" style={{ position: 'relative' }}>
              <Mail size={18} color="var(--text2)" style={{ position: 'absolute', left: 16, top: 15 }} />
              <input type="email" placeholder="Email Address" required value={email} onChange={e => setEmail(e.target.value)} style={{ width: '100%', padding: '14px 14px 14px 44px', background: 'var(--surface)', border: '1px solid var(--border)', color: '#fff', borderRadius: 12, outline: 'none' }} />
            </div>

            <button type="submit" disabled={loading} style={{ width: '100%', padding: '14px', background: 'var(--surface)', border: '1px solid var(--border)', color: '#fff', borderRadius: 12, fontWeight: 800, fontSize: 15, cursor: 'pointer', display: 'flex', justifyContent: 'center', marginTop: 8 }}>
              {loading ? <Loader className="spin" size={20} /> : 'Send Reset Link'}
            </button>

            <div style={{ textAlign: 'center', fontSize: 13, marginTop: 8 }}>
              <button type="button" onClick={() => { setView('LOGIN'); setError(''); }} style={{ background: 'none', border: 'none', color: 'var(--text2)', cursor: 'pointer' }}>Back to Login</button>
            </div>
          </form>
        )}
      </div>

      <style>{`
        .spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          100% { transform: rotate(360deg); }
        }
        button:active {
          transform: scale(0.98);
        }
        .input-group {
          position: relative;
        }
        input:focus {
          border-color: var(--cyan) !important;
          box-shadow: 0 0 10px rgba(0, 240, 255, 0.2);
        }
      `}</style>
    </div>
  );
}
