'use client'
import React, { useState, useEffect } from 'react';
import { Button } from '@repo/ui/components/ui/button';
import { Input } from '@repo/ui/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@repo/ui/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@repo/ui/components/ui/tabs';
import { AlertCircle, Copy, ExternalLink, Check, Youtube } from 'lucide-react';
import { Label } from '@repo/ui/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@repo/ui/components/ui/select';
import { Switch } from '@repo/ui/components/ui/switch';
import { Alert, AlertDescription } from '@repo/ui/components/ui/alert';
import { RadioGroup, RadioGroupItem } from '@repo/ui/components/ui/radio-group';
import { Textarea } from '@repo/ui/components/ui/textarea';
import Script from 'next/script';

interface ChannelData {
  id: string;
  logo?: string;
  title?: string;
}

const YoutubeSubscriptionButtonCreator: React.FC = () => {
  const [channelUrl, setChannelUrl] = useState<string>('');
  const [channelId, setChannelId] = useState<string>('');
  const [channelData, setChannelData] = useState<ChannelData | null>(null);
  const [buttonStyle, setButtonStyle] = useState<'default' | 'full' | 'basic'>('default');
  const [buttonLayout, setButtonLayout] = useState<'default' | 'full'>('default');
  const [buttonSize, setButtonSize] = useState<'default' | 'small' | 'large'>('default');
  const [buttonColor, setButtonColor] = useState<string>('#FF0000');
  const [buttonText, setButtonText] = useState<string>('Subscribe');
  const [showCount, setShowCount] = useState<boolean>(true);
  const [showLogo, setShowLogo] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [htmlCode, setHtmlCode] = useState<string>('');
  const [reactCode, setReactCode] = useState<string>('');
  const [isScriptLoaded, setIsScriptLoaded] = useState<boolean>(false);

  // Load YouTube API script
  useEffect(() => {
    // Check if script is already loaded
    if (document.querySelector('script[src="https://apis.google.com/js/platform.js"]')) {
      setIsScriptLoaded(true);
      return;
    }

    // Create script element
    const script = document.createElement('script');
    script.src = 'https://apis.google.com/js/platform.js';
    script.async = true;
    script.onload = () => {
      setIsScriptLoaded(true);
    };
    document.body.appendChild(script);

    // Cleanup
    return () => {
      // Only remove if it's the script we added
      const scriptElement = document.querySelector('script[src="https://apis.google.com/js/platform.js"]');
      if (scriptElement && scriptElement.getAttribute('data-added-by-component') === 'true') {
        document.body.removeChild(scriptElement);
      }
    };
  }, []);

  // Extract channel ID from URL
  const extractChannelId = async (url: string) => {
    try {
      // Reset error state
      setError(null);
      
      // Handle empty URL
      if (!url.trim()) {
        setError('Please enter a YouTube channel URL');
        return;
      }
      
      let extractedChannelId = '';
      let isUsername = false;
      
      // Handle URLs with channel ID format
      if (url.includes('youtube.com/channel/')) {
        const match = url.match(/youtube\.com\/channel\/([^?\/]+)/);
        if (match && match[1]) {
          extractedChannelId = match[1];
        }
      } 
      // Handle URLs with username format
      else if (url.includes('youtube.com/@')) {
        const match = url.match(/youtube\.com\/@([^?\/]+)/);
        if (match && match[1]) {
          // For username format, we'll use the username directly
          extractedChannelId = '@' + match[1];
          isUsername = true;
        }
      }
      // Handle URLs with user format
      else if (url.includes('youtube.com/user/')) {
        const match = url.match(/youtube\.com\/user\/([^?\/]+)/);
        if (match && match[1]) {
          // For user format, we'll use the username directly
          extractedChannelId = match[1];
          isUsername = true;
        }
      }
      // Handle direct @username format
      else if (url.startsWith('@')) {
        extractedChannelId = url;
        isUsername = true;
      }
      // Invalid URL format
      else {
        setError('Invalid YouTube channel URL format. Please use a valid channel URL.');
        return;
      }
      
      if (!extractedChannelId) {
        setError('Could not extract channel ID from the URL');
        return;
      }
      
      setChannelId(extractedChannelId);
      
      // Generate the subscription URL
      let subscriptionUrl = '';
      
      if (isUsername) {
        // For @username format
        subscriptionUrl = `https://www.youtube.com/${extractedChannelId}?sub_confirmation=1`;
      } else {
        // For channel ID format
        subscriptionUrl = `https://www.youtube.com/channel/${extractedChannelId}?sub_confirmation=1`;
      }
      
      setPreviewUrl(subscriptionUrl);

      // Try to fetch channel data
      try {
        // This would normally be a server-side API call to get channel data
        // For now, we'll just set the channel ID
        const channelDataObj: ChannelData = {
          id: extractedChannelId.startsWith('@') ? extractedChannelId.substring(1) : extractedChannelId,
          logo: `https://yt3.ggpht.com/ytc/AAUvwniG-oe9jIj-TP4N1ez8QRHlvLgCxjLPg8tNcw=s88-c-k-c0x00ffffff-no-rj`, // Placeholder logo
          title: "YouTube Channel"
        };
        
        setChannelData(channelDataObj);
      } catch (error) {
        console.error('Error fetching channel data:', error);
        // Still proceed with the channel ID we have
      }
      
      generateCode(subscriptionUrl, extractedChannelId);
      
    } catch (error) {
      console.error('Error extracting channel ID:', error);
      setError('Failed to process the YouTube channel URL');
    }
  };

  // Generate HTML and React code
  const generateCode = (subscriptionUrl: string, channelId: string) => {
    const cleanChannelId = channelId.startsWith('@') ? channelId.substring(1) : channelId;
    const countType = showCount ? 'default' : 'hidden';
    const layoutType = buttonLayout === 'full' ? 'full' : 'default';
    
    // Generate HTML code
    let html = '';
    
    if (buttonStyle === 'default') {
      // Default YouTube button with g-ytsubscribe
      if (showLogo) {
        html = `<div class="youtube-subscribe">
  <img src="https://yt3.ggpht.com/ytc/AAUvwniG-oe9jIj-TP4N1ez8QRHlvLgCxjLPg8tNcw=s88-c-k-c0x00ffffff-no-rj" alt="Channel Logo" class="channel-logo">
  <div class="g-ytsubscribe" data-channelid="${cleanChannelId}" data-layout="${layoutType}" data-count="${countType}"></div>
</div>
<script src="https://apis.google.com/js/platform.js"></script>`;
      } else {
        html = `<div class="g-ytsubscribe" data-channelid="${cleanChannelId}" data-layout="${layoutType}" data-count="${countType}"></div>
<script src="https://apis.google.com/js/platform.js"></script>`;
      }
    } else if (buttonStyle === 'full') {
      // Full custom button with image and link
      html = `<a href="${subscriptionUrl}" target="_blank" style="display: inline-block; text-decoration: none;">
  <div style="display: flex; align-items: center; background-color: ${buttonColor}; color: white; padding: ${buttonSize === 'small' ? '5px 10px' : buttonSize === 'large' ? '12px 20px' : '8px 15px'}; border-radius: 4px; font-family: Arial, sans-serif; font-size: ${buttonSize === 'small' ? '12px' : buttonSize === 'large' ? '18px' : '14px'};">
    <svg width="${buttonSize === 'small' ? '16' : buttonSize === 'large' ? '24' : '20'}" height="${buttonSize === 'small' ? '16' : buttonSize === 'large' ? '24' : '20'}" viewBox="0 0 24 24" fill="white" style="margin-right: 8px;">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
    </svg>
    ${buttonText}
  </div>
</a>`;
    } else {
      // Basic link
      html = `<a href="${subscriptionUrl}" target="_blank" style="color: ${buttonColor}; font-family: Arial, sans-serif; font-size: ${buttonSize === 'small' ? '12px' : buttonSize === 'large' ? '18px' : '14px'}; text-decoration: none;">
  ${buttonText}
</a>`;
    }
    
    setHtmlCode(html);
    
    // Generate React code
    let react = '';
    
    if (buttonStyle === 'default') {
      // Default YouTube button with g-ytsubscribe
      if (showLogo) {
        react = `// Make sure to include this in your HTML or layout:
// <script src="https://apis.google.com/js/platform.js"></script>

<div className="youtube-subscribe">
  <img 
    src="https://yt3.ggpht.com/ytc/AAUvwniG-oe9jIj-TP4N1ez8QRHlvLgCxjLPg8tNcw=s88-c-k-c0x00ffffff-no-rj" 
    alt="Channel Logo" 
    className="channel-logo" 
  />
  <div 
    className="g-ytsubscribe" 
    data-channelid="${cleanChannelId}" 
    data-layout="${layoutType}" 
    data-count="${countType}"
  />
</div>`;
      } else {
        react = `// Make sure to include this in your HTML or layout:
// <script src="https://apis.google.com/js/platform.js"></script>

<div 
  className="g-ytsubscribe" 
  data-channelid="${cleanChannelId}" 
  data-layout="${layoutType}" 
  data-count="${countType}"
/>`;
      }
    } else if (buttonStyle === 'full') {
      react = `<a href="${subscriptionUrl}" target="_blank" style={{
  display: 'inline-block',
  textDecoration: 'none'
}}>
  <div style={{
    display: 'flex',
    alignItems: 'center',
    backgroundColor: '${buttonColor}',
    color: 'white',
    padding: '${buttonSize === 'small' ? '5px 10px' : buttonSize === 'large' ? '12px 20px' : '8px 15px'}',
    borderRadius: '4px',
    fontFamily: 'Arial, sans-serif',
    fontSize: '${buttonSize === 'small' ? '12px' : buttonSize === 'large' ? '18px' : '14px'}'
  }}>
    <svg width="${buttonSize === 'small' ? '16' : buttonSize === 'large' ? '24' : '20'}" height="${buttonSize === 'small' ? '16' : buttonSize === 'large' ? '24' : '20'}" viewBox="0 0 24 24" fill="white" style={{ marginRight: '8px' }}>
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
    </svg>
    {buttonText}
  </div>
</a>`;
    } else {
      react = `<a 
  href="${subscriptionUrl}" 
  target="_blank" 
  style={{
    color: '${buttonColor}',
    fontFamily: 'Arial, sans-serif',
    fontSize: '${buttonSize === 'small' ? '12px' : buttonSize === 'large' ? '18px' : '14px'}',
    textDecoration: 'none'
  }}
>
  {buttonText}
</a>`;
    }
    
    setReactCode(react);
  };

  // Copy code to clipboard
  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // Handle URL input change
  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setChannelUrl(e.target.value);
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    extractChannelId(channelUrl);
  };

  // Update code when button style or options change
  useEffect(() => {
    if (previewUrl && channelId) {
      generateCode(previewUrl, channelId);
    }
  }, [buttonStyle, buttonLayout, buttonSize, buttonColor, buttonText, showCount, showLogo, previewUrl, channelId]);

  return (
    <div className="space-y-6">
      <Script src="https://apis.google.com/js/platform.js" strategy="lazyOnload" />
      
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Create YouTube Subscription Button</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="channel-url">YouTube Channel URL</Label>
              <div className="flex gap-2">
                <Input
                  id="channel-url"
                  placeholder="https://www.youtube.com/channel/UCrxaUCdOAT4sjsxYrUDaoZQ or https://www.youtube.com/@goyashy"
                  value={channelUrl}
                  onChange={handleUrlChange}
                  className="flex-1"
                />
                <Button type="submit">Generate</Button>
              </div>
              <p className="text-sm text-gray-500">
                Enter your YouTube channel URL or username (e.g., @username)
              </p>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {channelId && (
              <div className="space-y-6 pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label>Button Style</Label>
                      <RadioGroup
                        value={buttonStyle}
                        onValueChange={(value) => setButtonStyle(value as 'default' | 'full' | 'basic')}
                        className="flex flex-col space-y-2 mt-2"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="default" id="style-default" />
                          <Label htmlFor="style-default">Default YouTube Button</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="full" id="style-full" />
                          <Label htmlFor="style-full">Custom Button with YouTube Icon</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="basic" id="style-basic" />
                          <Label htmlFor="style-basic">Basic Text Link</Label>
                        </div>
                      </RadioGroup>
                    </div>

                    {buttonStyle === 'default' && (
                      <div>
                        <Label>Button Layout</Label>
                        <RadioGroup
                          value={buttonLayout}
                          onValueChange={(value) => setButtonLayout(value as 'default' | 'full')}
                          className="flex flex-col space-y-2 mt-2"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="default" id="layout-default" />
                            <Label htmlFor="layout-default">Default</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="full" id="layout-full" />
                            <Label htmlFor="layout-full">Full</Label>
                          </div>
                        </RadioGroup>
                      </div>
                    )}

                    {buttonStyle !== 'default' && (
                      <div>
                        <Label>Button Size</Label>
                        <Select
                          value={buttonSize}
                          onValueChange={(value) => setButtonSize(value as 'default' | 'small' | 'large')}
                        >
                          <SelectTrigger className="mt-2">
                            <SelectValue placeholder="Select size" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="small">Small</SelectItem>
                            <SelectItem value="default">Default</SelectItem>
                            <SelectItem value="large">Large</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {buttonStyle !== 'default' && (
                      <div>
                        <Label htmlFor="button-color">Button Color</Label>
                        <div className="flex items-center gap-2 mt-2">
                          <input
                            type="color"
                            id="button-color"
                            value={buttonColor}
                            onChange={(e) => setButtonColor(e.target.value)}
                            className="w-10 h-10 rounded cursor-pointer"
                          />
                          <Input
                            value={buttonColor}
                            onChange={(e) => setButtonColor(e.target.value)}
                            className="w-28"
                          />
                        </div>
                      </div>
                    )}

                    {buttonStyle !== 'default' && (
                      <div>
                        <Label htmlFor="button-text">Button Text</Label>
                        <Input
                          id="button-text"
                          value={buttonText}
                          onChange={(e) => setButtonText(e.target.value)}
                          className="mt-2"
                        />
                      </div>
                    )}

                    {buttonStyle === 'default' && (
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="show-count"
                          checked={showCount}
                          onCheckedChange={setShowCount}
                        />
                        <Label htmlFor="show-count">Show Subscriber Count</Label>
                      </div>
                    )}

                    {buttonStyle === 'default' && (
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="show-logo"
                          checked={showLogo}
                          onCheckedChange={setShowLogo}
                        />
                        <Label htmlFor="show-logo">Show Channel Logo</Label>
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label>Preview</Label>
                      <div className="mt-4 p-6 border rounded-md flex items-center justify-center bg-gray-50 min-h-[150px]">
                        {buttonStyle === 'default' ? (
                          <div className="youtube-subscribe">
                            {showLogo && (
                              <img 
                                src="https://yt3.ggpht.com/ytc/AAUvwniG-oe9jIj-TP4N1ez8QRHlvLgCxjLPg8tNcw=s88-c-k-c0x00ffffff-no-rj" 
                                alt="Channel Logo" 
                                className="channel-logo" 
                                style={{ width: '48px', height: '48px', borderRadius: '50%', marginRight: '10px' }}
                              />
                            )}
                            <div 
                              className="g-ytsubscribe" 
                              data-channelid={channelId.startsWith('@') ? channelId.substring(1) : channelId}
                              data-layout={buttonLayout}
                              data-count={showCount ? 'default' : 'hidden'}
                            />
                          </div>
                        ) : buttonStyle === 'full' ? (
                          <a href={previewUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', textDecoration: 'none' }}>
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              backgroundColor: buttonColor,
                              color: 'white',
                              padding: buttonSize === 'small' ? '5px 10px' : buttonSize === 'large' ? '12px 20px' : '8px 15px',
                              borderRadius: '4px',
                              fontFamily: 'Arial, sans-serif',
                              fontSize: buttonSize === 'small' ? '12px' : buttonSize === 'large' ? '18px' : '14px'
                            }}>
                              <svg width={buttonSize === 'small' ? '16' : buttonSize === 'large' ? '24' : '20'} height={buttonSize === 'small' ? '16' : buttonSize === 'large' ? '24' : '20'} viewBox="0 0 24 24" fill="white" style={{ marginRight: '8px' }}>
                                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                              </svg>
                              {buttonText}
                            </div>
                          </a>
                        ) : (
                          <a 
                            href={previewUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            style={{
                              color: buttonColor,
                              fontFamily: 'Arial, sans-serif',
                              fontSize: buttonSize === 'small' ? '12px' : buttonSize === 'large' ? '18px' : '14px',
                              textDecoration: 'none'
                            }}
                          >
                            {buttonText}
                          </a>
                        )}
                      </div>
                      <div className="mt-2 text-center">
                        <a 
                          href={previewUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:underline flex items-center justify-center gap-1"
                        >
                          Test Button <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    </div>
                  </div>
                </div>

                <Tabs defaultValue="html" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="html">HTML Code</TabsTrigger>
                    <TabsTrigger value="react">React Code</TabsTrigger>
                  </TabsList>
                  <TabsContent value="html" className="space-y-4">
                    <div className="relative">
                      <Textarea
                        value={htmlCode}
                        readOnly
                        className="font-mono text-sm h-[200px] resize-none"
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        className="absolute top-2 right-2"
                        onClick={() => copyToClipboard(htmlCode)}
                      >
                        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                    <p className="text-sm text-gray-500">
                      Copy this HTML code and paste it into your website where you want the subscribe button to appear.
                    </p>
                  </TabsContent>
                  <TabsContent value="react" className="space-y-4">
                    <div className="relative">
                      <Textarea
                        value={reactCode}
                        readOnly
                        className="font-mono text-sm h-[200px] resize-none"
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        className="absolute top-2 right-2"
                        onClick={() => copyToClipboard(reactCode)}
                      >
                        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                    <p className="text-sm text-gray-500">
                      Copy this React code and paste it into your React component where you want the subscribe button to appear.
                    </p>
                  </TabsContent>
                </Tabs>
              </div>
            )}
          </form>
        </CardContent>
      </Card>

      <style jsx global>{`
        .youtube-subscribe {
          display: flex;
          align-items: center;
        }
        .channel-logo {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          margin-right: 10px;
        }
      `}</style>
    </div>
  );
};

export default YoutubeSubscriptionButtonCreator; 