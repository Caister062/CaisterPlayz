import { useState } from "react";
import NexusDashboard from "./components/NexusDashboard";
import { usePosts, useAllUsers } from "./hooks";

export default function App() {
  const { posts, loading } = usePosts();
  const users = useAllUsers();

  const [activeView, setActiveView] = useState("nexus");
  // nexus | squads | vault | profile

  const currentUserId = localStorage.getItem("cplayz_user_id") || "me";

  const handleProfileClick = (userId) => {
    console.log("Open profile:", userId);
  };

  const handleQuote = (post) => {
    console.log("Quote:", post.id);
  };

  return (
    <div className="min-h-screen mesh-bg text-white flex md:flex-row flex-col-reverse">

      {/* FLOATING DOCK (Mobile Bottom, Desktop Side) */}
      <nav className="fixed md:sticky md:top-0 bottom-0 left-0 w-full md:w-24 md:h-screen z-50 p-4 flex md:flex-col justify-center items-center pointer-events-none">
        <div className="pointer-events-auto flex md:flex-col gap-6 bg-dark-bg/80 backdrop-blur-2xl border border-white/10 p-4 rounded-3xl shadow-2xl">
          {[
            { id: "nexus", icon: "🌌", label: "Nexus" },
            { id: "squads", icon: "🎮", label: "Squads" },
            { id: "vault", icon: "💎", label: "Vault" },
            { id: "profile", icon: "👤", label: "Profile" }
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={`relative group p-3 rounded-2xl transition-all duration-300 flex flex-col items-center justify-center gap-1 ${
                activeView === item.id 
                  ? "bg-brand-primary text-white shadow-lg shadow-brand-primary/30 scale-110" 
                  : "hover:bg-white/10 text-white/50 hover:text-white"
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              {/* Tooltip for desktop */}
              <span className="absolute left-full ml-4 px-2 py-1 bg-dark-card text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none hidden md:block border border-white/10">
                {item.label}
              </span>
            </button>
          ))}
          <div className="w-px h-6 md:w-6 md:h-px bg-white/10 mx-auto" />
          <button
             className="p-3 rounded-2xl bg-gradient-to-tr from-purple-500 to-brand-primary text-white shadow-lg hover:scale-110 transition-transform flex items-center justify-center"
             onClick={() => console.log("Broadcasting...")}
          >
             <span className="text-xl">+</span>
          </button>
        </div>
      </nav>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 overflow-y-auto w-full md:max-w-5xl mx-auto safe-area">
        {/* HEADER */}
        <header className="sticky top-0 z-40 bg-transparent px-6 py-6 flex items-center justify-between">
          <h1 className="text-2xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white to-white/50">
            CaisterPlayz
          </h1>
          <div className="flex gap-3">
             <button className="w-10 h-10 rounded-full glass flex items-center justify-center hover:bg-white/10 transition">
               🔔
             </button>
             <button className="w-10 h-10 rounded-full glass flex items-center justify-center hover:bg-white/10 transition">
               ⚙️
             </button>
          </div>
        </header>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-pulse flex flex-col items-center gap-4">
               <div className="w-12 h-12 rounded-full border-4 border-brand-primary border-t-transparent animate-spin" />
               <p className="text-brand-secondary font-medium tracking-widest uppercase text-sm">Booting System...</p>
            </div>
          </div>
        ) : activeView === "nexus" ? (
          <NexusDashboard 
            posts={posts} 
            users={users} 
            currentUserId={currentUserId} 
            onProfileClick={handleProfileClick} 
            onQuote={handleQuote} 
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-[60vh] text-center px-4">
            <span className="text-6xl mb-4 opacity-50">🚧</span>
            <h2 className="text-2xl font-bold mb-2">Module Offline</h2>
            <p className="text-dark-muted max-w-md">The {activeView} module is currently being calibrated for the new CaisterPlayz experience.</p>
          </div>
        )}
      </main>

    </div>
  );
}
