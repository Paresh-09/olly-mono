import { FaCog, FaSearch, FaComment } from "react-icons/fa";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/components/ui/card";
import { Badge } from "@repo/ui/components/ui/badge";

export default function HowItWorks() {
  return (
    <div className="space-y-4">
      <div className="mb-2">
        <h2 className="text-lg font-semibold">How the Auto-Commenter Works</h2>
        <p className="text-sm text-muted-foreground">
          Our AI-powered auto-commenter helps you engage with relevant content across platforms.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Card className="shadow-none border">
          <CardHeader className="p-3 pb-1">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                <FaCog className="h-3 w-3 text-blue-600" />
              </div>
              <CardTitle className="text-sm font-medium">1. Create Configuration</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-3 pt-1">
            <p className="text-xs text-muted-foreground mb-2">
              Set up preferences for the auto-commenter:
            </p>
            <div className="flex flex-wrap gap-1">
              <Badge variant="secondary" className="text-xs bg-blue-50 text-blue-700 px-1.5 py-0.5 font-normal">Platforms</Badge>
              <Badge variant="secondary" className="text-xs bg-blue-50 text-blue-700 px-1.5 py-0.5 font-normal">Topics</Badge>
              <Badge variant="secondary" className="text-xs bg-blue-50 text-blue-700 px-1.5 py-0.5 font-normal">Frequency</Badge>
              <Badge variant="secondary" className="text-xs bg-blue-50 text-blue-700 px-1.5 py-0.5 font-normal">Tone</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-none border">
          <CardHeader className="p-3 pb-1">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center">
                <FaSearch className="h-3 w-3 text-purple-600" />
              </div>
              <CardTitle className="text-sm font-medium">2. AI Finds Content</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-3 pt-1">
            <p className="text-xs text-muted-foreground mb-2">
              Our AI continuously searches for:
            </p>
            <div className="flex flex-wrap gap-1">
              <Badge variant="secondary" className="text-xs bg-purple-50 text-purple-700 px-1.5 py-0.5 font-normal">Recent posts</Badge>
              <Badge variant="secondary" className="text-xs bg-purple-50 text-purple-700 px-1.5 py-0.5 font-normal">Industry content</Badge>
              <Badge variant="secondary" className="text-xs bg-purple-50 text-purple-700 px-1.5 py-0.5 font-normal">Trending topics</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-none border">
          <CardHeader className="p-3 pb-1">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                <FaComment className="h-3 w-3 text-green-600" />
              </div>
              <CardTitle className="text-sm font-medium">3. Generate Comments</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-3 pt-1">
            <p className="text-xs text-muted-foreground mb-2">
              Our AI creates thoughtful, contextual comments:
            </p>
            <div className="flex flex-wrap gap-1">
              <Badge variant="secondary" className="text-xs bg-green-50 text-green-700 px-1.5 py-0.5 font-normal">Brand voice</Badge>
              <Badge variant="secondary" className="text-xs bg-green-50 text-green-700 px-1.5 py-0.5 font-normal">Valuable insights</Badge>
              <Badge variant="secondary" className="text-xs bg-green-50 text-green-700 px-1.5 py-0.5 font-normal">Natural engagement</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-none border bg-muted/20">
        <CardContent className="p-3">
          <span className="font-medium text-sm block mb-1">Important Notes:</span>
          <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-xs">
            <div className="flex items-start gap-1">
              <span className="text-muted-foreground">•</span>
              <span className="text-muted-foreground">Full control over frequency</span>
            </div>
            <div className="flex items-start gap-1">
              <span className="text-muted-foreground">•</span>
              <span className="text-muted-foreground">Follows platform rules</span>
            </div>
            <div className="flex items-start gap-1">
              <span className="text-muted-foreground">•</span>
              <span className="text-muted-foreground">Analytics to optimize engagement</span>
            </div>
            <div className="flex items-start gap-1">
              <span className="text-muted-foreground">•</span>
              <span className="text-muted-foreground">System improves over time</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 