import axios from 'axios';
interface VideoDetails {
  title: string;
  description?: string;
  thumbnailUrl: string;
  duration: number; // in seconds
  channel?: string;
  publishedAt?: string;
  viewCount?: string;
  likeCount?: string;
  categories?: string[];
  tags?: string[];
}

export class YouTubeVideo {
  /**
   * Get video details from YouTube API
   * @param videoId YouTube video ID
   * @returns Video details or null if not found
   */
  static async getVideoDetails(videoId: string): Promise<VideoDetails | null> {
    try {
      if (!process.env.YOUTUBE_API_KEY) {
        console.warn('YouTube API key not found. Using default thumbnail.');
        return null;
      }

      const response = await axios.get(
        `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&key=${process.env.YOUTUBE_API_KEY}&part=snippet,contentDetails,statistics`
      );

      if (!response.data.items || response.data.items.length === 0) {
        return null;
      }

      const video = response.data.items[0];
      const snippet = video.snippet;
      const contentDetails = video.contentDetails;
      const statistics = video.statistics;

      // Parse duration from ISO 8601 format (PT1H30M15S) to seconds
      const duration = parseDuration(contentDetails.duration);

      return {
        title: snippet.title,
        description: snippet.description,
        thumbnailUrl: snippet.thumbnails.maxres?.url || 
                     snippet.thumbnails.high?.url || 
                     `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
        duration,
        channel: snippet.channelTitle,
        publishedAt: snippet.publishedAt,
        viewCount: statistics?.viewCount,
        likeCount: statistics?.likeCount,
        categories: snippet.tags,
        tags: snippet.tags
      };
    } catch (error) {
      console.error('Error fetching YouTube video details:', error);
      return null;
    }
  }
}

/**
 * Parse ISO 8601 duration to seconds
 * @param duration Duration in ISO 8601 format (e.g., PT1H30M15S)
 * @returns Duration in seconds
 */
function parseDuration(duration: string): number {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  
  if (!match) return 0;
  
  const hours = parseInt(match[1] || '0');
  const minutes = parseInt(match[2] || '0');
  const seconds = parseInt(match[3] || '0');
  
  return hours * 3600 + minutes * 60 + seconds;
} 