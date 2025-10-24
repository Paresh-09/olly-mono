import os
import re

def ensure_h1_tag(content):
    # Check if there's already an H1 tag
    if re.search(r'^# ', content, re.MULTILINE):
        return content, False
    
    # If not, extract the title from metadata and add it as H1
    title_match = re.search(r'title:\s*"(.+?)"', content)
    if title_match:
        title = title_match.group(1)
        # Find the end of the metadata block
        metadata_end = content.find('}')
        if metadata_end != -1:
            # Insert the H1 tag after the metadata block
            new_content = content[:metadata_end+1] + f'\n\n# {title}\n\n' + content[metadata_end+1:]
            return new_content, True
    return content, False

def process_file(file_path):
    with open(file_path, 'r', encoding='utf-8') as file:
        content = file.read()
    
    updated_content, changes_made = ensure_h1_tag(content)
    
    if changes_made:
        with open(file_path, 'w', encoding='utf-8') as file:
            file.write(updated_content)
        print(f"Added H1 tag to: {file_path}")
    else:
        print(f"No changes needed in: {file_path}")

def process_directory(directory):
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file == 'content.mdx':
                file_path = os.path.join(root, file)
                process_file(file_path)

if __name__ == "__main__":
    blog_directory = "app/blog/post"
    process_directory(blog_directory)
    print("Processing completed.")