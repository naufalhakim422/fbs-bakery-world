/**
 * Helper to parse various video URLs (YouTube, TikTok, Facebook, Google Drive, Direct MP4/Base64)
 * and return the proper embed URL or HTML structure for clean playback without broken frames.
 */
export function getEmbedVideoUrl(url: string, platform?: string): { isDirectVideo: boolean; embedUrl: string; aspectRatio: '16/9' | '9/16' } {
  if (!url || typeof url !== 'string') {
    return { isDirectVideo: false, embedUrl: '', aspectRatio: '16/9' };
  }

  const cleanUrl = url.trim();

  // 1. Direct MP4 / WebM / Base64 Data URL or Blob
  if (
    cleanUrl.startsWith('data:video/') ||
    cleanUrl.startsWith('blob:') ||
    /\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(cleanUrl) ||
    platform === 'FBS'
  ) {
    return { isDirectVideo: true, embedUrl: cleanUrl, aspectRatio: '16/9' };
  }

  // 2. YouTube Shorts (Vertical 9:16)
  if (cleanUrl.includes('youtube.com/shorts/')) {
    const videoId = cleanUrl.split('youtube.com/shorts/')[1]?.split('?')[0] || '';
    if (videoId) {
      return {
        isDirectVideo: false,
        embedUrl: `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`,
        aspectRatio: '9/16',
      };
    }
  }

  // 3. YouTube Standard URLs (Horizontal 16:9)
  if (cleanUrl.includes('youtube.com') || cleanUrl.includes('youtu.be')) {
    let videoId = '';
    
    if (cleanUrl.includes('youtu.be/')) {
      videoId = cleanUrl.split('youtu.be/')[1]?.split('?')[0] || '';
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
        aspectRatio: '16/9',
      };
    }
  }

  // 4. TikTok URLs (Vertical 9:16)
  if (cleanUrl.includes('tiktok.com') || platform === 'TIKTOK') {
    const match = cleanUrl.match(/\/video\/(\d+)/);
    if (match && match[1]) {
      return {
        isDirectVideo: false,
        embedUrl: `https://www.tiktok.com/embed/v2/${match[1]}`,
        aspectRatio: '9/16',
      };
    }
  }

  // 5. Facebook Video URLs (Reels, Watch, Video Posts, Share links)
  if (cleanUrl.includes('facebook.com') || cleanUrl.includes('fb.watch') || cleanUrl.includes('fb.gg') || platform === 'FACEBOOK') {
    let targetUrl = cleanUrl;

    // Handle fb.watch short links if provided directly or standard facebook link
    if (cleanUrl.startsWith('http://') || cleanUrl.startsWith('https://')) {
      targetUrl = cleanUrl;
    } else {
      targetUrl = `https://www.facebook.com/${cleanUrl}`;
    }

    const encodedUrl = encodeURIComponent(targetUrl);
    return {
      isDirectVideo: false,
      embedUrl: `https://www.facebook.com/plugins/video.php?href=${encodedUrl}&show_text=false&autoplay=true`,
      aspectRatio: cleanUrl.includes('/reel/') || cleanUrl.includes('/reels/') ? '9/16' : '16/9',
    };
  }

  // Fallback for standard iframe URLs or generic embed URLs
  const isVertical = platform === 'TIKTOK';
  return { isDirectVideo: false, embedUrl: cleanUrl, aspectRatio: isVertical ? '9/16' : '16/9' };
}
