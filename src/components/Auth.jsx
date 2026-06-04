import { useState } from "react";
import { Gamepad2, Trophy, Users, Radio } from "lucide-react";

export default function Auth({ auth }) {
  const { loginWithGoogle, loginAsGuest } = auth;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGoogleLogin = async () => {
    if (loading) return;

    setLoading(true);
    setError("");

    try {
      await loginWithGoogle();
    } catch (err) {
      console.error(err);
      setError(err.message || "Authentication failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    if (loading) return;

    setLoading(true);
    setError("");

    try {
      await loginAsGuest();
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to continue.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-bg flex items-center justify-center px-6 overflow-hidden relative">

      {/* Background Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-200px] left-[-200px] w-[500px] h-[500px] rounded-full bg-blue-500/10 blur-[150px]" />
        <div className="absolute bottom-[-200px] right-[-200px] w-[500px] h-[500px] rounded-full bg-indigo-500/10 blur-[150px]" />
      </div>

      <div className="relative z-10 w-full max-w-md">

        {/* Logo */}
        <div className="flex flex-col items-center mb-8">

          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center shadow-2xl shadow-blue-500/20 mb-6">
            <Gamepad2
              className="w-12 h-12 text-white"
              strokeWidth={2.5}
            />
          </div>

          <h1 className="text-4xl font-black tracking-wider text-center">
            CAISTERPLAYZ
          </h1>

          <p className="text-dark-muted text-center mt-3">
            Find Players • Build Squads • Share Wins
          </p>

        </div>

        {/* Main Card */}
        <div className="card glow-card p-8">

          <div className="grid grid-cols-3 gap-3 mb-8">

            <div className="panel p-3 text-center">
              <Trophy className="w-5 h-5 mx-auto mb-2 text-yellow-400" />
              <p className="text-xs">Events</p>
            </div>

            <div className="panel p-3 text-center">
              <Users className="w-5 h-5 mx-auto mb-2 text-green-400" />
              <p className="text-xs">Squads</p>
            </div>

            <div className="panel p-3 text-center">
              <Radio className="w-5 h-5 mx-auto mb-2 text-blue-400" />
              <p className="text-xs">Comms</p>
            </div>

          </div>

          <h2 className="text-xl font-bold text-center mb-2">
            Enter The Network
          </h2>

          <p className="text-sm text-dark-muted text-center mb-6">
            Connect with gamers, join communities, and discover events.
          </p>

          {error && (
            <div className="mb-4 text-red-400 text-sm text-center">
              {error}
            </div>
          )}

          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="btn-primary w-full flex items-center justify-center gap-3 mb-4"
          >
            <svg
              className="w-5 h-5"
              viewBox="0 0 24 24"
            >
              <path
                fill="#EA4335"
                d="M12.24 10.285V14.4h6.887c-.275 1.565-1.88 4.604-6.887 4.604-4.33 0-7.859-3.578-7.859-8s3.53-8 7.859-8c2.46 0 4.105 1.025 5.047 1.926l3.227-3.104C18.28 1.844 15.42 1 12.24 1 6.033 1 1 6.033 1 12.24s5.033 11.24 11.24 11.24c6.478 0 10.793-4.537 10.793-10.986 0-.746-.08-1.32-.176-1.782h-10.627z"
              />
            </svg>

            {loading
              ? "Connecting..."
              : "Continue With Google"}
          </button>

          <button
            onClick={handleGuestLogin}
            disabled={loading}
            className="btn-secondary w-full"
          >
            Continue As Guest
          </button>

        </div>

        <div className="text-center mt-6 text-xs text-dark-muted">
          Fortnite • Roblox • Minecraft • Rocket League
        </div>

      </div>
    </div>
  );
}
