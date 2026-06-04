import { useState } from "react";
import {
  Home,
  Compass,
  Users,
  Headphones,
  Shield,
  Menu,
  Gamepad2
} from "lucide-react";

import {
  useAuth,
  useUserProfile,
  usePosts,
  useCommunities,
  useAllUsers
} from "./hooks";

import Auth from "./components/Auth";
import DirectMessages from "./components/DirectMessages";

import HomeTab from "./components/HomeTab";
import DiscoverTab from "./components/DiscoverTab";
import SquadsTab from "./components/SquadsTab";
import LockerTab from "./components/LockerTab";

export default function App() {
  const auth = useAuth();
  const { user, loading, logout } = auth;

  const profile = useUserProfile(user?.id);

  const { posts } = usePosts();
  const { communities } = useCommunities();
  const users = useAllUsers();

  const [activeTab, setActiveTab] = useState("home");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCommsOpen, setIsCommsOpen] = useState(false);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-dark-bg">
        <Gamepad2 className="w-10 h-10 animate-pulse text-brand-primary" />
      </div>
    );
  }

  if (!user) {
    return <Auth auth={auth} />;
  }

  return (
    <div className="w-full min-h-screen bg-dark-bg flex justify-center">
      <div className="w-full max-w-lg min-h-screen flex flex-col">

        {/* HEADER */}
        <header className="sticky top-0 z-50 border-b border-dark-border bg-dark-bg/95 backdrop-blur-xl">
          <div className="h-16 px-4 flex items-center justify-between">

            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsSidebarOpen(true)}
              >
                <Menu className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2">
                <Gamepad2 className="w-6 h-6 text-brand-primary" />

                <div>
                  <h1 className="font-black tracking-wider">
                    CAISTERPLAYZ
                  </h1>

                  <p className="text-xs text-dark-muted">
                    Gaming Social Network
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsCommsOpen(true)}
              className="px-3 py-1 rounded-lg bg-brand-primary/10 text-brand-primary text-sm"
            >
              Comms
            </button>

          </div>
        </header>

        {/* MAIN */}
        <main className="flex-1 pb-24">

          {activeTab === "home" && (
            <HomeTab
              user={user}
              users={users}
              posts={posts}
              communities={communities}
            />
          )}

          {activeTab === "discover" && (
            <DiscoverTab
              posts={posts}
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

          {activeTab === "locker" && (
            <LockerTab
              viewingUserId={user.id}
              currentUserId={user.id}
              profile={profile}
              users={users}
              posts={posts}
              onLogout={logout}
            />
          )}

        </main>

        {/* NAVIGATION */}
        <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 w-full max-w-md px-4">
          <div className="bg-dark-card border border-dark-border rounded-2xl backdrop-blur-xl flex justify-around py-2 shadow-xl">

            <TabButton
              icon={Home}
              active={activeTab === "home"}
              onClick={() => setActiveTab("home")}
            />

            <TabButton
              icon={Compass}
              active={activeTab === "discover"}
              onClick={() => setActiveTab("discover")}
            />

            <TabButton
              icon={Users}
              active={activeTab === "squads"}
              onClick={() => setActiveTab("squads")}
            />

            <TabButton
              icon={Headphones}
              active={false}
              onClick={() => setIsCommsOpen(true)}
            />

            <TabButton
              icon={Shield}
              active={activeTab === "locker"}
              onClick={() => setActiveTab("locker")}
            />

          </div>
        </nav>

        <DirectMessages
          isOpen={isCommsOpen}
          onClose={() => setIsCommsOpen(false)}
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
      className={`p-3 rounded-xl transition-all duration-300 ${
        active
          ? "bg-brand-primary/15 text-brand-primary scale-110"
          : "text-dark-muted hover:text-white"
      }`}
    >
      <Icon className="w-6 h-6" />
    </button>
  );
}
