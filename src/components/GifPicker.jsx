import { useState, useEffect, useRef } from 'react';
import { Search, Loader2 } from 'lucide-react';

// Using Giphy's public beta key for demo purposes
const GIPHY_API_KEY = 'dc6zaTOxFJmzC';

export default function GifPicker({ onSelect, onClose }) {
  const [query, setQuery] = useState('');
  const [gifs, setGifs] = useState([]);
  const [loading, setLoading] = useState(false);
  const searchTimeout = useRef(null);

  const fetchGifs = async (q = '') => {
    setLoading(true);
    try {
      const endpoint = q.trim() 
        ? `https://api.giphy.com/v1/gifs/search?api_key=${GIPHY_API_KEY}&q=${encodeURIComponent(q)}&limit=20`
        : `https://api.giphy.com/v1/gifs/trending?api_key=${GIPHY_API_KEY}&limit=20`;
        
      const res = await fetch(endpoint);
      const data = await res.json();
      setGifs(data.data || []);
    } catch (err) {
      console.error('Failed to fetch GIFs', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGifs();
  }, []);

  useEffect(() => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      fetchGifs(query);
    }, 500);
    return () => clearTimeout(searchTimeout.current);
  }, [query]);

  return (
    <div className="absolute bottom-full mb-2 right-0 w-[300px] h-[350px] bg-dark-bg border border-dark-border rounded-xl shadow-2xl flex flex-col overflow-hidden z-50 animate-fade-in">
      <div className="p-3 border-b border-dark-border flex gap-2 items-center bg-dark-surface">
        <Search size={16} className="text-dark-muted" />
        <input
          autoFocus
          className="bg-transparent border-none outline-none flex-1 text-sm placeholder:text-dark-muted"
          placeholder="Search Giphy..."
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
        <button onClick={onClose} className="p-1 hover:bg-dark-hover rounded-full">
          ✕
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <Loader2 className="animate-spin text-brand-primary" size={24} />
          </div>
        ) : gifs.length === 0 ? (
          <div className="text-center text-dark-muted text-sm mt-10">No GIFs found</div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {gifs.map(gif => (
              <img
                key={gif.id}
                src={gif.images.fixed_height_downsampled.url}
                alt={gif.title}
                className="w-full h-auto rounded cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => onSelect(gif.images.original.url)}
              />
            ))}
          </div>
        )}
      </div>
      <div className="text-[10px] text-center p-1 text-dark-muted bg-dark-surface">Powered By GIPHY</div>
    </div>
  );
}
