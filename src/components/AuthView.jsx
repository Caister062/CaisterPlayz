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

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const authData = await pb.collection('users').authWithPassword(email, password);
      localStorage.setItem('cplayz_user_id', authData.record.id);
      onAuthSuccess(authData.record.id);
    } catch (err) {
      console.error(err);
      
      let errorText = err.message || 'Login failed.';
      
      const validationData = err.response?.data || err.data?.data;
      
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
        }
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
      // Create user with default Gamified Fitness Stats
      const isEmail = email.includes('@');
      const data = {
        password,
        passwordConfirm,
        displayName: displayName || (isEmail ? email.split('@')[0] : email),
        xp: 0,
        level: 1,
        streak: 0,
        badges: []
      };
      
      if (isEmail) {
        data.email = email;
      } else {
        // PocketBase requires an email by default. If the user only provided a username,
        // we map it to username and generate a dummy email so it passes backend validation.
        data.username = email;
        data.email = `${email.toLowerCase().replace(/[^a-z0-9]/g, '')}@guest.caisterplayz.com`;
      }

      await pb.collection('users').create(data);
      
      // Auto-login after signup
      const authData = await pb.collection('users').authWithPassword(email, password);
      localStorage.setItem('cplayz_user_id', authData.record.id);
      onAuthSuccess(authData.record.id);
    } catch (err) {
      console.error(err);
      
      let errorText = err.message || 'Signup failed.';
      
      const validationData = err.response?.data || err.data?.data;
      
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
        }
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
