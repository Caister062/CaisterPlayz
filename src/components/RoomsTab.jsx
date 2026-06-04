export default function RoomsTab({ communities = [] }) {
  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Rooms</h1>

      {communities.length === 0 ? (
        <p>No rooms found.</p>
      ) : (
        communities.map((community, index) => (
          <div
            key={community.id || index}
            className="p-3 mb-3 rounded-lg border border-dark-border"
          >
            {community.name || "Community"}
          </div>
        ))
      )}
    </div>
  );
}
