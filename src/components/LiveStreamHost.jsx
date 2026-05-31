export default function LiveStreamHost({ user }) {
  return (
    <div className="p-4 text-white">
      <h1>🔴 Live Stream Host</h1>
      <p>Logged in as: {user?.displayName || "Unknown User"}</p>
    </div>
  );
}
