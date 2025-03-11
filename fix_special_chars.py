from pathlib import Path
import re

def fix_special_chars(text):
    # Dictionary of replacements
    replacements = {
        '&mdash;': '—',  # em dash
        '&ndash;': '–',  # en dash
        '&amp;': '&',    # ampersand
        '&lt;': '<',     # less than
        '&gt;': '>',     # greater than
        '&quot;': '"',   # quotation mark
        '&apos;': "'",   # apostrophe
        '&nbsp;': ' ',   # non-breaking space
    }
    
    # Replace each HTML entity with its Unicode equivalent
    for html, char in replacements.items():
        text = text.replace(html, char)
    
    return text

def process_files():
    # Get all txt files in extracted directory
    extracted_dir = Path("extracted")
    for file_path in extracted_dir.glob("*.txt"):
        try:
            # Read the file
            with open(file_path, 'r', encoding='utf-8') as f:
                text = f.read()
            
            # Fix special characters
            fixed_text = fix_special_chars(text)
            
            # Only write back if changes were made
            if fixed_text != text:
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write(fixed_text)
                print(f"Successfully fixed special characters in: {file_path}")
            
        except Exception as e:
            print(f"Error processing {file_path}: {str(e)}")
            continue

if __name__ == "__main__":
    process_files() 