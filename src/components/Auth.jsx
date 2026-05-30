import { useState } from 'react';
import { Gamepad2 } from 'lucide-react';

export default function Auth({ auth }) {
  const { loginWithGoogle, loginAsGuest } = auth;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGoogleLogin = async () => {
    if (loading) return;

    setLoading(true);
    setError('');

    try {
      await loginWithGoogle();
    } catch (err) {
      console.error(err);
      setError(err.message || 'Google Authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    if (loading) return;

    setLoading(true);
    setError('');

    try {
      await loginAsGuest();
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to enter as Guest.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0b0c0f] px-4 relative overflow-hidden select-none">
      <div className="absolute top-[-20%] left-[-20%] w-[600px] h-[600px] bg-brand-primary/5 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-20%] w-[600px] h-[600px] bg-brand-secondary/5 rounded-full blur-[150px] pointer-events-none" />

      <div className="w-full max-w-md bg-zinc-950/80 border border-zinc-800/80 backdrop-blur-2xl rounded-[32px] p-8 flex flex-col items-center relative z-10 shadow-2xl">

        <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-brand-primary/20 to-transparent" />

        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-primary/10 to-brand-secondary/10 border border-dark-border flex items-center justify-center mb-6 relative group">
          <Gamepad2 className="w-8 h-8 text-brand-primary" />
        </div>

        <h2 className="text-2xl font-bold text-dark-text text-center mb-2">
          Welcome to CaisterPlayz
        </h2>

        <p className="text-xs text-dark-muted mb-8 text-center">
          Continue with Google to access CaisterPlayz.
        </p>

        {error && (
          <div className="w-full mb-4 text-red-400 text-sm text-center">
            {error}
          </div>
        )}

        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-white font-bold py-3 px-4 rounded-2xl mb-4"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="#EA4335"
              d="M12.24 10.285V14.4h6.887c-.275 1.565-1.88 4.604-6.887 4.604-4.33 0-7.859-3.578-7.859-8s3.53-8 7.859-8c2.46 0 4.105 1.025 5.047 1.926l3.227-3.104C18.28 1.844 15.42 1 12.24 1 6.033 1 1 6.033 1 12.24s5.033 11.24 11.24 11.24c6.478 0 10.793-4.537 10.793-10.986 0-.746-.08-1.32-.176-1.782h-10.627z"
            />
          </svg>
          Continue with Google
        </button>

        <button
          onClick={handleGuestLogin}
          disabled={loading}
          className="text-xs font-bold text-dark-muted hover:text-brand-primary uppercase tracking-widest"
        >
          Continue as Guest
        </button>
      </div>
    </div>
  );
}
