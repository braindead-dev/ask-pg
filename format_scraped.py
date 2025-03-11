from pathlib import Path
import re

def extract_title(text):
    # Find content between <title> tags
    title_match = re.search(r'<title>(.*?)</title>', text, re.DOTALL)
    if title_match:
        return title_match.group(1).strip()
    return "Untitled"

def extract_content(text):
    # Find content between the specified markers
    content_match = re.search(
        r'<br /><br /><font size="2" face="verdana">(.*?)<br /><br /><br clear="all" />',
        text,
        re.DOTALL
    )
    if content_match:
        return content_match.group(1).strip()
    return ""

def format_links(text):
    # Convert HTML links to markdown format
    # Pattern matches <a href="URL">TEXT</a>
    pattern = r'<a href="([^"]+)">([^<]+)</a>'
    return re.sub(pattern, r'[\2](\1)', text)

def format_text(text):
    if "<html>" not in text:
        return text  # Skip if not a newly scraped file
        
    # 1. Extract title and content
    title = extract_title(text)
    content = extract_content(text)
    
    if not content:
        return text  # Skip if we couldn't extract content properly
    
    # 2. Remove existing newlines from content
    content = ' '.join(content.split())
    
    # 3. Format links
    content = format_links(content)
    
    # 4. Replace <br /> with newlines
    content = content.replace("<br />", "\n")
    
    # 5. Construct final format
    formatted_text = f"{title}\n---\n{content}"
    
    return formatted_text

def process_files():
    # Get all txt files in extracted directory
    extracted_dir = Path("extracted")
    for file_path in extracted_dir.glob("*.txt"):
        try:
            # Read the file
            with open(file_path, 'r', encoding='utf-8') as f:
                text = f.read()
            
            # Format the text
            formatted_text = format_text(text)
            
            # Write back to the same file
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(formatted_text)
                
            print(f"Successfully formatted: {file_path}")
            
        except Exception as e:
            print(f"Error processing {file_path}: {str(e)}")
            continue

if __name__ == "__main__":
    process_files() 