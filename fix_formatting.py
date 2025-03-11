from pathlib import Path
import re

def fix_formatting(text):
    # Remove font tags but keep content
    text = re.sub(r'<font[^>]*>(.*?)</font>', r'\1', text, flags=re.DOTALL)
    
    # Remove center tags but keep content
    text = re.sub(r'<center>(.*?)</center>', r'\1', text, flags=re.DOTALL)
    
    # Convert <p> tags to double newlines
    text = re.sub(r'<p[^>]*>', '\n\n', text)
    text = re.sub(r'</p>', '', text)
    
    # Convert <blockquote> to markdown
    text = re.sub(r'<blockquote[^>]*>(.*?)</blockquote>', r'> \1', text, flags=re.DOTALL)
    
    # Convert <hr> to markdown
    text = re.sub(r'<hr[^>]*>', '---', text)
    
    # Convert <pre> to markdown (using code blocks)
    text = re.sub(r'<pre[^>]*>(.*?)</pre>', r'```\1```', text, flags=re.DOTALL)
    
    # Convert ordered lists
    def replace_list(match):
        content = match.group(1)
        # Replace each <li> with "1. " (markdown will auto-number)
        content = re.sub(r'<li[^>]*>(.*?)</li>', r'1. \1\n', content, flags=re.DOTALL)
        return content.strip()
    
    text = re.sub(r'<ol[^>]*>(.*?)</ol>', replace_list, text, flags=re.DOTALL)
    
    return text

def process_files():
    # Get all txt files in extracted directory
    extracted_dir = Path("extracted")
    for file_path in extracted_dir.glob("*.txt"):
        try:
            # Read the file
            with open(file_path, 'r', encoding='utf-8') as f:
                text = f.read()
            
            # Fix formatting
            fixed_text = fix_formatting(text)
            
            # Only write back if changes were made
            if fixed_text != text:
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write(fixed_text)
                print(f"Successfully fixed formatting in: {file_path}")
            
        except Exception as e:
            print(f"Error processing {file_path}: {str(e)}")
            continue

if __name__ == "__main__":
    process_files() 