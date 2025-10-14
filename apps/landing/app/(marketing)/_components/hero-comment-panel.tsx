import React from 'react';
import { Avatar } from '@repo/ui/components/ui/avatar';
import { AvatarImage } from '@repo/ui/components/ui/avatar';
import { AvatarFallback } from '@repo/ui/components/ui/avatar';
import { MoreHorizontal, ThumbsUp, MessageSquare, Repeat2, Send } from 'lucide-react';
import CommentPanel from './comment-panel';

const HeroCommentPanel = () => {
  return (
    <div className="w-full bg-white rounded-xl shadow-md border border-gray-200/50 backdrop-blur-sm">
      {/* Post Header */}
      <div className="p-4 flex items-start justify-between">
        <div className="flex gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src="/avatars/olly-founder.jpg" alt="Olly Founder" />
            <AvatarFallback>OF</AvatarFallback>
          </Avatar>
          <div>
            <h4 className="font-semibold text-gray-900">Yash Soni</h4>
            <p className="text-xs text-gray-500">Founder @Olly.Social • 2d</p>
          </div>
        </div>
      </div>

      {/* Post Content */}
      <div className="px-4 pb-3">
        <p className="text-gray-900 text-sm leading-relaxed">
          🚀 Excited to introduce Olly.Social - your AI companion for LinkedIn growth!
          <br/><br/>
          As founders, we know maintaining LinkedIn presence while running a business is tough. That's why we built Olly - to help you engage authentically and grow your network.
          <br/><br/>
          Try commenting below to experience AI-powered engagement! 👇
        </p>
      </div>

      {/* Post Stats */}
      <div className="px-4 py-2 border-t border-gray-100">
        <div className="flex items-center gap-1 text-gray-500 text-xs">
          <ThumbsUp className="h-3 w-3 text-blue-600 fill-current" />
          <span>428</span>
          <span className="mx-1">•</span>
          <span>47 comments</span>
        </div>
      </div>

      {/* Comment Panel */}
      <div className="p-4 bg-gray-50/50 rounded-b-xl border-t border-gray-100">
        <CommentPanel />
      </div>
    </div>
  );
};

export default HeroCommentPanel; 