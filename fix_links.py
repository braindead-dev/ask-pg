from pathlib import Path
import re

def fix_formatting(text):
    # Fix links first
    pattern_links = r'<a href="([^"]+)">(?:<u>)?([^<]+)(?:</u>)?</a>'
    text = re.sub(pattern_links, r'[\2](\1)', text)
    
    # Fix bold tags (<b> or <strong>)
    pattern_bold = r'<(?:b|strong)>([^<]+)</(?:b|strong)>'
    text = re.sub(pattern_bold, r'**\1**', text)
    
    # Fix italic tags (<i> or <em>)
    pattern_italic = r'<(?:i|em)>([^<]+)</(?:i|em)>'
    text = re.sub(pattern_italic, r'*\1*', text)
    
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