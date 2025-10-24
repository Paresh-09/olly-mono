"use client"

import { SelectValue, SelectTrigger, SelectItem, SelectContent, Select } from "@repo/ui/components/ui/select";
import { Button } from "@repo/ui/components/ui/button";
import { useEffect, useState } from "react";
import { Textarea } from "@repo/ui/components/ui/textarea";
import FeedbackDialog from "./feedback";

// Add this new import for UUID generation
import { v4 as uuidv4 } from 'uuid';

interface CommentGeneratorProps {
    title?: string;
    defaultPlatform?: string;
}

export default function CommentGenerator({ title = "Comment Generator", defaultPlatform = "instagram" }: CommentGeneratorProps) {
    const [postContent, setPostContent] = useState("");
    const [commentingStyle, setCommentingStyle] = useState("formal");
    const [writingStyle, setWritingStyle] = useState("analytical");
    const [generatedComment, setGeneratedComment] = useState("");
    const [commentLength, setCommentLength] = useState("short");
    const [platform, setPlatform] = useState(defaultPlatform);
    const [showFeedbackDialog, setShowFeedbackDialog] = useState(false);
    const [generationCount, setGenerationCount] = useState(0);

    // Add this new state for the user ID
    const [userId, setUserId] = useState("");

    // Use useEffect to generate a UUID when the component mounts
    useEffect(() => {
        setUserId(uuidv4());
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const response = await fetch("/api/openai/generate-comments", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    postContent,
                    commentingStyle,
                    writingStyle,
                    commentLength,
                    platform,
                    userId, // Add the userId to the request body
                }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            setGeneratedComment(data.comment);
            setGenerationCount(generationCount + 1);

        } catch (error: any) {
            console.error(`Error generating comment: ${error.message}`);
        }
    };

    useEffect(() => {
        if (generatedComment && generationCount === 1) {
            const timer = setTimeout(() => {
                setShowFeedbackDialog(true);
            }, 3000);

            return () => clearTimeout(timer);
        }
    }, [generatedComment, generationCount]);

    return (
        <div className="flex justify-center items-center min-h-screen px-4">
            <div className="bg-white dark:bg-gray-900 shadow-lg shadow-teal-500 rounded-lg p-6 w-full max-w-4xl">
                <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">{title}</h2>
                <form className="space-y-4" onSubmit={handleSubmit}>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="post-content">
                            Post Content
                        </label>
                        <Textarea
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200"
                            id="post-content"
                            placeholder="Enter the post content..."
                            rows={3}
                            value={postContent}
                            onChange={(e) => setPostContent(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="social-platform">
                            Social Platform
                        </label>
                        <Select
                            value={platform}
                            onValueChange={(value) => setPlatform(value)}
                        >
                            <SelectTrigger id="social-platform">
                                <SelectValue placeholder="Select Platform" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="linkedin">LinkedIn</SelectItem>
                                <SelectItem value="youtube">YouTube</SelectItem>
                                <SelectItem value="twitter">Twitter / X</SelectItem>
                                <SelectItem value="instagram">Instagram</SelectItem>
                                <SelectItem value="facebook">Facebook</SelectItem>
                                <SelectItem value="tiktok">TikTok</SelectItem>
                                <SelectItem value="reddit">Reddit</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="commenting-style">
                            Commenting Style
                        </label>
                        <Select
                            value={commentingStyle}
                            onValueChange={(value) => setCommentingStyle(value)}
                        >
                            <SelectTrigger id="commenting-style">
                                <SelectValue placeholder="Select commenting style" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="formal">Formal</SelectItem>
                                <SelectItem value="casual">Casual</SelectItem>
                                <SelectItem value="humorous">Humorous</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="writing-style">
                            Writing Style
                        </label>
                        <Select
                            value={writingStyle}
                            onValueChange={(value) => setWritingStyle(value)}
                        >
                            <SelectTrigger id="writing-style">
                                <SelectValue placeholder="Select writing style" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="analytical">Analytical</SelectItem>
                                <SelectItem value="personal">Personal</SelectItem>
                                <SelectItem value="persuasive">Persuasive</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="comment-length">
                            Comment Length
                        </label>
                        <Select
                            value={commentLength}
                            onValueChange={(value) => setCommentLength(value)}
                        >
                            <SelectTrigger id="comment-length">
                                <SelectValue placeholder="Select Comment Length" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="short">Short</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="long">Long</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <Button className="w-full" type="submit">
                        Generate Comment
                    </Button>
                </form>
                {generatedComment && (
                    <div className="mt-8 bg-gray-100 dark:bg-gray-800 rounded-md p-4">
                        <h3 className="text-lg font-bold mb-2 text-gray-900 dark:text-gray-100">Generated Comment</h3>
                        <p className="text-gray-700 dark:text-gray-300">{generatedComment}</p>
                        <div className="mt-4 flex items-center justify-between">
                            <Button className="ml-4" size="sm" variant="outline" onClick={() => navigator.clipboard.writeText(generatedComment)}>
                                Copy
                            </Button>
                        </div>
                    </div>
                )}
            </div>
            <FeedbackDialog open={showFeedbackDialog} onClose={() => setShowFeedbackDialog(false)} />
        </div>
    );
}