export function getVideoId(url: string): string | null {
  if (!url) return null;

  try {
    // Handle pasted video IDs directly
    if (/^[a-zA-Z0-9_-]{11}$/.test(url)) {
      return url;
    }

    // Try to parse URL
    let urlObj: URL;
    try {
      urlObj = new URL(url);
    } catch {
      return null;
    }

    // Clean up the URL
    const hostname = urlObj.hostname.replace('www.', '');

    // Handle youtu.be links
    if (hostname === 'youtu.be') {
      const id = urlObj.pathname.slice(1);
      return id.length === 11 ? id : null;
    }

    // Handle various youtube.com formats
    if (hostname === 'youtube.com' || hostname === 'm.youtube.com') {
      // Handle watch URLs
      if (urlObj.searchParams.has('v')) {
        const id = urlObj.searchParams.get('v');
        return id?.length === 11 ? id : null;
      }

      // Handle embed URLs
      if (urlObj.pathname.startsWith('/embed/')) {
        const id = urlObj.pathname.split('/')[2];
        return id?.length === 11 ? id : null;
      }

      // Handle shortened URLs
      if (urlObj.pathname.startsWith('/v/')) {
        const id = urlObj.pathname.split('/')[2];
        return id?.length === 11 ? id : null;
      }

      // Handle shorts
      if (urlObj.pathname.startsWith('/shorts/')) {
        const id = urlObj.pathname.split('/')[2];
        return id?.length === 11 ? id : null;
      }

      // Handle live videos
      if (urlObj.pathname.startsWith('/live/')) {
        const id = urlObj.pathname.split('/')[2];
        // Remove any query parameters that might be in the ID
        const cleanId = id?.split('?')[0];
        return cleanId?.length === 11 ? cleanId : null;
      }
    }

    return null;
  } catch (error) {
    console.error('Error parsing YouTube URL:', error);
    return null;
  }
}

/**
 * Validates if a string is a valid YouTube video ID
 */
export function isValidVideoId(id: string): boolean {
  return /^[a-zA-Z0-9_-]{11}$/.test(id);
}

/**
 * Gets video thumbnail URL from video ID
 * @param videoId - The YouTube video ID
 * @param quality - Thumbnail quality (default, mq, hq, sd, maxres)
 */
export function getVideoThumbnail(videoId: string, quality: 'default' | 'mq' | 'hq' | 'sd' | 'maxres' = 'maxres'): string {
  return `https://img.youtube.com/vi/${videoId}/${quality}default.jpg`;
}

/**
 * Formats YouTube URL to standard watch URL
 */
export function formatVideoUrl(videoId: string): string {
  return `https://www.youtube.com/watch?v=${videoId}`;
}

/**
 * Examples of supported URL formats:
 * 
 * Regular URLs:
 * - https://www.youtube.com/watch?v=dQw4w9WgXcQ
 * - https://youtube.com/watch?v=dQw4w9WgXcQ
 * 
 * Live URLs:
 * - https://www.youtube.com/live/SKBG1sqdyIU?si=sQEoz2V7f3HrpfMs
 * - https://youtube.com/live/SKBG1sqdyIU
 * 
 * Short URLs:
 * - https://youtu.be/dQw4w9WgXcQ
 * 
 * With Parameters:
 * - https://www.youtube.com/watch?v=dQw4w9WgXcQ&feature=featured
 * - https://youtu.be/dQw4w9WgXcQ?t=123
 * 
 * Embedded:
 * - https://www.youtube.com/embed/dQw4w9WgXcQ
 * 
 * Short Form:
 * - https://www.youtube.com/v/dQw4w9WgXcQ
 * 
 * Shorts:
 * - https://youtube.com/shorts/dQw4w9WgXcQ
 * 
 * Mobile:
 * - https://m.youtube.com/watch?v=dQw4w9WgXcQ
 */