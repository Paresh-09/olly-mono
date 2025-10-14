"use client";

import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { Button } from '@repo/ui/components/ui/button';
import { Loader2, RefreshCw, Calendar, User, ExternalLink, CheckCircle2, AlertCircle, Clock, Search } from 'lucide-react';
import { toast } from '@repo/ui/hooks/use-toast';
import { ProfileLink } from '../../_components/sherlock/profile-links';

interface SearchResult {
  platform: string;
  url: string;
}

interface Job {
  id: string;
  username: string;
  status: string;
  results: SearchResult[];
  createdAt: string;
}

// Platform groups (24 platforms each)
const platformGroups = [
  // Social Media
  ['Facebook', 'Twitter', 'Instagram', 'LinkedIn', 'TikTok', 'Snapchat', 'Pinterest', 'Tumblr',
    'Reddit', 'YouTube', 'Discord', 'Telegram', 'WhatsApp', 'Signal', 'WeChat', 'Line',
    'Viber', 'Kik', 'Skype', 'Marco Polo', 'Clubhouse', 'BeReal', 'VSCO', 'Flickr'],

  // Professional & Development
  ['GitHub', 'GitLab', 'Bitbucket', 'Stack Overflow', 'CodePen', 'Replit', 'Figma', 'Dribbble',
    'Behance', 'Medium', 'Dev.to', 'Hashnode', 'CodeSandbox', 'Observable', 'Glitch', 'Heroku',
    'Vercel', 'Netlify', 'AngelList', 'ProductHunt', 'Indie Hackers', 'HackerNews', 'Keybase', 'Mastodon'],

  // Entertainment & Gaming
  ['Steam', 'Twitch', 'Discord', 'Xbox Live', 'PlayStation', 'Epic Games', 'Battle.net', 'Origin',
    'Uplay', 'GOG', 'Itch.io', 'GameJolt', 'Newgrounds', 'Kongregate', 'Armor Games', 'Miniclip',
    'Roblox', 'Minecraft', 'Fortnite', 'League of Legends', 'Valorant', 'CS:GO', 'Dota 2', 'Overwatch'],

  // Creative & Content
  ['DeviantArt', 'ArtStation', 'Pixiv', 'Unsplash', '500px', 'Shutterstock', 'Getty Images', 'Adobe Stock',
    'Canva', 'Sketch', 'InVision', 'Framer', 'Webflow', 'Squarespace', 'Wix', 'WordPress',
    'Blogger', 'Ghost', 'Substack', 'Patreon', 'Ko-fi', 'Buy Me Coffee', 'Gumroad', 'Etsy'],

  // Music & Audio
  ['Spotify', 'Apple Music', 'SoundCloud', 'Bandcamp', 'Last.fm', 'Deezer', 'Tidal', 'Amazon Music',
    'YouTube Music', 'Pandora', 'iHeartRadio', 'TuneIn', 'Mixcloud', 'ReverbNation', 'DistroKid', 'CD Baby',
    'Audiomack', 'Datpiff', 'Spinrilla', 'Genius', 'LyricFind', 'Musixmatch', 'Shazam', 'Song Kick'],

  // Business & Finance
  ['AngelList', 'Crunchbase', 'F6S', 'Xing', 'Meetup', 'Eventbrite', 'Facebook Events', 'All Events',
    'Foursquare', 'Yelp', 'Google My Business', 'TripAdvisor', 'Booking.com', 'Airbnb', 'Uber', 'Lyft',
    'DoorDash', 'Grubhub', 'Postmates', 'Seamless', 'Zomato', 'OpenTable', 'Resy', 'Tock'],

  // Learning & Knowledge
  ['Coursera', 'Udemy', 'edX', 'Khan Academy', 'Skillshare', 'MasterClass', 'Pluralsight', 'LinkedIn Learning',
    'Udacity', 'FutureLearn', 'Codecademy', 'FreeCodeCamp', 'Duolingo', 'Babbel', 'Rosetta Stone', 'Memrise',
    'Quizlet', 'Anki', 'Goodreads', 'LibraryThing', 'StoryGraph', 'BookBub', 'Wattpad', 'Archive of Our Own'],

  // Lifestyle & Shopping
  ['Amazon', 'eBay', 'Etsy', 'Depop', 'Poshmark', 'Mercari', 'Vinted', 'ThredUp',
    'StockX', 'GOAT', 'Grailed', 'Vestiaire', 'The RealReal', 'Fashionphile', 'Rebag', 'Tradesy',
    'Pinterest', 'Houzz', 'Zillow', 'Trulia', 'Realtor.com', 'Apartments.com', 'Rent.com', 'PadMapper']
];

const allPlatforms = platformGroups.flat();

export default function JobDetails() {
  const params = useParams();
  const searchParams = useSearchParams();
  const [job, setJob] = useState<Job | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentGroupIndex, setCurrentGroupIndex] = useState(0);
  const [currentPlatformInGroup, setCurrentPlatformInGroup] = useState(0);
  const [searchProgress, setSearchProgress] = useState(0);
  const [completedPlatforms, setCompletedPlatforms] = useState(0);

  const id = params?.id || searchParams.get('id');

  const fetchJob = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/sherlock/jobs/${id}`);
      const data = await response.json();
      setJob(data.job);

      if (data.job?.status === 'PENDING' || data.job?.status === 'PROCESSING') {
        setTimeout(fetchJob, 10000);
      }
    } catch (error) {
      console.error('Fetch error:', error);
      toast({ title: "Error", description: "Failed to fetch job details" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefetch = async () => {
    try {
      const response = await fetch(`/tools/sherlock/${id}`, {
        method: 'POST'
      });
      if (!response.ok) throw new Error('Failed to refetch');
      fetchJob();
      toast({ title: "Success", description: "Job refetch initiated" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to refetch job" });
    }
  };

  useEffect(() => {
    if (id) fetchJob();
  }, [id]);

  // Initialize progress to 0 when job is pending/processing
  useEffect(() => {
    if (job?.status === 'PENDING' || job?.status === 'PROCESSING') {
      // Reset to starting state
      setCurrentGroupIndex(0);
      setCurrentPlatformInGroup(0);
      setCompletedPlatforms(0);
      setSearchProgress(0);
    } else if (job?.status === 'COMPLETED') {
      setSearchProgress(100);
    }
  }, [job?.status]);

  // Simulate platform searching progress - much slower for 15-30 minutes
  useEffect(() => {
    if (job?.status === 'PENDING' || job?.status === 'PROCESSING') {
      const interval = setInterval(() => {
        setCurrentPlatformInGroup(prev => {
          const currentGroup = platformGroups[currentGroupIndex];
          if (!currentGroup) return prev;

          if (prev < currentGroup.length - 1) {
            // Move to next platform in current group
            const newCompleted = completedPlatforms + 1;
            setCompletedPlatforms(newCompleted);
            setSearchProgress((newCompleted / allPlatforms.length) * 100);
            return prev + 1;
          } else {
            // Move to next group
            if (currentGroupIndex < platformGroups.length - 1) {
              setCurrentGroupIndex(currentGroupIndex + 1);
              const newCompleted = completedPlatforms + 1;
              setCompletedPlatforms(newCompleted);
              setSearchProgress((newCompleted / allPlatforms.length) * 100);
              return 0;
            } else {
              // All groups completed
              setSearchProgress(100);
              return prev;
            }
          }
        });
      }, 8000); // Change platform every 8 seconds (much slower)

      return () => clearInterval(interval);
    }
  }, [job?.status, currentGroupIndex, completedPlatforms]);

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return {
          icon: CheckCircle2,
          color: 'bg-emerald-500',
          textColor: 'text-emerald-50',
          bgColor: 'bg-emerald-50',
          borderColor: 'border-emerald-200'
        };
      case 'FAILED':
        return {
          icon: AlertCircle,
          color: 'bg-red-500',
          textColor: 'text-red-50',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200'
        };
      default:
        return {
          icon: Clock,
          color: 'bg-amber-500',
          textColor: 'text-amber-50',
          bgColor: 'bg-amber-50',
          borderColor: 'border-amber-200'
        };
    }
  };

  if (!job) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="bg-white border border-neutral-200 rounded-2xl p-8 flex flex-col items-center gap-4">
            <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center">
              <Loader2 className="h-8 w-8 text-neutral-600 animate-spin" />
            </div>
            <p className="text-neutral-600 font-medium">Loading job details...</p>
          </div>
        </div>
      </div>
    );
  }

  const statusConfig = getStatusConfig(job.status);
  const StatusIcon = statusConfig.icon;

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">

        {/* Header */}
        <div className="mb-16">
          <h1 className="text-5xl font-bold text-neutral-900 mb-4 tracking-tight">Search Results</h1>
        </div>

        <div className="space-y-8">
          {/* Header Card */}
          <div className="bg-white border border-neutral-200 rounded-2xl p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-neutral-100 rounded-xl flex items-center justify-center">
                  <User className="h-6 w-6 text-neutral-700" />
                </div>
                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900">
                    {job.username}
                  </h2>
                  <div className="flex items-center gap-2 mt-2">
                    <Calendar className="h-4 w-4 text-neutral-500" />
                    <span className="text-neutral-500 text-sm">
                      {new Date(job.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className={`
                  flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm
                  ${statusConfig.color === 'bg-emerald-500' ? 'bg-emerald-100 text-emerald-700' :
                    statusConfig.color === 'bg-red-500' ? 'bg-red-100 text-red-700' :
                      'bg-amber-100 text-amber-700'}
                `}>
                  <StatusIcon className="h-4 w-4" />
                  {job.status.toLowerCase()}
                </div>

                {(job.status === 'PENDING' || job.status === 'PROCESSING') && (
                  <Button
                    onClick={handleRefetch}
                    disabled={isLoading}
                    className="bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl"
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <RefreshCw className="h-4 w-4" />
                    )}
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Results Section */}
          {job.results?.length > 0 ? (
            <div className="bg-white border border-neutral-200 rounded-2xl p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-neutral-100 rounded-lg flex items-center justify-center">
                  <ExternalLink className="h-4 w-4 text-neutral-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-neutral-900">
                    Profile Results
                  </h2>
                  <p className="text-neutral-500 text-sm">
                    Found {job.results.length} profile{job.results.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {job.results.map((result) => (
                  <div
                    key={result.platform}
                    className="group p-4 bg-neutral-50 hover:bg-neutral-100 rounded-xl transition-all duration-200 hover:shadow-md border border-neutral-200/50"
                  >
                    <ProfileLink
                      platform={result.platform}
                      url={result.url}
                    />
                  </div>
                ))}
              </div>
            </div>
          ) : job.status === 'COMPLETED' ? (
            <div className="bg-white border border-neutral-200 rounded-2xl p-8 text-center">
              <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="h-8 w-8 text-neutral-400" />
              </div>
              <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                No Results Found
              </h3>
              <p className="text-neutral-500">
                No profiles were found for this username across the searched platforms.
              </p>
            </div>
          ) : (
            <div className="bg-white border border-neutral-200 rounded-2xl p-8">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="h-8 w-8 text-neutral-600 animate-pulse" />
                </div>
                <h3 className="text-2xl font-bold text-neutral-900 mb-2">
                  Search in Progress
                </h3>
                <p className="text-neutral-600 mb-4">
                  Searching across 200+ platforms. This takes 15-30 minutes.
                </p>
              </div>

              {/* Progress Bar */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-neutral-700">Overall Progress</span>
                  <span className="text-sm text-neutral-500">{Math.round(searchProgress)}%</span>
                </div>
                <div className="w-full bg-neutral-200 rounded-full h-2">
                  <div
                    className="bg-neutral-900 h-2 rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${searchProgress}%` }}
                  ></div>
                </div>

                {/* Current Platform */}
                <div className="bg-neutral-50 rounded-xl p-4 border border-neutral-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-neutral-900 rounded-full animate-pulse"></div>
                      <span className="text-sm font-medium text-neutral-700">
                        Currently searching: <span className="text-neutral-900">
                          {platformGroups[currentGroupIndex] ? platformGroups[currentGroupIndex][currentPlatformInGroup] : 'Loading...'}
                        </span>
                      </span>
                    </div>
                    <div className="text-xs text-neutral-500">
                      Group {currentGroupIndex + 1} of {platformGroups.length}
                    </div>
                  </div>
                </div>

                {/* Platform Grid - Current Group */}
                <div className="space-y-4 mt-6">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-neutral-900">
                      {currentGroupIndex === 0 && 'Social Media Platforms'}
                      {currentGroupIndex === 1 && 'Professional & Development'}
                      {currentGroupIndex === 2 && 'Entertainment & Gaming'}
                      {currentGroupIndex === 3 && 'Creative & Content'}
                      {currentGroupIndex === 4 && 'Music & Audio'}
                      {currentGroupIndex === 5 && 'Business & Finance'}
                      {currentGroupIndex === 6 && 'Learning & Knowledge'}
                      {currentGroupIndex === 7 && 'Lifestyle & Shopping'}
                    </h4>
                    <span className="text-xs text-neutral-500">
                      {completedPlatforms} / {allPlatforms.length} completed
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                    {platformGroups[currentGroupIndex]?.map((platform, index) => (
                      <div
                        key={platform}
                        className={`
                        px-3 py-2 rounded-lg text-xs font-medium text-center transition-all duration-500
                        ${index < currentPlatformInGroup
                            ? 'bg-emerald-100 text-emerald-700'
                            : index === currentPlatformInGroup
                              ? 'bg-neutral-900 text-white animate-pulse'
                              : 'bg-neutral-100 text-neutral-500'
                          }
                      `}
                      >
                        {platform}
                      </div>
                    ))}
                  </div>

                  {/* Completed Groups Indicator */}
                  {currentGroupIndex > 0 && (
                    <div className="text-xs text-neutral-600 bg-emerald-50 rounded-lg p-3 border border-emerald-200">
                      ✅ Completed: {currentGroupIndex} group{currentGroupIndex > 1 ? 's' : ''}
                      ({currentGroupIndex * 24} platforms)
                    </div>
                  )}
                </div>

                <p className="text-xs text-neutral-500 text-center mt-6">
                  Searching {allPlatforms.length} platforms across {platformGroups.length} categories. This process takes 15-30 minutes.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}