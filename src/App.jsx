import { useEffect, useState, useCallback } from "react";
import PostCard from "./components/PostCard";
import { usePosts, useAllUsers } from "./hooks";

export default function App() {
  const [posts, setPosts] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // ORIGINAL NAV STRUCTURE (NOT TWITTER-LIKE)
  const [activeTab, setActiveTab] = useState("explore");
  // explore | circles | moments | you

  const currentUserId = "me";

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [postData, userData] = await Promise.all([
        fetchPosts(),
        fetchUsers(),
      ]);

      setPosts(postData || []);
      setUsers(userData || []);
    } catch (err) {
      console.error("Load error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    const refresh = () => loadData();
    window.addEventListener("refreshPosts", refresh);
    return () => window.removeEventListener("refreshPosts", refresh);
  }, [loadData]);

  // 🔥 NEW FEED LOGIC (more “app-like”, less social media)
  const filteredPosts = (() => {
    switch (activeTab) {
      case "circles":
        // group-based feel (simulate interest clusters)
        return posts.filter(p => (p.tags || []).length > 0);

      case "moments":
        // media-first feed
        return posts.filter(p => p.imageUrl);

      case "you":
        // personal archive
        return posts.filter(p => p.userId === currentUserId);

      case "explore":
      default:
        // discovery feed (randomized + fresh feeling)
        return [...posts]
          .sort(() => Math.random() - 0.5)
          .slice(0, 50);
    }
  })();

  const handleProfileClick = (userId) => {
    console.log("Open profile:", userId);
  };

  const handleQuote = (post) => {
    console.log("Quote:", post.id);
  };

  return (
    <div className="min-h-screen bg-dark-bg text-white flex flex-col">

      {/* HEADER (clean Apple-style minimal) */}
      <header className="sticky top-0 z-50 bg-dark-bg/80 backdrop-blur border-b border-dark-border px-4 py-3">
        <h1 className="text-lg font-bold tracking-wide">
          CaisterPlayz
        </h1>
      </header>

      {/* ORIGINAL TAB SYSTEM */}
      <nav className="flex border-b border-dark-border bg-dark-bg sticky top-[49px] z-40">
        {[
          { key: "explore", label: "Explore" },
          { key: "circles", label: "Circles" },
          { key: "moments", label: "Moments" },
          { key: "you", label: "You" },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 py-3 text-sm font-medium transition-all ${
              activeTab === tab.key
                ? "text-white border-b-2 border-brand-primary"
                : "text-dark-muted hover:text-white"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {/* FEED */}
      <main className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="p-6 text-center text-dark-muted">
            Loading experience...
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="p-6 text-center text-dark-muted">
            Nothing here yet
          </div>
        ) : (
          filteredPosts.map(post => (
            <PostCard
              key={post.id}
              post={post}
              posts={posts}
              users={users}
              currentUserId={currentUserId}
              onProfileClick={handleProfileClick}
              onHashtagClick={(tag) => console.log("tag:", tag)}
              onQuote={handleQuote}
            />
          ))
        )}
      </main>

      {/* FLOATING “CREATE” BUTTON (very Apple/social-app safe pattern) */}
      <button
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-brand-primary text-white text-2xl shadow-lg hover:scale-105 transition"
        onClick={() => console.log("create post")}
      >
        +
      </button>

      <div className="h-6" />
    </div>
  );
}
