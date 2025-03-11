from pathlib import Path
import re

def fix_anchors(text):
    # Pattern matches <a name="something">TEXT</a>
    # Preserves any markdown formatting within the text
    pattern = r'<a name="[^"]*">([^<]+)</a>'
    
    # Replace with just the text content
    text = re.sub(pattern, r'\1', text)
    
    return text

def process_files():
    # Get all txt files in extracted directory
    extracted_dir = Path("extracted")
    for file_path in extracted_dir.glob("*.txt"):
        try:
            # Read the file
            with open(file_path, 'r', encoding='utf-8') as f:
                text = f.read()
            
            # Fix anchors
            fixed_text = fix_anchors(text)
            
            # Only write back if changes were made
            if fixed_text != text:
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write(fixed_text)
                print(f"Successfully fixed anchors in: {file_path}")
            
        except Exception as e:
            print(f"Error processing {file_path}: {str(e)}")
            continue

if __name__ == "__main__":
    process_files() 