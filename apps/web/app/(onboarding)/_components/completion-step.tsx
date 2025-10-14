import React from 'react';
import Image from 'next/image';
import { Button } from '@repo/ui/components/ui/button';
import { StepProps } from '@/types/onboarding';
import { Card } from '@repo/ui/components/ui/card';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

const FEATURED_SITES = [
  { name: 'LinkedIn', icon: '/icons/linkedin.svg', url: 'https://www.linkedin.com/posts/goyashy_ux-bootstrapping-startups-activity-7269215912203853824-atnn?utm_source=share&utm_medium=member_desktop&rcm=ACoAAB_Kob0B1XWEHBguh5MiwreSO_uebyhTWJ4' },
  { name: 'Twitter', icon: '/icons/twitter.svg', url: 'https://x.com/goyashy/status/1877375891338150201' },
  { name: 'YouTube', icon: '/icons/youtube.svg', url: 'https://youtu.be/MxcjPEyB6so' },
  { name: 'Instagram', icon: '/icons/instagram.svg', url: 'https://instagram.com' },
];

const ADDITIONAL_SITES = [
  { name: 'GitHub', url: 'https://github.com' },
  { name: 'Stack Overflow', url: 'https://stackoverflow.com' },
  { name: 'Reddit', url: 'https://reddit.com' },
  { name: 'Medium', url: 'https://medium.com' },
  { name: 'Substack', url: 'https://substack.com' },
  { name: 'Discord', url: 'https://discord.com' },
  { name: 'Slack', url: 'https://slack.com' },
  { name: 'Gmail', url: 'https://gmail.com' },
  { name: 'Google Docs', url: 'https://docs.google.com' },
  { name: 'Notion', url: 'https://notion.so' },
];

export default function CompletionStep({ onNext }: StepProps) {
  const router = useRouter();

  const handleSiteClick = (url: string) => {
    // Open the site in a new tab
    window.open(url, '_blank');
    // Redirect to dashboard
    router.push('/dashboard');
  };

  return (
    <div className="space-y-4">
      {/* Celebration GIF at the top */}
      <div className="flex justify-center mb-2">
        <div className="relative w-40 h-40">
          <Image
            src="/onboarding/celebration.gif"
            alt="Celebration"
            fill
            className="object-contain"
          />
        </div>
      </div>

      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">🎉 Try it out!</h2>
        <p className="text-muted-foreground text-sm">
          Open any post & click on the Comment Button to see a Comment Panel or Select any text to see Olly Popup on the right.
        </p>
      </div>

      {/* Featured sites with minimal icons in a single row */}
      <div className="grid grid-cols-4 gap-2">
        {FEATURED_SITES.map((site) => (
          <motion.div
            key={site.name}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
            onClick={() => handleSiteClick(site.url)}
          >
            <Card className="p-3 flex flex-col items-center justify-center hover:shadow-sm transition-shadow cursor-pointer">
              <div className="w-8 h-8 mb-1 relative">
                <Image
                  src={site.icon}
                  alt={site.name}
                  fill
                  className="object-contain"
                />
              </div>
              <span className="text-xs font-medium">{site.name}</span>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Additional supported sites in a more compact grid */}
      <div className="bg-muted/30 rounded-lg p-4">
        <h3 className="text-xs font-medium mb-2">Also supported on:</h3>
        <div className="grid grid-cols-5 gap-2">
          {ADDITIONAL_SITES.map((site) => (
            <div
              key={site.name}
              onClick={() => handleSiteClick(site.url)}
              className="text-xs text-muted-foreground bg-background rounded px-2 py-1.5 text-center cursor-pointer hover:bg-muted"
            >
              {site.name}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 