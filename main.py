import os
import re
from pathlib import Path

def extract_content(text):
    # Extract title
    title_pattern = r'<title>(.*?)</title>'
    title_match = re.search(title_pattern, text)
    title = title_match.group(1) if title_match else "No Title Found"
    
    # Extract content
    content_pattern = r'<br /><br /><font size="2" face="verdana">(.*?)<br /><br /></font></td></tr>'
    content_match = re.search(content_pattern, text, re.DOTALL)  # re.DOTALL to match across lines
    content = content_match.group(1) if content_match else "No Content Found"
    
    return title, content

def process_files():
    # Get all txt files in extracted directory
    extracted_dir = Path("extracted")
    for file_path in extracted_dir.glob("*.txt"):
        try:
            # Read the original file
            with open(file_path, 'r', encoding='utf-8') as f:
                text = f.read()
            
            # Extract title and content
            title, content = extract_content(text)
            
            # Format new content
            new_content = f"{title}\n---\n{content}"
            
            # Write back to the same file
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(new_content)
                
            print(f"Successfully processed: {file_path}")
            
        except Exception as e:
            print(f"Error processing {file_path}: {str(e)}")
            continue

if __name__ == "__main__":
    process_files()
