from pathlib import Path
import re

def clean_text(text):
    # Replace &mdash; with em dash
    text = text.replace("&mdash;", "—")
    
    # Replace <br /> with newline
    text = text.replace("<br />", "\n")
    
    # Convert <a> tags to markdown links
    # Pattern matches <a href="URL">TEXT</a>
    pattern = r'<a href="([^"]+)">([^<]+)</a>'
    text = re.sub(pattern, r'[\2](\1)', text)
    
    return text

def process_files():
    # Get all txt files in extracted directory
    extracted_dir = Path("extracted")
    for file_path in extracted_dir.glob("*.txt"):
        try:
            # Read the file
            with open(file_path, 'r', encoding='utf-8') as f:
                text = f.read()
            
            # Clean the text
            cleaned_text = clean_text(text)
            
            # Write back to the same file
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(cleaned_text)
                
            print(f"Successfully cleaned: {file_path}")
            
        except Exception as e:
            print(f"Error processing {file_path}: {str(e)}")
            continue

if __name__ == "__main__":
    process_files()
