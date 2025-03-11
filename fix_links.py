from pathlib import Path
import re

def fix_links(text):
    # Pattern matches <a href="URL" ...other attributes...>TEXT</a>
    pattern = r'<a href="([^"]+)"[^>]*>(.*?)</a>'
    
    def link_to_markdown(match):
        url = match.group(1)
        text = match.group(2)
        # Use raw string to preserve exact Unicode characters
        return r'[' + text + r'](' + url + r')'
    
    # Replace all links with markdown format
    text = re.sub(pattern, link_to_markdown, text, flags=re.DOTALL)
    
    return text

def process_files():
    # Get all txt files in extracted directory
    extracted_dir = Path("extracted")
    for file_path in extracted_dir.glob("*.txt"):
        try:
            # Read the file
            with open(file_path, 'r', encoding='utf-8') as f:
                text = f.read()
            
            # Fix links
            fixed_text = fix_links(text)
            
            # Only write back if changes were made
            if fixed_text != text:
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write(fixed_text)
                print(f"Successfully fixed links in: {file_path}")
            
        except Exception as e:
            print(f"Error processing {file_path}: {str(e)}")
            continue

if __name__ == "__main__":
    process_files() 