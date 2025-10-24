import os
import re

def fix_headings(content):
    # Split content into lines
    lines = content.split('\n')
    
    # Flag to check if H1 has been used
    h1_used = False
    
    # Counter for H2 headings
    h2_count = 0
    
    fixed_lines = []
    for line in lines:
        # Check for headings
        if line.strip().startswith('#'):
            # Count the number of '#' symbols
            level = len(line.split()[0])
            
            # Fix H1 (should only be used once, at the top)
            if level == 1:
                if not h1_used:
                    fixed_lines.append(line)
                    h1_used = True
                else:
                    # Downgrade to H2 if H1 already used
                    fixed_lines.append('## ' + line[2:])
                    h2_count += 1
            
            # Fix H2
            elif level == 2:
                fixed_lines.append(line)
                h2_count += 1
            
            # Fix H3 (ensure there's at least one H2 before using H3)
            elif level == 3:
                if h2_count > 0:
                    fixed_lines.append(line)
                else:
                    # Upgrade to H2 if no H2 has been used yet
                    fixed_lines.append('## ' + line[3:])
                    h2_count += 1
            
            # Downgrade any heading level > 3 to H3
            elif level > 3:
                fixed_lines.append('### ' + line[level:])
        
        else:
            fixed_lines.append(line)
    
    return '\n'.join(fixed_lines)

def process_file(file_path):
    with open(file_path, 'r', encoding='utf-8') as file:
        content = file.read()
    
    # Fix headings
    fixed_content = fix_headings(content)
    
    # Only write back if changes were made
    if fixed_content != content:
        with open(file_path, 'w', encoding='utf-8') as file:
            file.write(fixed_content)
        print(f"Fixed headings in: {file_path}")
    else:
        print(f"No changes needed in: {file_path}")

def process_directory(directory):
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file == 'content.mdx':
                file_path = os.path.join(root, file)
                process_file(file_path)

if __name__ == "__main__":
    blog_directory = "./app/blog/post"  # Update this path to your blog post directory
    process_directory(blog_directory)
    print("Processing completed.")