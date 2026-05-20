import { useState } from "react";
import { FcGoogle } from "react-icons/fc";

export default function Auth({ onAuth }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Replace these with your own backend endpoints
  const LOGIN_URL = "/api/auth/login";
  const SIGNUP_URL = "/api/auth/signup";
  const GOOGLE_URL = "/api/auth/google";

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const endpoint = mode === "signup" ? SIGNUP_URL : LOGIN_URL;
      const payload =
        mode === "signup"
          ? { username: form.username, email: form.email, password: form.password }
          : { email: form.email, password: form.password };
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // only if you use httpOnly cookies session
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error((await res.json())?.message || "Authentication failed");
      const user = await res.json();
      onAuth(user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleGoogle() {
    window.location.href = GOOGLE_URL;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-fuchsia-800 via-50% to-zinc-900 animate-fadeIn">
      <div className="backdrop-blur-xl bg-black/60 border border-fuchsia-700 shadow-2xl rounded-3xl p-10 flex flex-col items-center gap-8 w-full max-w-md">
        <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-fuchsia-500 via-pink-600 to-indigo-500 flex items-center justify-center shadow-lg mb-2">
          <span className="text-white text-4xl font-black drop-shadow-lg">CP</span>
        </div>
        <h1 className="text-3xl font-extrabold bg-gradient-to-r from-fuchsia-400 via-indigo-300 to-pink-400 bg-clip-text text-transparent mb-2 tracking-tight drop-shadow-lg">
          {mode === "signup" ? 'Create your Account' : 'Welcome Back'}
        </h1>
        <p className="text-zinc-300 text-lg mb-3 text-center">
          {mode === "signup"
            ? 'Sign up to join CaisterPlayz Reels!'
            : 'Sign in to enjoy CaisterPlayz.'}
        </p>

        <button
          className="w-full flex items-center justify-center gap-3 rounded-xl py-2.5 text-lg font-medium bg-white hover:bg-zinc-100 transition mt-1 drop-shadow"
          onClick={handleGoogle}
        >
          <FcGoogle className="text-2xl" />
          {mode === "signup" ? "Sign up" : "Sign in"} with Google
        </button>
        <div className="flex items-center w-full gap-3 my-4">
          <hr className="flex-1 border-zinc-600" />
          <span className="text-zinc-400 text-sm">or</span>
          <hr className="flex-1 border-zinc-600" />
        </div>
        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-3">
          {mode === "signup" && (
            <input
              className="rounded-xl bg-zinc-800 text-zinc-200 px-4 py-3 outline-none border border-zinc-700 focus:border-fuchsia-500 placeholder-zinc-500"
              placeholder="Username"
              name="username"
              value={form.username}
              onChange={handleChange}
              required
            />
          )}
          <input
            className="rounded-xl bg-zinc-800 text-zinc-200 px-4 py-3 outline-none border border-zinc-700 focus:border-fuchsia-500 placeholder-zinc-500"
            placeholder="Email"
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
          />
          <input
            className="rounded-xl bg-zinc-800 text-zinc-200 px-4 py-3 outline-none border border-zinc-700 focus:border-fuchsia-500 placeholder-zinc-500"
            placeholder="Password"
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="rounded-xl mt-2 py-2.5 font-bold text-lg text-white bg-gradient-to-r from-fuchsia-500 via-indigo-500 to-pink-500 hover:brightness-110 transition shadow-lg tracking-widest"
          >
            {loading
              ? (mode === "signup" ? "Signing up..." : "Signing in...")
              : (mode === "signup" ? "Sign up" : "Sign in")}
          </button>
        </form>
        {!!error && (
          <div className="text-red-400 font-semibold text-center">{error}</div>
        )}
        <div className="text-sm text-zinc-400 flex flex-row gap-2 mt-2">
          {mode === "signup"
            ? <>Already have an account? <button onClick={() => setMode("login")} className="text-fuchsia-300 underline">Sign in</button></>
            : <>No account? <button onClick={() => setMode("signup")} className="text-fuchsia-300 underline">Sign up</button></>
          }
        </div>
      </div>
    </div>
  );
}
