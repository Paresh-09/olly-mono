import os
import re
def add_robots_metadata(content):
    # Check if robots metadata already exists
    if "robots:" in content:
        return content, False

    # Find the metadata object
    metadata_match = re.search(r'export const metadata.*?= {', content, re.DOTALL)
    if metadata_match:
        # Find the closing brace of the metadata object
        metadata_end = content.find('};', metadata_match.end())
        if metadata_end != -1:
            # Insert robots metadata just before the closing brace
            robots_metadata = '''
  robots: {
    index: true,
    follow: true
  },'''
            new_content = (
                content[:metadata_end] +
                robots_metadata +
                content[metadata_end:]
            )
            return new_content, True
    return content, False

def process_file(file_path):
    with open(file_path, 'r', encoding='utf-8') as file:
        content = file.read()
    
    updated_content, changes_made = add_robots_metadata(content)
    
    if changes_made:
        with open(file_path, 'w', encoding='utf-8') as file:
            file.write(updated_content)
        print(f"Added robots metadata to: {file_path}")
    else:
        print(f"No changes needed in: {file_path}")

def process_directory(directory):
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file == 'page.tsx':
                file_path = os.path.join(root, file)
                process_file(file_path)

if __name__ == "__main__":
    blog_directory = "app/blog/post"
    process_directory(blog_directory)
    print("Processing completed.")