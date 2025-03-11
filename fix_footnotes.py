from pathlib import Path
import re

def fix_footnotes(text):
    # Pattern 1: matches [<a name="f1n"><font color=#000000>NUMBER</font></a>]
    pattern1 = r'\[<a name="f\d+n"><font color=#[0-9a-fA-F]{6}>(\d+)</font></a>\]'
    
    # Pattern 2: matches <font color=#XXXXXX>[<a href="#fXn"><font color=#XXXXXX>TEXT</font></a>]</font>
    pattern2 = r'<font color=#[0-9a-fA-F]{6}>\[<a href="#f\d+n"><font color=#[0-9a-fA-F]{6}>([^<]+)</font></a>\]</font>'
    
    # First replace pattern 1
    text = re.sub(pattern1, r'[\1]', text)
    
    # Then replace pattern 2
    text = re.sub(pattern2, r'[\1]', text)
    
    return text

def process_files():
    # Get all txt files in extracted directory
    extracted_dir = Path("extracted")
    for file_path in extracted_dir.glob("*.txt"):
        try:
            # Read the file
            with open(file_path, 'r', encoding='utf-8') as f:
                text = f.read()
            
            # Fix footnote formatting
            fixed_text = fix_footnotes(text)
            
            # Only write back if changes were made
            if fixed_text != text:
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write(fixed_text)
                print(f"Successfully fixed footnotes in: {file_path}")
            
        except Exception as e:
            print(f"Error processing {file_path}: {str(e)}")
            continue

if __name__ == "__main__":
    process_files() 