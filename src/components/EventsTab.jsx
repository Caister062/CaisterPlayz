export default function EventsTab({ posts = [] }) {
  return (
    <div className="p-4 space-y-4">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-dark-text tracking-tight">
          Events
        </h1>
        <p className="text-xs text-dark-muted mt-1">
          Discover community events and live moments
        </p>
      </div>

      {/* Empty state */}
      {posts.length === 0 ? (
        <div className="mt-10 text-center text-dark-muted">
          <div className="text-sm font-bold mb-1">No events yet</div>
          <p className="text-xs">
            When creators host events, they’ll appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">

          {posts.map((post, index) => (
            <div
              key={post.id || index}
              className="group rounded-2xl border border-dark-border bg-dark-surface p-4 hover:border-brand-primary/40 transition-all hover:shadow-lg"
            >

              {/* Title */}
              <div className="flex items-start justify-between gap-3">
                <h2 className="font-bold text-dark-text text-sm leading-snug">
                  {post.title || "Untitled Event"}
                </h2>

                {/* Badge */}
                <span className="text-[10px] px-2 py-1 rounded-full bg-brand-primary/10 text-brand-primary font-bold">
                  EVENT
                </span>
              </div>

              {/* Optional description */}
              {post.description && (
                <p className="text-xs text-dark-muted mt-2 line-clamp-2">
                  {post.description}
                </p>
              )}

              {/* Footer */}
              <div className="flex items-center justify-between mt-3">

                <div className="text-[10px] text-dark-muted">
                  {post.date ? `📅 ${post.date}` : "No date set"}
                </div>

                <button className="text-xs font-bold text-brand-primary hover:opacity-80 transition">
                  Join →
                </button>

              </div>

            </div>
          ))}

        </div>
      )}
    </div>
  );
}
