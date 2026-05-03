// Canvas-based image compression — NO external libraries
export function compressImage(file, maxDim = 800, quality = 0.75) {
  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith('image/')) {
      return reject(new Error('Invalid image file'));
    }
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Failed to load image'));
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          let { width, height } = img;
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          const base64 = canvas.toDataURL('image/jpeg', quality);
          resolve(base64);
        } catch (err) {
          reject(err);
        }
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

export function compressAvatar(file) {
  return compressImage(file, 400, 0.75);
}

export function formatTime(timestamp) {
  if (!timestamp) return 'just now';
  
  // Fix for PocketBase timestamps (Safari/iOS compatibility)
  // PocketBase format: "YYYY-MM-DD HH:MM:SS.SSSZ" -> JS needs "YYYY-MM-DDTHH:MM:SS.SSSZ"
  let parsedDate;
  if (timestamp.toDate) {
    parsedDate = timestamp.toDate();
  } else if (typeof timestamp === 'string') {
    parsedDate = new Date(timestamp.replace(' ', 'T'));
  } else {
    parsedDate = new Date(timestamp);
  }

  if (isNaN(parsedDate.getTime())) return 'just now';
  
  const now = new Date();
  const diff = (now - parsedDate) / 1000;
  if (diff < 0 || diff < 10) return 'just now';
  if (diff < 60) return `${Math.floor(diff)}s`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d`;
  return parsedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function formatCount(n) {
  if (!n || n === 0) return '0';
  if (n >= 1e12) return (n / 1e12).toFixed(1).replace(/\.0$/, '') + 'T';
  if (n >= 1e9) return (n / 1e9).toFixed(1).replace(/\.0$/, '') + 'B';
  if (n >= 1000000) return (n / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
  return String(n);
}

export function engagementScore(post) {
  const likes = (post.likedBy || []).length;
  const reposts = (post.repostedBy || []).length;
  const comments = post._commentCount || 0;
  // Views are passive impressions, so we exclude them from the algorithmic score 
  // to ensure trending is driven exclusively by active, "real engagement"
  return likes * 2 + reposts * 3 + comments * 4;
}

/* ─── Rich Text Parsing ─── */
const URL_REGEX = /(https?:\/\/[^\s<]+[^\s<.,;:!?\])'">\-])/g;

export function parsePostText(text) {
  if (!text) return [];
  const parts = [];
  let lastIndex = 0;
  let match;
  
  URL_REGEX.lastIndex = 0;
  while ((match = URL_REGEX.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: 'text', content: text.slice(lastIndex, match.index) });
    }
    parts.push({ type: 'link', content: match[0] });
    lastIndex = match.index + match[0].length;
  }
  
  if (lastIndex < text.length) {
    parts.push({ type: 'text', content: text.slice(lastIndex) });
  }
  
  return parts.length > 0 ? parts : [{ type: 'text', content: text }];
}
