export function fmt(n) {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000)    return (n / 1000).toFixed(1) + 'K';
  return String(n);
}

export function avgLikes(posts) {
  if (!posts || !posts.length) return 0;
  return Math.round(posts.reduce((s, p) => s + (p.likesCount || 0), 0) / posts.length);
}

export function avgEng(posts) {
  if (!posts || !posts.length) return '0.00';
  return (posts.reduce((s, p) => s + (p.engagementRate || 0), 0) / posts.length * 100).toFixed(2);
}

export function mediaEmoji(t) {
  return t === 'reel' ? '🎬' : t === 'carousel' ? '🖼️' : '📷';
}

export function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr);
  const m = Math.floor(diff / 60000);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}
