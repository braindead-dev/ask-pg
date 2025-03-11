from pathlib import Path
import requests
import time

def get_article_content(url):
    try:
        # Add delay to be polite
        time.sleep(1)
        
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        return response.text
    except Exception as e:
        print(f"Error fetching {url}: {str(e)}")
        return None

def process_files():
    # Get all txt files in extracted directory
    extracted_dir = Path("extracted")
    base_url = "http://paulgraham.com"
    
    for file_path in extracted_dir.glob("*.txt"):
        try:
            # Read the file
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # Check if file contains the "No Content Found" marker
            if "---\nNo Content Found" in content:
                # Get article name from filename
                article_name = file_path.stem  # Gets filename without extension
                
                # Construct URL
                url = f"{base_url}/{article_name}.html"
                print(f"Rescraping {url}")
                
                # Get new content
                new_content = get_article_content(url)
                
                if new_content:
                    # Write new content to file
                    with open(file_path, 'w', encoding='utf-8') as f:
                        f.write(new_content)
                    print(f"Successfully rescraped: {file_path}")
                else:
                    print(f"Failed to rescrape: {file_path}")
            
        except Exception as e:
            print(f"Error processing {file_path}: {str(e)}")
            continue

if __name__ == "__main__":
    process_files() 