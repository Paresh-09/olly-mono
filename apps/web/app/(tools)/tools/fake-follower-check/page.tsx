'use client'
import { useRouter } from "next/navigation";
import { Button } from "@repo/ui/components/ui/button";
import { Card } from "@repo/ui/components/ui/card";

export default function PlatformRedirect() {
    const router = useRouter();

    const handleRedirect = (platform: string) => {
        router.push(`/tools/fake-follower-check/${platform}`);
    };

    return (
        <div className="container mx-auto px-4 py-16 max-w-4xl">
            <h1 className="text-4xl font-bold text-center text-slate-900 dark:text-slate-100 mb-8">
                Select a Platform
            </h1>
            <Card className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Button 
                        variant="default" 
                        size="lg"
                        className="w-full bg-blue-500"
                        onClick={() => handleRedirect("linkedin")}
                    >
                        LinkedIn
                    </Button>
                    <Button 
                        variant="default"
                        size="lg"
                        className="w-full bg-red-400"
                        onClick={() => handleRedirect("instagram")}
                    >
                        Instagram
                    </Button>
                    <Button 
                        variant="default"
                        size="lg"
                        className="w-full"
                        onClick={() => handleRedirect("tiktok")}
                    >
                        TikTok
                    </Button>
                </div>
            </Card>
        </div>
    );
}
