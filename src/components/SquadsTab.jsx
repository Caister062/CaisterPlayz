import { useMemo, useState } from "react";
import { Users, Sword, Crown, Zap } from "lucide-react";

export default function SquadsTab({ posts = [], users = [] }) {
  const [filter, setFilter] = useState("all");

  // Turn posts into "squad rooms"
  const squads = useMemo(() => {
    return posts
      .filter(p => p.type === "squad" || p.tags?.includes("squad"))
      .map(p => {
        const memberCount = p.members?.length || Math.floor(Math.random() * 20) + 1;
        return {
          id: p.id,
          name: p.title || "Unnamed Squad",
          description: p.content || "A gaming squad looking for players",
          owner: p.userId,
          members: memberCount,
          mode: p.gameMode || "Casual",
          power: Math.floor(Math.random() * 100),
          isHot: memberCount > 10,
        };
      });
  }, [posts]);

  const filtered = useMemo(() => {
    if (filter === "hot") return squads.filter(s => s.isHot);
    if (filter === "elite") return squads.filter(s => s.power > 70);
    return squads;
  }, [squads, filter]);

  return (
    <div className="p-4 space-y-4">

      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-black tracking-wide flex items-center gap-2">
          <Sword className="w-6 h-6 text-brand-primary" />
          SQUAD ROOMS
        </h1>
        <p className="text-xs text-dark-muted">
          Join live squads, not posts.
        </p>
      </div>

      {/* FILTER TABS */}
      <div className="flex gap-2">
        <button
          onClick={() => setFilter("all")}
          className={`px-3 py-1 rounded-lg text-sm ${
            filter === "all"
              ? "bg-brand-primary text-black"
              : "bg-dark-card text-dark-muted"
          }`}
        >
          All
        </button>

        <button
          onClick={() => setFilter("hot")}
          className={`px-3 py-1 rounded-lg text-sm flex items-center gap-1 ${
            filter === "hot"
              ? "bg-red-500 text-white"
              : "bg-dark-card text-dark-muted"
          }`}
        >
          <Zap className="w-4 h-4" /> Hot
        </button>

        <button
          onClick={() => setFilter("elite")}
          className={`px-3 py-1 rounded-lg text-sm flex items-center gap-1 ${
            filter === "elite"
              ? "bg-yellow-500 text-black"
              : "bg-dark-card text-dark-muted"
          }`}
        >
          <Crown className="w-4 h-4" /> Elite
        </button>
      </div>

      {/* SQUAD CARDS */}
      {filtered.length === 0 ? (
        <div className="text-center text-dark-muted py-10">
          No squads online right now. Create one 🔥
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(squad => (
            <div
              key={squad.id}
              className="p-4 rounded-2xl border border-dark-border bg-dark-card hover:scale-[1.02] transition"
            >
              <div className="flex justify-between items-start">

                <div>
                  <h2 className="font-bold text-lg flex items-center gap-2">
                    {squad.name}
                    {squad.isHot && (
                      <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded-full">
                        HOT
                      </span>
                    )}
                  </h2>

                  <p className="text-sm text-dark-muted mt-1">
                    {squad.description}
                  </p>

                  <div className="flex gap-3 mt-2 text-xs text-dark-muted">
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {squad.members} players
                    </span>

                    <span>Mode: {squad.mode}</span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs text-dark-muted">POWER</div>
                  <div className="text-xl font-black text-brand-primary">
                    {squad.power}
                  </div>
                </div>

              </div>

              {/* ACTIONS */}
              <div className="mt-4 flex gap-2">
                <button className="flex-1 py-2 rounded-xl bg-brand-primary text-black font-bold">
                  Join Squad
                </button>

                <button className="px-3 py-2 rounded-xl bg-dark-hover text-dark-muted">
                  View
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
