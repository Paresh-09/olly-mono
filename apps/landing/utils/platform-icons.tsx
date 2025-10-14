// utils/platform-icons.tsx
import type { LucideIcon } from 'lucide-react';
import {
  Facebook,
  Twitter,
  Instagram,
  Github,
  Linkedin,
  Youtube,
  Twitch,
  Globe,
  Music,
  Camera,
  MessageCircle,
  Share2,
  Video,
  Book,
  Newspaper,
  Gamepad,
  Code,
  Mail,
  Image as ImageIcon,
  Users,
  Link,
  Coffee,
  Briefcase,
  Pencil,
  Radio
} from 'lucide-react';

export interface PlatformConfig {
  name: string;
  Icon: LucideIcon;
  color: string;
}

export const platformConfigs: Record<string, PlatformConfig> = {
  'Facebook': { 
    name: 'Facebook', 
    Icon: Facebook, 
    color: 'text-blue-600' 
  },
  'Twitter': { 
    name: 'Twitter', 
    Icon: Twitter, 
    color: 'text-sky-500' 
  },
  'Instagram': { 
    name: 'Instagram', 
    Icon: Instagram, 
    color: 'text-pink-600' 
  },
  'GitHub': { 
    name: 'GitHub', 
    Icon: Github, 
    color: 'text-gray-900' 
  },
  'LinkedIn': { 
    name: 'LinkedIn', 
    Icon: Linkedin, 
    color: 'text-blue-700' 
  },
  'YouTube': { 
    name: 'YouTube', 
    Icon: Youtube, 
    color: 'text-red-600' 
  },
  'Twitch': { 
    name: 'Twitch', 
    Icon: Twitch, 
    color: 'text-purple-600' 
  },
  'Medium': { 
    name: 'Medium', 
    Icon: Book, 
    color: 'text-gray-800' 
  },
  'Pinterest': { 
    name: 'Pinterest', 
    Icon: ImageIcon, 
    color: 'text-red-700' 
  },
  'Reddit': { 
    name: 'Reddit', 
    Icon: MessageCircle, 
    color: 'text-orange-600' 
  },
  'TikTok': { 
    name: 'TikTok', 
    Icon: Video, 
    color: 'text-black' 
  },
  'SoundCloud': { 
    name: 'SoundCloud', 
    Icon: Music, 
    color: 'text-orange-500' 
  },
  'Behance': { 
    name: 'Behance', 
    Icon: Camera, 
    color: 'text-blue-800' 
  },
  'Flickr': { 
    name: 'Flickr', 
    Icon: Camera, 
    color: 'text-pink-500' 
  },
  'Spotify': { 
    name: 'Spotify', 
    Icon: Music, 
    color: 'text-green-600' 
  },
  'DeviantArt': { 
    name: 'DeviantArt', 
    Icon: Pencil, 
    color: 'text-green-700' 
  },
  'Tumblr': { 
    name: 'Tumblr', 
    Icon: Share2, 
    color: 'text-blue-900' 
  },
  'Stack Overflow': {
    name: 'Stack Overflow',
    Icon: Code,
    color: 'text-orange-500'
  },
  'GitLab': {
    name: 'GitLab',
    Icon: Code,
    color: 'text-orange-600'
  },
  'Bitbucket': {
    name: 'Bitbucket',
    Icon: Code,
    color: 'text-blue-500'
  },
  'Steam': {
    name: 'Steam',
    Icon: Gamepad,
    color: 'text-gray-800'
  },
  'Vimeo': {
    name: 'Vimeo',
    Icon: Video,
    color: 'text-blue-600'
  },
  'WordPress': {
    name: 'WordPress',
    Icon: Book,
    color: 'text-blue-700'
  },
  'Patreon': {
    name: 'Patreon',
    Icon: Coffee,
    color: 'text-orange-600'
  },
  'Substack': {
    name: 'Substack',
    Icon: Newspaper,
    color: 'text-green-700'
  },
  'Buy Me a Coffee': {
    name: 'Buy Me a Coffee',
    Icon: Coffee,
    color: 'text-yellow-600'
  },
  'Ko-fi': {
    name: 'Ko-fi',
    Icon: Coffee,
    color: 'text-blue-500'
  },
  'Mastodon': {
    name: 'Mastodon',
    Icon: Share2,
    color: 'text-purple-600'
  },
  'Threads': {
    name: 'Threads',
    Icon: MessageCircle,
    color: 'text-black'
  },
  'Discord': {
    name: 'Discord',
    Icon: MessageCircle,
    color: 'text-indigo-600'
  },
  'Telegram': {
    name: 'Telegram',
    Icon: MessageCircle,
    color: 'text-blue-500'
  },
  'WhatsApp': {
    name: 'WhatsApp',
    Icon: MessageCircle,
    color: 'text-green-500'
  },
  'WeChat': {
    name: 'WeChat',
    Icon: MessageCircle,
    color: 'text-green-600'
  },
  'Slack': {
    name: 'Slack',
    Icon: MessageCircle,
    color: 'text-purple-700'
  },
  'Dribbble': {
    name: 'Dribbble',
    Icon: ImageIcon,
    color: 'text-pink-600'
  },
  'Last.fm': {
    name: 'Last.fm',
    Icon: Music,
    color: 'text-red-600'
  },
  'Bandcamp': {
    name: 'Bandcamp',
    Icon: Music,
    color: 'text-blue-800'
  },
  'Apple Music': {
    name: 'Apple Music',
    Icon: Music,
    color: 'text-pink-500'
  },
  'Deezer': {
    name: 'Deezer',
    Icon: Music,
    color: 'text-purple-600'
  },
  'About.me': {
    name: 'About.me',
    Icon: Users,
    color: 'text-gray-800'
  },
  'Linktree': {
    name: 'Linktree',
    Icon: Link,
    color: 'text-green-500'
  },
  'AngelList': {
    name: 'AngelList',
    Icon: Briefcase,
    color: 'text-gray-700'
  },
  'Product Hunt': {
    name: 'Product Hunt',
    Icon: Briefcase,
    color: 'text-orange-600'
  },
  'Hashnode': {
    name: 'Hashnode',
    Icon: Book,
    color: 'text-blue-600'
  },
  'Dev.to': {
    name: 'Dev.to',
    Icon: Code,
    color: 'text-black'
  },
  'CodePen': {
    name: 'CodePen',
    Icon: Code,
    color: 'text-gray-900'
  }
} as const;

export const defaultPlatformConfig: PlatformConfig = {
  name: 'Unknown Platform',
  Icon: Globe,
  color: 'text-gray-600'
};

// Helper function to get platform config
export const getPlatformConfig = (platform: string): PlatformConfig => {
  return platformConfigs[platform] || defaultPlatformConfig;
};