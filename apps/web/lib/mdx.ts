import { serialize } from 'next-mdx-remote/serialize';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypeHighlight from 'rehype-highlight';
import remarkGfm from 'remark-gfm';

export async function serializeMdx(content: string) {
  const mdxSource = await serialize(content, {
    mdxOptions: {
      remarkPlugins: [remarkGfm],
      rehypePlugins: [
        rehypeSlug,
        [rehypeAutolinkHeadings, { behavior: 'wrap' }],
        rehypeHighlight,
      ],
      format: 'mdx',
    },
  });

  return mdxSource;
}

export async function convertMdxToHtml(content: string) {
  try {
    const mdxSource = await serializeMdx(content);
    return mdxSource;
  } catch (error) {
    console.error('Error converting MDX to HTML:', error);
    throw error;
  }
}

// Helper function to extract metadata from MDX content
export function extractFrontmatter(content: string) {
  const frontmatterRegex = /---\s*([\s\S]*?)\s*---/;
  const match = frontmatterRegex.exec(content);
  
  if (!match || !match[1]) {
    return {};
  }
  
  const frontmatterString = match[1];
  const metadata: Record<string, any> = {};
  
  // Parse each line of the frontmatter
  frontmatterString.split('\n').forEach(line => {
    const [key, ...valueArr] = line.split(':');
    if (key && valueArr.length > 0) {
      const value = valueArr.join(':').trim();
      
      // Handle arrays (comma-separated values)
      if (value.includes(',')) {
        metadata[key.trim()] = value.split(',').map(v => v.trim());
      } 
      // Handle booleans
      else if (value === 'true' || value === 'false') {
        metadata[key.trim()] = value === 'true';
      } 
      // Handle numbers
      else if (!isNaN(Number(value))) {
        metadata[key.trim()] = Number(value);
      } 
      // Handle strings
      else {
        metadata[key.trim()] = value;
      }
    }
  });
  
  return metadata;
}

// Helper function to extract content without frontmatter
export function extractContentWithoutFrontmatter(content: string) {
  const frontmatterRegex = /---\s*[\s\S]*?\s*---/;
  return content.replace(frontmatterRegex, '').trim();
}

// Helper function to generate frontmatter from metadata
export function generateFrontmatter(metadata: Record<string, any>) {
  let frontmatter = '---\n';
  
  Object.entries(metadata).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      frontmatter += `${key}: ${value.join(', ')}\n`;
    } else {
      frontmatter += `${key}: ${value}\n`;
    }
  });
  
  frontmatter += '---\n\n';
  return frontmatter;
}

// Helper function to combine frontmatter and content
export function combineFrontmatterAndContent(
  metadata: Record<string, any>,
  content: string
) {
  const frontmatter = generateFrontmatter(metadata);
  return `${frontmatter}${content}`;
} 