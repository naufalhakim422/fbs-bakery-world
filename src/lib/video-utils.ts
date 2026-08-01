/**
 * Helper to parse various video URLs (YouTube, TikTok, Facebook, Google Drive, Direct MP4/Base64)
 * and return the proper embed URL or HTML structure for clean playback without broken frames.
 */
export function getEmbedVideoUrl(url: string, platform?: string): { isDirectVideo: boolean; embedUrl: string } {
  if (!url || typeof url !== 'string') {
    return { isDirectVideo: false, embedUrl: '' };
  }

  const cleanUrl = url.trim();

  // 1. Direct MP4 / WebM / Base64 Data URL or Blob
  if (
    cleanUrl.startsWith('data:video/') ||
    cleanUrl.startsWith('blob:') ||
    /\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(cleanUrl) ||
    platform === 'FBS'
  ) {
    return { isDirectVideo: true, embedUrl: cleanUrl };
  }

  // 2. YouTube URLs (watch, shorts, embed, youtu.be)
  if (cleanUrl.includes('youtube.com') || cleanUrl.includes('youtu.be')) {
    let videoId = '';
    
    if (cleanUrl.includes('youtu.be/')) {
      videoId = cleanUrl.split('youtu.be/')[1]?.split('?')[0] || '';
    } else if (cleanUrl.includes('youtube.com/shorts/')) {
      videoId = cleanUrl.split('youtube.com/shorts/')[1]?.split('?')[0] || '';
    } else if (cleanUrl.includes('youtube.com/watch')) {
      try {
        const urlObj = new URL(cleanUrl);
        videoId = urlObj.searchParams.get('v') || '';
      } catch (e) {
        videoId = cleanUrl.split('v=')[1]?.split('&')[0] || '';
      }
    } else if (cleanUrl.includes('youtube.com/embed/')) {
      videoId = cleanUrl.split('youtube.com/embed/')[1]?.split('?')[0] || '';
    }

    if (videoId) {
      return {
        isDirectVideo: false,
        embedUrl: `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`,
      };
    }
  }

  // 3. TikTok URLs (video ID conversion to embed player)
  if (cleanUrl.includes('tiktok.com')) {
    const match = cleanUrl.match(/\/video\/(\d+)/);
    if (match && match[1]) {
      return {
        isDirectVideo: false,
        embedUrl: `https://www.tiktok.com/embed/v2/${match[1]}`,
      };
    }
  }

  // Fallback for standard iframe URLs
  return { isDirectVideo: false, embedUrl: cleanUrl };
}
