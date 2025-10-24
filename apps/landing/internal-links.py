import os
import xml.etree.ElementTree as ET
import random
import re

def get_blog_posts_from_sitemap(sitemap_path):
    tree = ET.parse(sitemap_path)
    root = tree.getroot()
    namespace = {'ns': 'http://www.sitemaps.org/schemas/sitemap/0.9'}
    
    blog_posts = []
    for url in root.findall('ns:url', namespace):
        loc = url.find('ns:loc', namespace).text
        if '/blog/post/' in loc:
            blog_posts.append(loc)
    
    return blog_posts

def add_internal_links(content, blog_posts, current_url):
    # Check if "Related Posts" section already exists
    if "## Related Posts" in content:
        print("Related Posts section already exists. Skipping...")
        return content

    other_posts = [post for post in blog_posts if post != current_url]
    selected_posts = random.sample(other_posts, min(3, len(other_posts)))
    
    links_section = "\n\n## Related Posts\n"
    for post in selected_posts:
        title = post.split('/')[-1].replace('-', ' ').title()
        links_section += f"- [{title}]({post})\n"
    
    return content + links_section

def process_content_files(root_dir, blog_posts):
    post_dir = os.path.join(root_dir, 'app', 'blog', 'post')
    for folder in os.listdir(post_dir):
        folder_path = os.path.join(post_dir, folder)
        if os.path.isdir(folder_path):
            content_file = os.path.join(folder_path, 'content.mdx')
            if os.path.exists(content_file):
                with open(content_file, 'r+') as file:
                    content = file.read()
                    
                    current_url = f"https://www.olly.social/blog/post/{folder}"
                    
                    updated_content = add_internal_links(content, blog_posts, current_url)
                    
                    if updated_content != content:
                        file.seek(0)
                        file.write(updated_content)
                        file.truncate()
                        print(f"Updated: {content_file}")
                    else:
                        print(f"No changes needed: {content_file}")

if __name__ == "__main__":
    sitemap_path = './public/sitemap.xml'  # Update this path if necessary
    root_dir = '.'  # Assumes the script is run from the project root

    blog_posts = get_blog_posts_from_sitemap(sitemap_path)
    process_content_files(root_dir, blog_posts)
    print("Internal links added to content.mdx files where needed.")