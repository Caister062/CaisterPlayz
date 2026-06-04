import { useState } from "react";
import {
  Gamepad2,
  Trophy,
  Users,
  Radio,
  User,
  Menu,
  MessageSquare
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

  const [activeTab, setActiveTab] = useState("hub");
  const [isDmOpen, setIsDmOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const { threads } = useDMThreads(user?.id);

  const hasUnreadDms =
    threads?.some(
      t =>
        t.lastMessage &&
        t.lastMessage.senderId !== user?.id &&
        !t.lastMessage.read
    ) || false;

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-dark-bg">
        <Gamepad2 className="w-10 h-10 text-brand-primary animate-pulse" />
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

        <header className="sticky top-0 z-40 h-14 border-b border-dark-border bg-dark-bg/95 backdrop-blur-xl">
          <div className="h-full flex items-center justify-between px-4">

            <div className="flex items-center gap-3">
              <button onClick={() => setIsSidebarOpen(true)}>
                <Menu className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2">
                <Gamepad2
                  className="w-6 h-6 text-brand-primary"
                  fill="currentColor"
                />
                <span className="font-black text-lg">
                  CAISTERPLAYZ
                </span>
              </div>
            </div>

            <button
              onClick={() => setIsDmOpen(true)}
              className="relative"
            >
              <MessageSquare className="w-5 h-5" />

              {hasUnreadDms && (
                <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-brand-primary" />
              )}
            </button>

          </div>
        </header>

        {/* MAIN */}

        <main className="flex-1 pb-20">

          {activeTab === "hub" && (
            <HubTab
              posts={posts}
              users={users}
              communities={communities}
            />
          )}

          {activeTab === "events" && (
            <EventsTab
              posts={posts}
            />
          )}

          {activeTab === "rooms" && (
            <RoomsTab
              communities={communities}
              users={users}
            />
          )}

          {activeTab === "squads" && (
            <SquadsTab
              posts={posts}
              users={users}
            />
          )}

          {activeTab === "profile" && (
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

        {/* BOTTOM NAV */}

        <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-lg border-t border-dark-border bg-dark-bg/95 backdrop-blur-xl">

          <div className="flex justify-around py-2">

            <TabButton
              icon={Gamepad2}
              active={activeTab === "hub"}
              onClick={() => setActiveTab("hub")}
            />

            <TabButton
              icon={Trophy}
              active={activeTab === "events"}
              onClick={() => setActiveTab("events")}
            />

            <TabButton
              icon={Users}
              active={activeTab === "rooms"}
              onClick={() => setActiveTab("rooms")}
            />

            <TabButton
              icon={Radio}
              active={activeTab === "squads"}
              onClick={() => setActiveTab("squads")}
            />

            <TabButton
              icon={User}
              active={activeTab === "profile"}
              onClick={() => setActiveTab("profile")}
            />

          </div>

        </nav>

        {/* DMS */}

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
      className={`p-3 rounded-full transition-all ${
        active
          ? "text-brand-primary"
          : "text-dark-muted"
      }`}
    >
      <Icon
        className="w-6 h-6"
        strokeWidth={active ? 2.5 : 1.75}
      />
    </button>
  );
}
