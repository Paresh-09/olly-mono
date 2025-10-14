import os
import re
import random
from bs4 import BeautifulSoup

def optimize_meta_description(content):
    # Extract current meta description
    match = re.search(r'description:\s*"(.+?)"', content)
    if match:
        current_desc = match.group(1)
        # Optimize description (this is a simple example, you might want to use more sophisticated NLP techniques)
        optimized_desc = current_desc[:150] + "..." if len(current_desc) > 150 else current_desc
        return content.replace(match.group(0), f'description: "{optimized_desc}"')
    return content

def add_internal_links(content, all_posts):
    # Add 2-3 random internal links at the end of the content
    links = random.sample(all_posts, min(3, len(all_posts)))
    link_section = "\n\n## Related Posts\n"
    for link in links:
        title = link.split('/')[-1].replace('-', ' ').title()
        link_section += f"- [{title}]({link})\n"
    return content + link_section

def fix_open_graph_url(content):
    # Ensure Open Graph URL matches canonical
    canonical_match = re.search(r'canonical:\s*"(.+?)"', content)
    if canonical_match:
        canonical_url = canonical_match.group(1)
        og_url_match = re.search(r'og:url:\s*"(.+?)"', content)
        if og_url_match:
            return content.replace(og_url_match.group(0), f'og:url: "{canonical_url}"')
        else:
            return content.replace('export const metadata = {', f'export const metadata = {{\n  og:url: "{canonical_url}",')
    return content

def ensure_h1_tag(content):
    # Ensure there's an H1 tag
    if '# ' not in content:
        title_match = re.search(r'title:\s*"(.+?)"', content)
        if title_match:
            title = title_match.group(1)
            return content + f'\n\n# {title}\n'
    return content

def increase_word_count(content):
    # Simple way to increase word count (you might want to use more sophisticated text generation)
    word_count = len(content.split())
    if word_count < 300:
        return content + "\n\nThis article provides valuable insights into the topic. For more information, please refer to the related posts or contact us directly."
    return content

# def optimize_title_length(content):
#     # Ensure title is not too long
#     title_match = re.search(r'title:\s*"(.+?)"', content)
#     if title_match:
#         title = title_match.group(1)
#         if len(title) > 60:
#             optimized_title = title[:57] + "..."
#             return content.replace(title_match.group(0), f'title: "{optimized_title}"')
#     return content

def process_file(file_path, all_posts):
    with open(file_path, 'r', encoding='utf-8') as file:
        content = file.read()
    
    # Apply fixes
    content = optimize_meta_description(content)
    # content = add_internal_links(content, all_posts)
    content = fix_open_graph_url(content)
    content = ensure_h1_tag(content)
    content = increase_word_count(content)
    # content = optimize_title_length(content)
    
    with open(file_path, 'w', encoding='utf-8') as file:
        file.write(content)
    print(f"Processed: {file_path}")

def get_all_posts(directory):
    posts = []
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file == 'content.mdx':
                relative_path = os.path.relpath(os.path.join(root, file), directory)
                posts.append(f"/blog/post/{os.path.dirname(relative_path)}")
    return posts

def process_directory(directory):
    all_posts = get_all_posts(directory)
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file == 'content.mdx':
                file_path = os.path.join(root, file)
                process_file(file_path, all_posts)

if __name__ == "__main__":
    blog_directory = "./app/blog/post"  # Update this path to your blog post directory
    process_directory(blog_directory)
    print("Processing completed.")