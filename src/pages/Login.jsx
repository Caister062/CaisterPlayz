import { useState } from 'react';
import pb from './pb';

/* =========================
   LOGIN / SIGNUP PAGE
========================= */
export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        await pb.collection('users').authenticateWithPassword(email, password);
        // Login successful - redirect to app
        window.dispatchEvent(new CustomEvent('auth-success'));
      } else {
        // Sign up
        await pb.collection('users').create({
          email,
          password,
          passwordConfirm: password,
          username: username || email.split('@')[0]
        });
        // Auto login after signup
        await pb.collection('users').authenticateWithPassword(email, password);
        window.dispatchEvent(new CustomEvent('auth-success'));
      }
    } catch (err) {
      setError(err.message || 'Failed to authenticate');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-content">
        {/* Logo */}
        <div className="login-logo" onClick={() => setIsLogin(!isLogin)}>
          <div className="cp-icon-large">CP</div>
          <h1 className="login-title">Playz Fitness</h1>
          <p className="login-subtitle">Your Workout Community</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="login-form">
          {!isLogin && (
            <div className="input-group">
              <label>Username</label>
              <input
                type="text"
                placeholder="Enter username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
          )}

          <div className="input-group">
            <label>Email</label>
            <input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <div className="login-error">{error}</div>
          )}

          <button type="submit" disabled={loading} className="login-btn">
            {loading ? (isLogin ? 'Signing in...' : 'Creating account...') : (isLogin ? 'Sign In' : 'Create Account')}
          </button>

          {/* Toggle mode */}
          <p className="login-toggle" onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
          </p>
        </form>

        <div className="brand-footer">CaisterPlayz Fitness</div>
      </div>
    </div>
  );
}
