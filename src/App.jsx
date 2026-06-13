import { useState } from "react";
import {
  Radar,
  Globe2,
  DoorOpen,
  Headphones,
  UserCircle2,
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

  const [activeTab, setActiveTab] = useState("radar");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCommsOpen, setIsCommsOpen] = useState(false);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-dark-bg">
        <Gamepad2 className="w-12 h-12 animate-pulse text-brand-primary" />
      </div>
    );
  }

  if (!user) {
    return <Auth auth={auth} />;
  }

  return (
    <div className="w-full min-h-screen bg-dark-bg flex justify-center">
      <div className="w-full max-w-lg min-h-screen flex flex-col relative">

        {/* HEADER */}
        <header className="sticky top-0 z-50 bg-dark-bg/80 backdrop-blur-2xl border-b border-dark-border">
          <div className="h-20 px-5 flex items-center justify-between">

            <div className="flex items-center gap-3">

              <button
                onClick={() => setIsSidebarOpen(true)}
                className="p-2 rounded-xl hover:bg-dark-card"
              >
                <Menu className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3">

                <div className="w-10 h-10 rounded-2xl bg-brand-primary/15 flex items-center justify-center">
                  <Gamepad2 className="w-5 h-5 text-brand-primary" />
                </div>

                <div>
                  <h1 className="font-black tracking-[0.25em] text-sm">
                    CAISTERPLAYZ
                  </h1>

                  <p className="text-xs text-brand-primary">
                    Live Gaming Universe
                  </p>
                </div>

              </div>
            </div>

            <button
              onClick={() => setIsCommsOpen(true)}
              className="
                flex items-center gap-2
                px-3 py-2
                rounded-xl
                bg-brand-primary/10
                border border-brand-primary/20
              "
            >
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-sm text-brand-primary">
                Party
              </span>
            </button>

          </div>
        </header>

        {/* MAIN */}
        <main className="flex-1 pb-28">

          {/* RADAR */}
          {activeTab === "radar" && (
            <HomeTab
              user={user}
              users={users}
              posts={posts}
              communities={communities}
            />
          )}

          {/* WORLDS */}
          {activeTab === "worlds" && (
            <DiscoverTab
              posts={posts}
              communities={communities}
              users={users}
            />
          )}

          {/* ROOMS */}
          {activeTab === "rooms" && (
            <SquadsTab
              posts={posts}
              users={users}
            />
          )}

          {/* ME */}
          {activeTab === "me" && (
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

        {/* FLOATING NAV */}
        <nav className="fixed bottom-5 left-1/2 -translate-x-1/2 w-full max-w-md px-4 z-50">

          <div
            className="
              bg-dark-card/80
              backdrop-blur-2xl
              border border-dark-border
              rounded-3xl
              flex justify-around
              py-3
              shadow-2xl
            "
          >

            <TabButton
              icon={Radar}
              active={activeTab === "radar"}
              onClick={() => setActiveTab("radar")}
            />

            <TabButton
              icon={Globe2}
              active={activeTab === "worlds"}
              onClick={() => setActiveTab("worlds")}
            />

            <TabButton
              icon={DoorOpen}
              active={activeTab === "rooms"}
              onClick={() => setActiveTab("rooms")}
            />

            <TabButton
              icon={Headphones}
              active={false}
              onClick={() => setIsCommsOpen(true)}
            />

            <TabButton
              icon={UserCircle2}
              active={activeTab === "me"}
              onClick={() => setActiveTab("me")}
            />

          </div>

        </nav>

        {/* PARTY / DMS */}
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
      className={`
        relative
        p-3
        rounded-2xl
        transition-all
        duration-300
        ${
          active
            ? "bg-brand-primary/15 text-brand-primary scale-110"
            : "text-dark-muted hover:text-white"
        }
      `}
    >
      <Icon className="w-6 h-6" />

      {active && (
        <div
          className="
            absolute
            -bottom-1
            left-1/2
            -translate-x-1/2
            w-1 h-1
            rounded-full
            bg-brand-primary
          "
        />
      )}
    </button>
  );
}
