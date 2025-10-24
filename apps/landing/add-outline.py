import os
import re

def has_outline(content):
    # Check if the content has an "Outline" section
    return bool(re.search(r'^## Outline', content, re.MULTILINE))

def generate_outline(content):
    # Extract headers (##) and create an outline
    headers = re.findall(r'^## (.+)$', content, re.MULTILINE)
    outline = "## Outline\n\n"
    for i, header in enumerate(headers, 1):
        outline += f"{i}. {header}\n"
    return outline

def process_file(file_path):
    with open(file_path, 'r', encoding='utf-8') as file:
        content = file.read()

    if not has_outline(content):
        outline = generate_outline(content)
        # Find the position after the metadata and title
        insert_position = re.search(r'^# ', content, re.MULTILINE).start()
        updated_content = content[:insert_position] + outline + "\n" + content[insert_position:]

        with open(file_path, 'w', encoding='utf-8') as file:
            file.write(updated_content)
        print(f"Added outline to {file_path}")
    else:
        print(f"Outline already exists in {file_path}")

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
