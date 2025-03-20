from datetime import datetime as dt
import random
import re
import requests
from bs4 import BeautifulSoup
from dotenv import load_dotenv
import os
import time

load_dotenv()

GENIUS_API_TOKEN = os.getenv("GENIUS_API_TOKEN")
RATE_LIMIT_DELAY = 1  # 1 second delay between requests

if not GENIUS_API_TOKEN:
    raise ValueError("GENIUS_API_TOKEN is not set in the environment variables")

def get_lyrics_and_info(song_title, artist_name):
    print(f"Searching for lyrics: {song_title} by {artist_name}")
    time.sleep(random.uniform(2, 5))  # Random delay between requests
    base_url = "https://api.genius.com"
    headers = {
        'Authorization': f'Bearer {GENIUS_API_TOKEN}',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }
    search_url = f"{base_url}/search"
    data = {'q': f"{song_title} {artist_name}"}
    
    try:
        response = requests.get(search_url, params=data, headers=headers)
        response.raise_for_status()
        json = response.json()
        
        for hit in json["response"]["hits"]:
            if artist_name.lower() in hit["result"]["primary_artist"]["name"].lower():
                song_url = hit["result"]["url"]
                print(f"Found matching song: {song_url}")
                page = requests.get(song_url, headers=headers)
                page.raise_for_status()
                
                # Log the full HTML response
                # log_html_response(page.text, song_title, artist_name)
                
                html = BeautifulSoup(page.text, "html.parser")
                
                # Try to find lyrics in the body
                body = html.find('body')
                if body:
                    # Remove script and style elements
                    for script in body(["script", "style"]):
                        script.decompose()
                    
                    # Get text
                    text = body.get_text()
                    
                    # Break into lines and remove leading and trailing space on each
                    lines = (line.strip() for line in text.splitlines())
                    
                    # Break multi-headlines into a line each
                    chunks = (phrase.strip() for line in lines for phrase in line.split("  "))
                    
                    # Drop blank lines
                    lyrics = '\n'.join(chunk for chunk in chunks if chunk)
                    
                    # Try to extract only the lyrics part (this might need adjustment)
                    lyrics_match = re.search(r'Lyrics(.+)(Contributors|You might also like)', lyrics, re.DOTALL)
                    if lyrics_match:
                        lyrics = lyrics_match.group(1).strip()
                    
                    release_date = hit["result"].get("release_date_for_display", "Unknown")
                    print(f"Lyrics found for {song_title}")
                    return lyrics, song_url, release_date
                else:
                    print(f"Body tag not found for {song_title} by {artist_name}")
        
        print(f"No matching song found for {song_title} by {artist_name}")
    except requests.RequestException as e:
        print(f"Error fetching lyrics for {song_title} by {artist_name}: {e}")
    except Exception as e:
        print(f"Unexpected error in get_lyrics_and_info: {e}")
    
    return None, None, None

def log_html_response(html_content, song_title, artist_name):
    # Create a logs directory if it doesn't exist
    if not os.path.exists('logs'):
        os.makedirs('logs')
    
    # Create a filename with timestamp, song title, and artist name
    timestamp = dt.now().strftime("%Y%m%d_%H%M%S")
    filename = f"logs/genius_response_{timestamp}_{song_title}_{artist_name}.html"
    
    # Remove any characters that are not allowed in filenames
    filename = "".join(x for x in filename if x.isalnum() or x in "._- ")
    
    # Write the HTML content to the file
    with open(filename, 'w', encoding='utf-8') as f:
        f.write(html_content)
    
    print(f"HTML response logged to {filename}")