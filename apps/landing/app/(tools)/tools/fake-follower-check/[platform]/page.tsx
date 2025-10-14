import { Metadata } from 'next';
import FollowerCheckerPage from '../../_components/follower-checker/checker';

export async function generateMetadata(
  props: { 
    params: Promise<{ platform: string }> 
  }
): Promise<Metadata> {
  const params = await props.params;
  const platformNames = {
    instagram: 'Instagram',
    tiktok: 'TikTok',
    linkedin: 'LinkedIn'
  };

  const platformName = platformNames[params.platform as keyof typeof platformNames] || 'Social Media';

  return {
    title: `${platformName} Follower Authenticity Checker`,
    description: `Detect and analyze fake followers on your ${platformName} profile. Get comprehensive insights into your follower quality.`,
    openGraph: {
      title: `${platformName} Follower Authenticity Checker`,
      description: `Comprehensive analysis of your ${platformName} profile's follower authenticity`,
      type: 'website',
    },
    keywords: `${params.platform} followers, fake follower check, social media audit, follower authenticity, bot detection`
  };
}

// Fix: Make the default export function async and await params
export default async function Page(props: { 
  params: Promise<{ platform: string }> 
}) {
  const params = await props.params;
  return <FollowerCheckerPage platform={params.platform} />;
}