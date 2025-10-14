"use client";

import { BlogPost } from "@/app/blog/components/BlogPost";
import { useEffect, useState } from "react";
import Loading from "./loading";
import ReactMarkdown from 'react-markdown';

type ContentProps = {
    slug: string;
    metadata: {
        title: string;
        date: string;
        author: string;
    };
    dbContent?: string; // Add support for database content
};

type MDXModule = {
    default: React.ComponentType;
    metadata: any;
};

export function Content({ slug, metadata, dbContent }: ContentProps) {
    const [module, setModule] = useState<MDXModule | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
        
        // If we have database content, no need to load MDX
        if (dbContent) {
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setError(null);

        const loadMDXContent = async () => {
            try {
                const mod = await import(`../../../_posts/nl/${slug}.mdx`);
                setModule(mod as MDXModule);
                setIsLoading(false);
            } catch (error) {
                console.error('Failed to load MDX:', {
                    error,
                    slug,
                    stackTrace: error instanceof Error ? error.stack : undefined
                });
                setError(error instanceof Error ? error.message : 'Unknown error loading content');
                setIsLoading(false);
            }
        };
        
        loadMDXContent();
    }, [slug, dbContent]);

    // During SSR or before mounting, return a minimal loading state
    // This ensures the server and client render the same initial content
    if (!isMounted) {
        return <div className="min-h-[200px] flex items-center justify-center">
            <div className="animate-pulse bg-gray-200 h-6 w-24 rounded"></div>
        </div>;
    }

    // If we have database content, render it with ReactMarkdown
    if (dbContent) {
        return (
            <BlogPost
                date={metadata.date}
                title={metadata.title}
                author={metadata.author}
                content={<ReactMarkdown>{dbContent}</ReactMarkdown>}
            />
        );
    }

    if (isLoading) {
        return <Loading />;
    }

    if (error || !module) {
        return (
            <div className="p-4 text-red-600">
                <h2 className="text-xl font-bold">Error loading content</h2>
                <p>{error || 'Failed to load content'}</p>
                <p>Attempted to load slug: {slug}</p>
            </div>
        );
    }

    const MDXContent = module.default;

    return (
        <BlogPost
            date={metadata.date}
            title={metadata.title}
            author={metadata.author}
            content={<MDXContent />}
        />
    );
}