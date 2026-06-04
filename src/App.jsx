import { useState } from "react";
import {
  Gamepad2,
  Trophy,
  Users,
  Radio,
  User,
  Menu,
  Headphones
} from "lucide-react";

import {
  useAuth,
  useUserProfile,
  usePosts,
  useCommunities,
  useAllUsers,
  useDMThreads
} from "./hooks";

import Auth from "./components/Auth";
import DirectMessages from "./components/DirectMessages";

import HubTab from "./components/HubTab";
import EventsTab from "./components/EventsTab";
import RoomsTab from "./components/RoomsTab";
import SquadsTab from "./components/SquadsTab";
import ProfileTab from "./components/ProfileTab";

export default function App() {
  const auth = useAuth();
  const { user, loading, logout } = auth;

  const profile = useUserProfile(user?.id);

  const { posts } = usePosts();
  const { communities } = useCommunities();
  const users = useAllUsers();

  const [activeTab, setActiveTab] = useState("pulse");
  const [isDmOpen, setIsDmOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const { threads } = useDMThreads(user?.id);

  const hasUnreadDms =
    threads?.some(
      (t) =>
        t.lastMessage &&
        t.lastMessage.senderId !== user?.id &&
        !t.lastMessage.read
    ) || false;

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-dark-bg">
        <Gamepad2 className="w-12 h-12 text-brand-primary animate-pulse" />
      </div>
    );
  }

  if (!user) {
    return <Auth auth={auth} />;
  }

  return (
    <div className="w-full min-h-screen bg-dark-bg flex justify-center">
      <div className="w-full max-w-lg flex flex-col min-h-screen">

        {/* HEADER */}
        <header className="sticky top-0 z-40 border-b border-dark-border bg-dark-bg/95 backdrop-blur-xl">
          <div className="h-16 flex items-center justify-between px-4">

            <div className="flex items-center gap-3">
              <button onClick={() => setIsSidebarOpen(true)}>
                <Menu className="w-5 h-5 text-white" />
              </button>

              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-brand-primary/10">
                  <Gamepad2
                    className="w-6 h-6 text-brand-primary"
                    fill="currentColor"
                  />
                </div>

                <div>
                  <h1 className="font-black tracking-wider text-white">
                    CAISTERPLAYZ
                  </h1>

                  <p className="text-xs text-dark-muted">
                    Gaming Network
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsDmOpen(true)}
              className="relative"
            >
              <Headphones className="w-5 h-5 text-white" />

              {hasUnreadDms && (
                <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-brand-primary animate-pulse" />
              )}
            </button>
          </div>

          {/* ONLINE STATUS BAR */}
          <div className="px-4 py-2 border-t border-dark-border">
            <div className="flex items-center gap-2 text-xs text-dark-muted">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              Players Online
            </div>
          </div>
        </header>

        {/* MAIN CONTENT */}
        <main className="flex-1 pb-28">

          {activeTab === "pulse" && (
            <HubTab
              posts={posts}
              users={users}
              communities={communities}
            />
          )}

          {activeTab === "tournaments" && (
            <EventsTab posts={posts} />
          )}

          {activeTab === "communities" && (
            <RoomsTab
              communities={communities}
              users={users}
            />
          )}

          {activeTab === "lfg" && (
            <SquadsTab
              posts={posts}
              users={users}
            />
          )}

          {activeTab === "locker" && (
            <ProfileTab
              viewingUserId={user.id}
              currentUserId={user.id}
              profile={profile}
              users={users}
              posts={posts}
              onLogout={logout}
            />
          )}
        </main>

        {/* FLOATING GAMING DOCK */}
        <nav className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50">
          <div className="flex gap-2 px-3 py-2 rounded-3xl border border-dark-border bg-dark-bg/95 backdrop-blur-xl shadow-2xl">

            <TabButton
              icon={Gamepad2}
              active={activeTab === "pulse"}
              onClick={() => setActiveTab("pulse")}
            />

            <TabButton
              icon={Trophy}
              active={activeTab === "tournaments"}
              onClick={() => setActiveTab("tournaments")}
            />

            <TabButton
              icon={Users}
              active={activeTab === "communities"}
              onClick={() => setActiveTab("communities")}
            />

            <TabButton
              icon={Radio}
              active={activeTab === "lfg"}
              onClick={() => setActiveTab("lfg")}
            />

            <TabButton
              icon={User}
              active={activeTab === "locker"}
              onClick={() => setActiveTab("locker")}
            />
          </div>
        </nav>

        <DirectMessages
          isOpen={isDmOpen}
          onClose={() => setIsDmOpen(false)}
          currentUserId={user.id}
          users={users}
        />
      </div>
    </div>
  );
}

function TabButton({
  icon: Icon,
  active,
  onClick
}) {
  return (
    <button
      onClick={onClick}
      className={`relative p-3 rounded-2xl transition-all duration-300 ${
        active
          ? "bg-brand-primary/15 text-brand-primary scale-110"
          : "text-dark-muted hover:text-white"
      }`}
    >
      <Icon
        className="w-6 h-6"
        strokeWidth={active ? 2.75 : 1.75}
      />

      {active && (
        <div className="absolute inset-0 rounded-2xl border border-brand-primary/30" />
      )}
    </button>
  );
}
