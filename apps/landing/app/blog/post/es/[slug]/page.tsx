import { Metadata } from "next";
import { notFound } from "next/navigation";
import { Content } from "./content";
import fs from 'fs';
import path from 'path';
import { StructuredData } from "../../StructuredData";

type Params = {
    slug: string;
};

type BlogPostMetadata = {
    title: string;
    description: string;
    date: string;
    author: string;
};

// Function to get post from MDX file
async function getPost(slug: string): Promise<{ metadata: BlogPostMetadata | null }> {
    try {
        const postsDirectory = path.join(process.cwd(), 'app/blog/_posts/es');
        const filePath = path.join(postsDirectory, `${slug}.mdx`);
        
        if (!fs.existsSync(filePath)) {
            return { metadata: null };
        }
        
        const fileContent = fs.readFileSync(filePath, 'utf8');
        const metadataMatch = fileContent.match(/export const metadata = ({[\s\S]*?})/);
        if (!metadataMatch) return { metadata: null };
        
        const metadata = eval(`(${metadataMatch[1]})`) as BlogPostMetadata;
        return { metadata };
    } catch (error) {
        console.error('Error reading post metadata:', error);
        return { metadata: null };
    }
}

export async function generateMetadata(props: { params: Promise<Params> }): Promise<Metadata> {
    const params = await props.params;
    const post = await getPost(params.slug);

    if (!post.metadata) {
        return {
            title: 'Post Not Found',
            robots: { index: false },
        };
    }

    return {
        title: post.metadata.title,
        description: post.metadata.description,
        alternates: {
            canonical: `/blog/post/es/${params.slug}`,
        },
        robots: { index: true, follow: true },
    };
}

export async function generateStaticParams(): Promise<Array<Params>> {
    const postsDirectory = path.join(process.cwd(), 'app/blog/_posts/es');
    const posts = fs.readdirSync(postsDirectory)
        .filter(file => file.endsWith('.mdx'))
        .sort((a, b) => b.localeCompare(a));
        
    return posts.map((post) => ({
        slug: post.replace(/\.mdx$/, ''),
    }));
}

// For ISR, we want to allow dynamic parameters
export const dynamicParams = true;

// Use the Next.js 13+ segment configuration
export const revalidate = 3600; // Revalidate every hour

export default async function Page(props: { params: Promise<Params> }) {
    const params = await props.params;
    const post = await getPost(params.slug);

    if (!post.metadata) {
        notFound();
    }

    return (
        <>
            <StructuredData
                headline={post.metadata.title}
                datePublished={post.metadata.date}
                dateModified={post.metadata.date}
                authorName={post.metadata.author}
                authorUrl="https://goyashy.com"
                image={[]}
            />
            <Content slug={params.slug} metadata={post.metadata} />
        </>
    );
}