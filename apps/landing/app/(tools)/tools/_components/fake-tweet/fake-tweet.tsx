'use client'

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { Card } from '@repo/ui/components/ui/card';
import { Input } from '@repo/ui/components/ui/input';
import { Button } from '@repo/ui/components/ui/button';
import { Textarea } from '@repo/ui/components/ui/textarea';
import html2canvas from 'html2canvas';

const defaultProfileImage = '/pf.png';

const FakeTweet: React.FC = () => {
  const [name, setName] = useState('Name');
  const [username, setUsername] = useState('username');
  const [profileImage, setProfileImage] = useState<string>(defaultProfileImage);
  const [message, setMessage] = useState('Generate awesome tweet images');
  const [tweetImage, setTweetImage] = useState<string>('');
  const [tweetTime, setTweetTime] = useState('4:34 PM');
  const [tweetDate, setTweetDate] = useState('Apr 29, 2025');
  const [client, setClient] = useState('Twitter Web App');
  const tweetRef = useRef<HTMLDivElement>(null);
  const [isVerified, setIsVerified] = useState(false);
  const [metrics, setMetrics] = useState({
    replies: '791',
    retweets: '534',
    likes: '16K',
    impressions: '1.3M'
  });
  
  const handleProfileImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) {
          setProfileImage(ev.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleTweetImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) {
          setTweetImage(ev.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleReset = () => {
    setName('Name');
    setUsername('username');
    setProfileImage(defaultProfileImage);
    setMessage('Generate awesome tweet images');
    setTweetImage('');
    setTweetTime('4:34 PM');
    setTweetDate('Apr 29, 2025');
    setClient('Twitter Web App');
    setIsVerified(false);
    setMetrics({
      replies: '791',
      retweets: '534',
      likes: '16K',
      impressions: '1.3M'
    });
  };

  const handleDownload = async () => {
    if (!tweetRef.current) return;
    
    try {
      const canvas = await html2canvas(tweetRef.current);
      const url = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `tweet-mockup-olly.social.png`;
      link.href = url;
      link.click();
    } catch (error) {
      console.error('Error downloading tweet:', error);
    }
  };

  return (
    <div className="grid md:grid-cols-2 gap-6 p-4">
      {/* Details Section */}
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-6">Details</h2>
        
        <div className="space-y-4">
          <div className="flex gap-4">
            <Button onClick={() => document.getElementById('profileUpload')?.click()}>
              Upload Profile Picture
            </Button>
            <input
              id="profileUpload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleProfileImageUpload}
            />
            <Button variant="outline" onClick={handleReset}>Reset</Button>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium">Name</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={50}
              placeholder="Name"
            />
            <div className="text-sm text-gray-500">{name.length}/50 characters</div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium">Username</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2">@</span>
              <Input
                value={username}
                onChange={(e) => setUsername(e.target.value.replace(/[^a-zA-Z0-9_]/g, ''))}
                maxLength={15}
                className="pl-7"
                placeholder="username"
              />
            </div>
            <div className="flex items-center gap-2 mt-1">
              <input
                type="checkbox"
                id="verified"
                checked={isVerified}
                onChange={(e) => setIsVerified(e.target.checked)}
                className="rounded border-gray-300"
              />
              <label htmlFor="verified" className="text-sm text-gray-600">Show verification badge</label>
            </div>
            <div className="text-sm text-gray-500">
              {username.length}/15 characters. Only numbers, letters or _ characters
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium">Message</label>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              maxLength={280}
              placeholder="What's happening?"
              className="resize-none"
              rows={4}
            />
            <div className="text-sm text-gray-500">{message.length}/280 characters</div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium">Tweet Image (Optional)</label>
            <Button onClick={() => document.getElementById('tweetImageUpload')?.click()} variant="outline" className="w-full">
              {tweetImage ? 'Change Image' : 'Add Image'}
            </Button>
            <input
              id="tweetImageUpload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleTweetImageUpload}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium">Time</label>
              <Input
                value={tweetTime}
                onChange={(e) => setTweetTime(e.target.value)}
                placeholder="4:34 PM"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium">Date</label>
              <Input
                value={tweetDate}
                onChange={(e) => setTweetDate(e.target.value)}
                placeholder="Apr 29, 2025"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium">Client</label>
            <Input
              value={client}
              onChange={(e) => setClient(e.target.value)}
              placeholder="Twitter Web App"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium">Engagement Metrics</label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-500">Replies</label>
                <Input
                  type="text"
                  value={metrics.replies}
                  onChange={(e) => setMetrics(m => ({ ...m, replies: e.target.value }))}
                  placeholder="791"
                />
              </div>
              <div>
                <label className="text-sm text-gray-500">Retweets</label>
                <Input
                  type="text"
                  value={metrics.retweets}
                  onChange={(e) => setMetrics(m => ({ ...m, retweets: e.target.value }))}
                  placeholder="534"
                />
              </div>
              <div>
                <label className="text-sm text-gray-500">Likes</label>
                <Input
                  type="text"
                  value={metrics.likes}
                  onChange={(e) => setMetrics(m => ({ ...m, likes: e.target.value }))}
                  placeholder="16K"
                />
              </div>
              <div>
                <label className="text-sm text-gray-500">Impressions</label>
                <Input
                  type="text"
                  value={metrics.impressions}
                  onChange={(e) => setMetrics(m => ({ ...m, impressions: e.target.value }))}
                  placeholder="1.3M"
                />
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Preview Section */}
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-6">Preview</h2>
        
        <div ref={tweetRef} className="bg-white p-4 rounded-xl border">
          <div className="flex items-start gap-3">
            <Image
              src={profileImage}
              alt="Profile"
              width={48}
              height={48}
              className="rounded-full"
            />
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-1">
                    <span className="font-bold hover:underline cursor-pointer">{name}</span>
                    {isVerified && (
                      <svg viewBox="0 0 24 24" className="w-5 h-5 text-blue-500 fill-current">
                        <path d="M22.5 12.5c0-1.58-.875-2.95-2.148-3.6.154-.435.238-.905.238-1.4 0-2.21-1.71-3.998-3.818-3.998-.47 0-.92.084-1.336.25C14.818 2.415 13.51 1.5 12 1.5s-2.816.917-3.437 2.25c-.415-.165-.866-.25-1.336-.25-2.11 0-3.818 1.79-3.818 4 0 .494.083.964.237 1.4-1.272.65-2.147 2.018-2.147 3.6 0 1.495.782 2.798 1.942 3.486-.02.17-.032.34-.032.514 0 2.21 1.708 4 3.818 4 .47 0 .92-.086 1.335-.25.62 1.334 1.926 2.25 3.437 2.25 1.512 0 2.818-.916 3.437-2.25.415.163.865.248 1.336.248 2.11 0 3.818-1.79 3.818-4 0-.174-.012-.344-.033-.513 1.158-.687 1.943-1.99 1.943-3.484zm-6.616-3.334l-4.334 6.5c-.145.217-.382.334-.625.334-.143 0-.288-.04-.416-.126l-.115-.094-2.415-2.415c-.293-.293-.293-.768 0-1.06s.768-.294 1.06 0l1.77 1.767 3.825-5.74c.23-.345.696-.436 1.04-.207.346.23.44.696.21 1.04z" />
                      </svg>
                    )}
                  </div>
                  <div className="text-gray-500">@{username}</div>
                </div>
                <button className="text-gray-500 hover:text-gray-600">
                  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
                    <path d="M3 12c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2-2-.9-2-2zm9 2c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm7 0c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z" />
                  </svg>
                </button>
              </div>
              
              <div className="mt-3">{message}</div>
              
              {tweetImage && (
                <div className="mt-3 rounded-xl overflow-hidden">
                  <Image src={tweetImage} alt="Tweet" width={500} height={280} className="w-full" />
                </div>
              )}
              
              <div className="text-gray-500 text-sm mt-2">{tweetTime} · {tweetDate} · {client}</div>
              
              <div className="flex items-center gap-6 mt-3">
                <button className="group flex items-center text-gray-500 hover:text-blue-500">
                  <div className="w-5 h-5 flex items-center justify-center">
                    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
                      <path d="M14.046 2.242l-4.148-.01h-.002c-4.374 0-7.8 3.427-7.8 7.802 0 4.098 3.186 7.206 7.465 7.37v3.828c0 .108.045.286.12.403.142.225.384.347.632.347.138 0 .277-.038.402-.118.264-.168 6.473-4.14 8.088-5.506 1.902-1.61 3.04-3.97 3.043-6.312v-.017c-.006-4.368-3.43-7.788-7.8-7.79zm3.787 12.972c-1.134.96-4.862 3.405-6.772 4.643V16.67c0-.414-.334-.75-.75-.75h-.395c-3.66 0-6.318-2.476-6.318-5.886 0-3.534 2.768-6.302 6.3-6.302l4.147.01h.002c3.532 0 6.3 2.766 6.302 6.296-.003 1.91-.942 3.844-2.514 5.176z"/>
                    </svg>
                  </div>
                  <span className="ml-2">{metrics.replies}</span>
                </button>
                <button className="group flex items-center text-gray-500 hover:text-green-500">
                  <div className="w-5 h-5 flex items-center justify-center">
                    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
                      <path d="M23.77 15.67c-.292-.293-.767-.293-1.06 0l-2.22 2.22V7.65c0-2.068-1.683-3.75-3.75-3.75h-5.85c-.414 0-.75.336-.75.75s.336.75.75.75h5.85c1.24 0 2.25 1.01 2.25 2.25v10.24l-2.22-2.22c-.293-.293-.768-.293-1.06 0s-.294.768 0 1.06l3.5 3.5c.145.147.337.22.53.22s.383-.072.53-.22l3.5-3.5c.294-.292.294-.767 0-1.06zm-10.66 3.28H7.26c-1.24 0-2.25-1.01-2.25-2.25V6.46l2.22 2.22c.148.147.34.22.532.22s.384-.073.53-.22c.293-.293.293-.768 0-1.06l-3.5-3.5c-.293-.294-.768-.294-1.06 0l-3.5 3.5c-.294.292-.294.767 0 1.06s.767.293 1.06 0l2.22-2.22V16.7c0 2.068 1.683 3.75 3.75 3.75h5.85c.414 0 .75-.336.75-.75s-.337-.75-.75-.75z"/>
                    </svg>
                  </div>
                  <span className="ml-2">{metrics.retweets}</span>
                </button>
                <button className="group flex items-center text-gray-500 hover:text-red-500">
                  <div className="w-5 h-5 flex items-center justify-center">
                    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
                      <path d="M12 21.638h-.014C9.403 21.59 1.95 14.856 1.95 8.478c0-3.064 2.525-5.754 5.403-5.754 2.29 0 3.83 1.58 4.646 2.73.813-1.148 2.353-2.73 4.644-2.73 2.88 0 5.404 2.69 5.404 5.755 0 6.376-7.454 13.11-10.037 13.157H12zM7.354 4.225c-2.08 0-3.903 1.988-3.903 4.255 0 5.74 7.035 11.596 8.55 11.658 1.518-.062 8.55-5.917 8.55-11.658 0-2.267-1.822-4.255-3.902-4.255-2.528 0-3.94 2.936-3.952 2.965-.23.562-1.156.562-1.387 0-.015-.03-1.426-2.965-3.955-2.965z"/>
                    </svg>
                  </div>
                  <span className="ml-2">{metrics.likes}</span>
                </button>
                <button className="group flex items-center text-gray-500 hover:text-blue-500">
                  <div className="w-5 h-5 flex items-center justify-center">
                    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
                      <path d="M8.75 21V3h2v18h-2zM18 21V8.5h2V21h-2zM4 21l.004-10h2L6 21H4zm9.248 0v-7h2v7h-2z" />
                    </svg>
                  </div>
                  <span className="ml-2">{metrics.impressions}</span>
                </button>
                <button className="group flex items-center text-gray-500 hover:text-blue-500">
                  <div className="w-5 h-5 flex items-center justify-center">
                    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
                      <path d="M17.53 7.47l-5-5c-.293-.293-.768-.293-1.06 0l-5 5c-.294.293-.294.768 0 1.06s.767.294 1.06 0l3.72-3.72V15c0 .414.336.75.75.75s.75-.336.75-.75V4.81l3.72 3.72c.146.147.338.22.53.22s.384-.072.53-.22c.293-.293.293-.767 0-1.06z"/>
                      <path d="M19.708 21.944H4.292C3.028 21.944 2 20.916 2 19.652V14c0-.414.336-.75.75-.75s.75.336.75.75v5.652c0 .437.355.792.792.792h15.416c.437 0 .792-.355.792-.792V14c0-.414.336-.75.75-.75s.75.336.75.75v5.652c0 1.264-1.028 2.292-2.292 2.292z"/>
                    </svg>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <Button className="w-full mt-6" onClick={handleDownload}>
          Download
        </Button>
      </Card>
    </div>
  );
};

export default FakeTweet; 