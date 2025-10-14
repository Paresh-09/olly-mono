import { defaultPlatformConfig, platformConfigs, type PlatformConfig } from '@/utils/platform-icons';
import { ExternalLink } from 'lucide-react';

interface ProfileLinkProps {
  platform: string;
  url: string;
}

export const ProfileLink = ({ platform, url }: ProfileLinkProps) => {
  // Clean up the platform string by removing common TLDs
  const cleanPlatform = platform.replace(/\.(com|net|org|ru|tv|fm|io)$/i, '');
  
  // Try to find a matching platform config by checking both full and clean names
  const findConfig = (): PlatformConfig => {
    // Check if we have an exact match in our configs
    const exactMatch = platformConfigs[cleanPlatform];
    if (exactMatch) return exactMatch;
    
    // Try to find a matching platform name (case-insensitive)
    const platformKey = Object.keys(platformConfigs).find(key => 
      key.toLowerCase() === cleanPlatform.toLowerCase()
    );
    if (platformKey) return platformConfigs[platformKey];
    
    // Return default config with custom name
    return {
      ...defaultPlatformConfig,
      name: cleanPlatform.charAt(0).toUpperCase() + cleanPlatform.slice(1)
    };
  };

  const config = findConfig();
  const { Icon, color, name } = config;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
    >
      <div className={color}>
        <Icon size={16} />
      </div>
      <span className="truncate">{name}</span>
      <ExternalLink className="h-4 w-4 ml-auto flex-shrink-0" />
    </a>
  );
};