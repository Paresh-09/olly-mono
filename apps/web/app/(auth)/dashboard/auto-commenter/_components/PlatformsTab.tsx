'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/components/ui/card";
import { Badge } from "@repo/ui/components/ui/badge";
import { FaLinkedin, FaInstagram, FaReddit, FaFacebook, FaTwitter, FaComment } from "react-icons/fa";
import PlatformCard from "./PlatformCard";

interface PlatformsTabProps {
  linkedinConfig: boolean;
}

export default function PlatformsTab({ linkedinConfig }: PlatformsTabProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* LinkedIn - Active Platform */}
        <PlatformCard
          title="LinkedIn"
          description="Professional content engagement"
          hasConfig={linkedinConfig}
          configPath="/dashboard/auto-commenter/linkedin/config"
          icon={<FaLinkedin className="text-blue-600" />}
          color="bg-gradient-to-br from-blue-500 to-blue-600"
          badgeText={linkedinConfig ? "Configured" : "Not Configured"}
        />

        {/* Coming Soon Platforms Card */}
        <Card className="shadow-none border">
          <CardHeader className="p-3 pb-0 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium">More Platforms Coming Soon</CardTitle>
            <Badge variant="outline" className="bg-blue-50 text-blue-700 font-normal">Coming Soon</Badge>
          </CardHeader>
          <CardContent className="p-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2 text-muted-foreground">
                <FaInstagram className="text-pink-600" />
                <span className="text-sm">Instagram</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <FaReddit className="text-orange-600" />
                <span className="text-sm">Reddit</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <FaFacebook className="text-blue-600" />
                <span className="text-sm">Facebook</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <FaTwitter className="text-blue-400" />
                <span className="text-sm">Twitter</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="pt-2 border-t">
        <h3 className="text-sm font-medium text-muted-foreground mb-2">Why use Auto Commenter?</h3>
        <div className="grid grid-cols-3 gap-3">
          <Card className="shadow-none border bg-gradient-to-br from-white to-blue-50">
            <CardContent className="p-3">
              <div className="flex items-center gap-2 mb-1">
                <div className="rounded-full w-6 h-6 bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                  <FaComment className="text-white text-xs" />
                </div>
                <h4 className="font-medium text-sm">Consistent Engagement</h4>
              </div>
              <p className="text-xs text-muted-foreground">
                Maintain active presence even when busy with other tasks.
              </p>
            </CardContent>
          </Card>
          
          <Card className="shadow-none border bg-gradient-to-br from-white to-purple-50">
            <CardContent className="p-3">
              <div className="flex items-center gap-2 mb-1">
                <div className="rounded-full w-6 h-6 bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h4 className="font-medium text-sm">Brand Building</h4>
              </div>
              <p className="text-xs text-muted-foreground">
                Strengthen your brand with regular interactions.
              </p>
            </CardContent>
          </Card>
          
          <Card className="shadow-none border bg-gradient-to-br from-white to-green-50">
            <CardContent className="p-3">
              <div className="flex items-center gap-2 mb-1">
                <div className="rounded-full w-6 h-6 bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h4 className="font-medium text-sm">Growth Acceleration</h4>
              </div>
              <p className="text-xs text-muted-foreground">
                Increase visibility by engaging with relevant content.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 