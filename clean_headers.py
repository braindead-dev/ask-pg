from pathlib import Path
import re

def clean_header(text):
    # List of all possible month names
    months = (
        "January|February|March|April|May|June|July|August|"
        "September|October|November|December"
    )
    
    # Pattern to match everything from title to date
    # Captures: title, month, and year
    pattern = rf'^(.*?)\n---\n(?:.*?)(\b(?:{months})\b\s+\d{{4}})'
    
    # Replace with just title, separator, and date
    replacement = r'\1\n---\n\2'
    
    # Apply the replacement
    cleaned = re.sub(pattern, replacement, text, flags=re.DOTALL)
    
    return cleaned

def process_files():
    # Get all txt files in extracted directory
    extracted_dir = Path("extracted")
    for file_path in extracted_dir.glob("*.txt"):
        try:
            # Read the file
            with open(file_path, 'r', encoding='utf-8') as f:
                text = f.read()
            
            # Clean header
            cleaned_text = clean_header(text)
            
            # Only write back if changes were made
            if cleaned_text != text:
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write(cleaned_text)
                print(f"Successfully cleaned header in: {file_path}")
            
        except Exception as e:
            print(f"Error processing {file_path}: {str(e)}")
            continue

if __name__ == "__main__":
    process_files() 