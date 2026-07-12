export default function HubTab({ posts = [] }) {
  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Hub</h1>

      {posts.length === 0 ? (
        <p>No posts yet.</p>
      ) : (
        posts.map((post, index) => (
          <div
            key={post.id || index}
            className="p-3 mb-3 rounded-lg border border-dark-border"
          >
            {post.content || post.text || "Untitled Post"}
          </div>
        ))
      )}
    </div>
  );
}
