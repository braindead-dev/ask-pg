from pathlib import Path
import re

def fix_images_and_comments(text):
    # Remove HTML comments (including the comment tags)
    pattern_comments = r'<!--.*?-->'
    text = re.sub(pattern_comments, '', text, flags=re.DOTALL)
    
    # Convert image tags to markdown
    # Pattern matches <img> tags with various optional attributes
    pattern_images = r'<img\s+[^>]*?src="([^"]+)"[^>]*?>'
    
    def image_to_markdown(match):
        # Get the URL from the src attribute
        url = match.group(1)
        # Extract filename without extension for the alt text
        alt_text = url.split('/')[-1].rsplit('.', 1)[0]
        return f'![{alt_text}]({url})'
    
    # Replace all image tags with markdown format
    text = re.sub(pattern_images, image_to_markdown, text)
    
    return text

def process_files():
    # Get all txt files in extracted directory
    extracted_dir = Path("extracted")
    for file_path in extracted_dir.glob("*.txt"):
        try:
            # Read the file
            with open(file_path, 'r', encoding='utf-8') as f:
                text = f.read()
            
            # Fix images and remove comments
            fixed_text = fix_images_and_comments(text)
            
            # Only write back if changes were made
            if fixed_text != text:
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write(fixed_text)
                print(f"Successfully fixed images and comments in: {file_path}")
            
        except Exception as e:
            print(f"Error processing {file_path}: {str(e)}")
            continue

if __name__ == "__main__":
    process_files() 