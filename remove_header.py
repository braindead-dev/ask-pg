from pathlib import Path
import re

def remove_header(text):
    # Pattern to match the header table, using re.escape to handle special characters
    header_pattern = re.escape(
        '<table width=100% cellspacing=0> '
        '<tr><td bgcolor=#ff9922>'
        '<img src="http://www.virtumundo.com/images/spacer.gif" height=15 width=1>'
        '<font size=2> '
        '<b>Want to start a startup?</b> '
        'Get funded by [Y Combinator](http://ycombinator.com/apply.html). '
        '</font> '
        '<br><img src="http://www.virtumundo.com/images/spacer.gif" height=5 width=1>'
        '</td ></tr> '
        '</table> '
        '<p>'
    )
    
    # Remove all instances of the header
    cleaned_text = re.sub(header_pattern, '', text)
    return cleaned_text

def process_files():
    # Get all txt files in extracted directory
    extracted_dir = Path("extracted")
    for file_path in extracted_dir.glob("*.txt"):
        try:
            # Read the file
            with open(file_path, 'r', encoding='utf-8') as f:
                text = f.read()
            
            # Remove headers
            cleaned_text = remove_header(text)
            
            # Only write back if changes were made
            if cleaned_text != text:
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write(cleaned_text)
                print(f"Successfully removed header from: {file_path}")
            
        except Exception as e:
            print(f"Error processing {file_path}: {str(e)}")
            continue

if __name__ == "__main__":
    process_files() 