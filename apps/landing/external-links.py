import os
import xml.etree.ElementTree as ET
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

def add_read_more_section(content):
    read_more_section = """

## Read More

- [Learn about AI at ExplainX.AI](https://explainx.ai)
- [Build AI Agents](https://agentbeam.com)
- [Launch Courses and Digital Products] (https://www.hustlecove.com)
- [Auto edit videos at Snapy.AI](https://snapy.ai)
- [Find the best GenAI course at GenAICourses.com](https://genaicourses.com)
- [Learn how to use AI in digital marketing](https://www.udemy.com/course/2024-generative-ai-masterclass-beginners-to-expert/?referralCode=65445B91BF0DB591B523)
"""
    
    # Check if the Read More section already exists
    if "## Read More" in content:
        print("Read More section already exists. Skipping...")
        return content

    # Add the Read More section at the end of the content
    return content + read_more_section

def process_content_files(root_dir):
    post_dir = os.path.join(root_dir, 'app', 'blog', 'post')
    for folder in os.listdir(post_dir):
        folder_path = os.path.join(post_dir, folder)
        if os.path.isdir(folder_path):
            content_file = os.path.join(folder_path, 'content.mdx')
            if os.path.exists(content_file):
                with open(content_file, 'r+') as file:
                    content = file.read()
                    
                    updated_content = add_read_more_section(content)
                    
                    if updated_content != content:
                        file.seek(0)
                        file.write(updated_content)
                        file.truncate()
                        print(f"Updated: {content_file}")
                    else:
                        print(f"No changes needed: {content_file}")

if __name__ == "__main__":
    root_dir = '.'  # Assumes the script is run from the project root

    process_content_files(root_dir)
    print("Read More section added to content.mdx files where needed.")