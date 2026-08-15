export function youtubeEmbedUrl(value) {
  try {
    const url = new URL((value || '').trim());
    const host = url.hostname.replace(/^www\./, '');
    if (!['youtube.com', 'm.youtube.com', 'music.youtube.com', 'youtu.be'].includes(host)) return '';
    const playlist = url.searchParams.get('list');
    if (playlist) return `https://www.youtube-nocookie.com/embed/videoseries?list=${encodeURIComponent(playlist)}`;
    const videoId = host === 'youtu.be' ? url.pathname.split('/').filter(Boolean)[0] : url.pathname.startsWith('/shorts/') ? url.pathname.split('/')[2] : url.searchParams.get('v');
    return /^[a-zA-Z0-9_-]{6,}$/.test(videoId || '') ? `https://www.youtube-nocookie.com/embed/${videoId}` : '';
  } catch { return ''; }
}
