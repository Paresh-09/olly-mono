"use client";

import React, { useState } from 'react';
import { Button } from '@repo/ui/components/ui/button';
import { Smile, Image, Send, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface CommentOptionsPanelProps {
  onClose?: () => void;
  onCommentPosted?: () => void;
}

interface Comment {
  id: number;
  text: string;
  author: string;
  role: string;
  likes: number;
  replies: number;
  timestamp: string;
  isLiked?: boolean;
}

const CommentPanel: React.FC<CommentOptionsPanelProps> = ({ onClose, onCommentPosted }) => {
  const [commentText, setCommentText] = useState('');
  const [step, setStep] = useState<'quickReplies' | 'post' | 'done'>('quickReplies');
  const [hasSelectedQuickReply, setHasSelectedQuickReply] = useState(false);
  const [comments, setComments] = useState<Comment[]>([
    {
      id: 1,
      author: "Prime Estate 360",
      role: "2 followers",
      text: "founders juggling too much is a classic pitfall, for sure. what's your take on niche markets?",
      likes: 282,
      replies: 17,
      timestamp: "1m",
      isLiked: false
    }
  ]);

  const quickReplies = [
    {
      label: 'Congratulate',
      text: 'Congratulations on this amazing achievement! Your success is well-deserved.'
    },
    {
      label: 'Disagree',
      text: 'I respectfully disagree. While your points are interesting, I think there are other factors to consider.'
    },
    {
      label: 'Support',
      text: 'I fully support this perspective. It aligns well with what I\'ve observed in the industry.'
    },
    {
      label: 'Funny',
      text: 'This reminds me of a similar situation - except everything went hilariously wrong! 😄'
    },
    {
      label: 'Recommend',
      text: 'I highly recommend looking into this further. The potential impact could be significant.'
    },
    {
      label: 'Ask',
      text: 'Interesting perspective! Have you considered how this might affect smaller businesses?'
    },
    {
      label: 'Marketing Manager',
      text: 'From a marketing perspective, this could create some interesting opportunities for brand positioning.'
    },
    {
      label: 'AI Expert',
      text: 'As someone working in AI, I can confirm that these trends align with current technological capabilities.'
    }
  ];

  const handleQuickReply = (text: string) => {
    setCommentText(text);
    setHasSelectedQuickReply(true);
    setStep('post');
  };

  const handlePostComment = () => {
    if (commentText.trim()) {
      const newComment: Comment = {
        id: comments.length + 1,
        author: "You",
        role: "LinkedIn Member",
        text: commentText,
        likes: 0,
        replies: 0,
        timestamp: "Just now",
        isLiked: false
      };

      setComments([newComment, ...comments]);
      setCommentText('');
      setStep('done');

      if (onCommentPosted) {
        onCommentPosted();
      }
    }
  };

  const handleLikeComment = (commentId: number) => {
    setComments(comments.map(comment => {
      if (comment.id === commentId) {
        return {
          ...comment,
          likes: comment.isLiked ? comment.likes - 1 : comment.likes + 1,
          isLiked: !comment.isLiked
        };
      }
      return comment;
    }));
  };

  return (
    <div className="w-full bg-white rounded-lg">
      <div className="relative border border-gray-200 rounded-full mb-3 bg-white flex items-center">
        <input
          type="text"
          placeholder="Add a comment..."
          className="flex-1 px-4 py-2.5 rounded-full outline-none text-gray-700 text-sm"
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
        />
        <div className="flex items-center gap-2 pr-2">
          <button className="text-gray-500 hover:text-gray-700">
            <Smile className="w-5 h-5" />
          </button>
          <button className="text-gray-500 hover:text-gray-700">
            <Image className="w-5 h-5" />
          </button>
          <div className="relative">
            <Button
              size="sm"
              variant="ghost"
              className={cn(
                "text-blue-600 hover:text-blue-700 hover:bg-blue-50",
                step === 'post' && "ring-2 ring-blue-500 ring-offset-2"
              )}
              onClick={handlePostComment}
              disabled={!commentText.trim()}
            >
              Post
            </Button>
            {step === 'post' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap bg-blue-500 text-white px-2 py-1 rounded text-xs"
              >
                Click to post your comment
              </motion.div>
            )}
          </div>
        </div>
      </div>

      <div className="relative">
        <div className="flex flex-wrap gap-2 mb-4">
          {quickReplies.map((reply, index) => (
            <button
              key={index}
              onClick={() => handleQuickReply(reply.text)}
              className={cn(
                "px-4 py-1.5 rounded-full border border-blue-500 text-blue-500 text-sm hover:bg-blue-50 transition-colors",
                step === 'quickReplies' && "ring-2 ring-blue-500 ring-offset-2"
              )}
            >
              {reply.label}
            </button>
          ))}
        </div>
        {step === 'quickReplies' && !hasSelectedQuickReply && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute -right-32 top-1/2 -translate-y-1/2 flex items-center text-blue-500"
          >
            <span className="mr-2 text-sm font-medium">Choose any quick reply</span>
            <ArrowRight className="w-4 h-4 animate-bounce-x" />
          </motion.div>
        )}
      </div>

      <div className="text-sm text-gray-600 mb-2">
        {comments[0]?.likes || 0} Likes, {comments.length} Comments, 0 Reposts
      </div>

      <div className="flex justify-between items-center">
        <div className="text-blue-500 font-medium text-sm">
          Reach Score: 4/10
        </div>
        <div className="text-sm text-blue-500">
          Powered by Olly.Social
        </div>
      </div>

      <div className="mt-4 border-t pt-4">
        <div className="flex items-center justify-between text-gray-600 text-sm font-medium mb-4">
          <span>Most relevant</span>
          <span>▼</span>
        </div>

        <div className="space-y-4">
          {comments.map((comment) => (
            <div key={comment.id} className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium">
                {comment.author[0]}
              </div>
              <div className="flex-1">
                <div className="bg-gray-100 rounded-2xl p-3">
                  <div className="flex items-baseline gap-2">
                    <span className="font-semibold text-sm">{comment.author}</span>
                    <span className="text-gray-500 text-xs">{comment.role}</span>
                  </div>
                  <p className="text-sm text-start mt-1">{comment.text}</p>
                </div>
                <div className="flex gap-4 mt-1 text-xs text-gray-500">
                  <button
                    className={`hover:text-blue-600 ${comment.isLiked ? 'text-blue-600 font-semibold' : ''}`}
                    onClick={() => handleLikeComment(comment.id)}
                  >
                    Like
                  </button>
                  <button className="hover:text-blue-600">Reply</button>
                  <span>{comment.timestamp}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CommentPanel;