"use client";
import React, { useState } from 'react';
import { Input } from '@repo/ui/components/ui/input';
import { Label } from '@repo/ui/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@repo/ui/components/ui/card';

const LinkedInEngagementCalculator: React.FC = () => {
  const [reactions, setReactions] = useState(5);
  const [comments, setComments] = useState(2);
  const [shares, setShares] = useState(1);
  const [impressions, setImpressions] = useState(1000);

  const calculateEngagementRate = () => {
    if (impressions === 0) return 0;
    const totalEngagement = reactions + comments + shares;
    return ((totalEngagement / impressions) * 100).toFixed(2);
  };

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-semibold">
          LinkedIn Engagement Rate Calculator
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <Label htmlFor="reactions">Reactions:</Label>
          <Input
            type="number"
            id="reactions"
            value={reactions}
            onChange={(e) => setReactions(parseInt(e.target.value))}
            className="mt-1"
          />
        </div>
        <div className="mb-4">
          <Label htmlFor="comments">Comments:</Label>
          <Input
            type="number"
            id="comments"
            value={comments}
            onChange={(e) => setComments(parseInt(e.target.value))}
            className="mt-1"
          />
        </div>
        <div className="mb-4">
          <Label htmlFor="shares">Shares:</Label>
          <Input
            type="number"
            id="shares"
            value={shares}
            onChange={(e) => setShares(parseInt(e.target.value))}
            className="mt-1"
          />
        </div>
        <div className="mb-4">
          <Label htmlFor="impressions">Impressions:</Label>
          <Input
            type="number"
            id="impressions"
            value={impressions}
            onChange={(e) => setImpressions(parseInt(e.target.value))}
            className="mt-1"
          />
        </div>
        <div className="text-lg font-bold">
          Engagement Rate: {calculateEngagementRate()}%
        </div>
      </CardContent>
    </Card>
  );
};

export default LinkedInEngagementCalculator;