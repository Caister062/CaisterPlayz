import { useState } from 'react';
import { Loader, ShieldAlert, Mail, Lock, User as UserIcon } from 'lucide-react';
import { Capacitor } from '@capacitor/core';
import { SignInWithApple } from '@capacitor-community/apple-sign-in';
import { supabase } from '../supabase';

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

  const handleAppleSignIn = async () => {
    try {
      setLoading(true);
      setError('');
      
      const { response } = await SignInWithApple.authorize({
        clientId: 'com.caisterplayz.social',
        redirectURI: 'https://caister062.github.io/CaisterPlayz/',
        scopes: 'email name',
      });
      
      if (response && response.identityToken) {
        const { data, error } = await supabase.auth.signInWithIdToken({
          provider: 'apple',
          token: response.identityToken,
        });
        
        if (error) throw error;
        if (data?.session) {
          // If Apple provided given/family name on first authorization, update profile display name
          const fullName = [response.givenName, response.familyName].filter(Boolean).join(' ');
          if (fullName) {
            await supabase.auth.updateUser({
              data: { display_name: fullName }
            }).catch(() => {});
          }
          onAuthSuccess(data.session.user.id);
        }
      }
    } catch (err) {
      console.error(err);
      const errMsg = err?.message || String(err || '');
      // Handle user cancellation gracefully without showing an error or redirecting
      if (errMsg.toLowerCase().includes('cancel') || errMsg.toLowerCase().includes('canceled') || errMsg.toLowerCase().includes('cancelled') || errMsg.includes('1001')) {
        // User intentionally cancelled Apple native authorization sheet
      } else {
        setError(`Apple Sign-In failed: ${errMsg}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      
      if (data.session) {
        onAuthSuccess(data.session.user.id);
      }
    } catch (err) {
      console.error(err);
      setError(err.message || 'Login failed.');
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
      
      const { data, error } = await supabase.auth.signUp({
        email: trimmedEmail,
        password,
        options: {
          data: {
            display_name: displayName || trimmedEmail.split('@')[0],
          }
        }
      });

      if (error) throw error;
      
      if (data.session) {
        onAuthSuccess(data.session.user.id);
      } else {
        setMessage('Check your email for the confirmation link!');
        setView('LOGIN');
      }
    } catch (err) {
      console.error(err);
      setError(err.message || 'Signup failed.');
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
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw error;
      setMessage('Password reset email sent. Check your inbox.');
      setView('LOGIN');
    } catch (err) {
      console.error(err);
      setError('Failed to send reset email: ' + err.message);
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
        Independent Music Social Network
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

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 10 }}>
              <button type="button" onClick={handleAppleSignIn} disabled={loading} style={{ width: '100%', padding: '14px', background: '#000', color: '#fff', border: '1px solid #444', borderRadius: 12, fontWeight: 900, fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, boxShadow: '0 4px 12px rgba(0,0,0,0.5)' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="#fff"><path d="M16.142 2.656a5.753 5.753 0 0 0-1.332 4.153c.015.019.034.025.045.025a5.539 5.539 0 0 0 1.341-3.996c-.015-.02-.03-.027-.045-.027a6.22 6.22 0 0 0-1.41-4.148zM12.18 7.222c-1.353 0-2.825.864-3.668.864-1.002 0-2.316-.838-3.394-.838-1.432 0-2.756.832-3.488 2.109-1.503 2.607-.384 6.467 1.077 8.583.715 1.037 1.56 2.187 2.673 2.187.973 0 1.342-.591 2.502-.591 1.144 0 1.488.591 2.518.591 1.157 0 1.904-1.048 2.613-2.086.82-1.196 1.161-2.355 1.183-2.417-.024-.012-2.261-.869-2.284-3.46-.021-2.17 1.777-3.21 1.862-3.262-1.01-1.477-2.585-1.684-3.155-1.745-.989-.107-2.576.772-3.435.772-.857 0-2.06-.723-3.004-.707z"/></svg>
                Sign in with Apple
              </button>

              <button type="button" onClick={() => {
                const guestId = 'guest_' + Math.random().toString(36).substring(2, 9);
                localStorage.setItem('cplayz_user_id', guestId);
                onAuthSuccess(guestId);
              }} style={{ width: '100%', padding: '14px', background: 'linear-gradient(135deg, #00f0ff 0%, #7c3aed 100%)', color: '#000', border: 'none', borderRadius: 12, fontWeight: 900, fontSize: 13, textTransform: 'uppercase', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: '0 4px 15px rgba(0, 240, 255, 0.3)' }}>
                🎮 Instant Guest Play (No Login Required)
              </button>
            </div>

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

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 10 }}>
              <button type="button" onClick={handleAppleSignIn} disabled={loading} style={{ width: '100%', padding: '14px', background: '#000', color: '#fff', border: '1px solid #444', borderRadius: 12, fontWeight: 900, fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, boxShadow: '0 4px 12px rgba(0,0,0,0.5)' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="#fff"><path d="M16.142 2.656a5.753 5.753 0 0 0-1.332 4.153c.015.019.034.025.045.025a5.539 5.539 0 0 0 1.341-3.996c-.015-.02-.03-.027-.045-.027a6.22 6.22 0 0 0-1.41-4.148zM12.18 7.222c-1.353 0-2.825.864-3.668.864-1.002 0-2.316-.838-3.394-.838-1.432 0-2.756.832-3.488 2.109-1.503 2.607-.384 6.467 1.077 8.583.715 1.037 1.56 2.187 2.673 2.187.973 0 1.342-.591 2.502-.591 1.144 0 1.488.591 2.518.591 1.157 0 1.904-1.048 2.613-2.086.82-1.196 1.161-2.355 1.183-2.417-.024-.012-2.261-.869-2.284-3.46-.021-2.17 1.777-3.21 1.862-3.262-1.01-1.477-2.585-1.684-3.155-1.745-.989-.107-2.576.772-3.435.772-.857 0-2.06-.723-3.004-.707z"/></svg>
                Sign up with Apple
              </button>
            </div>

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
