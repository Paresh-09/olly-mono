"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@repo/ui/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@repo/ui/components/ui/alert";
import { AlertCircle, Instagram } from "lucide-react";
import ConnectInstagram from "./_components/connect-instagram";
import CommentMonitoring from "./_components/comment-monitoring";
import DMAutomation from "./_components/dm-automation";
import DMRules from "./_components/dm-rules";

interface InstagramAccount {
  id: string;
  username: string;
  name: string;
  profilePicture: string;
  followersCount: number;
  mediaCount: number;
}

export default function InstagramAutomationPage() {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [account, setAccount] = useState<InstagramAccount | null>(null);
  const [activeTab, setActiveTab] = useState("connect");

  useEffect(() => {
    // Check if user has connected Instagram
    const checkConnection = async () => {
      try {
        const response = await fetch(
          "/api/auto-commenter/oauth-status?platform=INSTAGRAM",
        );
        const data = await response.json();

        if (data.hasToken && !data.isExpired) {
          setIsConnected(true);
          // Fetch account details
          const accountResponse = await fetch(
            "/api/automations/instagram/account",
          );
          const accountData = await accountResponse.json();

          if (accountData.account) {
            setAccount(accountData.account);
            setActiveTab("comment-monitoring");
          }
        }
      } catch (error) {
        console.error("Error checking Instagram connection:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkConnection();
  }, []);

  const handleConnectSuccess = (accountData: InstagramAccount) => {
    setIsConnected(true);
    setAccount(accountData);
    setActiveTab("comment-monitoring");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center gap-2 mb-6">
        <Instagram className="h-6 w-6 text-pink-500" />
        <h1 className="text-2xl font-bold">Instagram Automation</h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="connect">Connect Account</TabsTrigger>
          <TabsTrigger value="comment-monitoring" disabled={!isConnected}>
            Comment Monitoring
          </TabsTrigger>
          <TabsTrigger value="dm-automation" disabled={!isConnected}>
            DM Automation
          </TabsTrigger>
          <TabsTrigger value="dm-rules" disabled={!isConnected}>
            DM Rules
          </TabsTrigger>
        </TabsList>

        <TabsContent value="connect">
          <Card>
            <CardHeader>
              <CardTitle>Connect Your Instagram Business Account</CardTitle>
              <CardDescription>
                Connect your Instagram business account to enable automation
                features
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ConnectInstagram
                isConnected={isConnected}
                account={account}
                onConnectSuccess={handleConnectSuccess}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="comment-monitoring">
          <Card>
            <CardHeader>
              <CardTitle>Comment Monitoring</CardTitle>
              <CardDescription>
                Monitor comments on your Instagram posts and automatically
                respond to specific keywords
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isConnected && account ? (
                <CommentMonitoring account={account} />
              ) : (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>
                    Please connect your Instagram account first
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="dm-automation">
          <Card>
            <CardHeader>
              <CardTitle>DM Automation</CardTitle>
              <CardDescription>
                Automatically send direct messages to users who comment on your
                posts with specific keywords
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isConnected && account ? (
                <DMAutomation account={account} />
              ) : (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>
                    Please connect your Instagram account first
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="dm-rules">
          <Card>
            <CardHeader>
              <CardTitle>DM Rules</CardTitle>
              <CardDescription>
                View and manage all your DM automation rules
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isConnected && account ? (
                <DMRules account={account} />
              ) : (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>
                    Please connect your Instagram account first
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

