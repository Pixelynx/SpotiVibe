import requests
from bs4 import BeautifulSoup
import os
import time

GENIUS_API_TOKEN = os.getenv("GENIUS_API_TOKEN")
RATE_LIMIT_DELAY = 1  # 1 second delay between requests

if not GENIUS_API_TOKEN:
    raise ValueError("GENIUS_API_TOKEN is not set in the environment variables")

def get_lyrics_and_info(song_title, artist_name):
    time.sleep(RATE_LIMIT_DELAY)  # Basic rate limiting
    base_url = "https://api.genius.com"
    headers = {'Authorization': f'Bearer {GENIUS_API_TOKEN}'}
    search_url = base_url + "/search"
    data = {'q': song_title + ' ' + artist_name}
    try:
        response = requests.get(search_url, data=data, headers=headers)
        response.raise_for_status()
        json = response.json()
        remote_song_info = None
        for hit in json["response"]["hits"]:
            if artist_name.lower() in hit["result"]["primary_artist"]["name"].lower():
                remote_song_info = hit
                break
        if remote_song_info:
            song_url = remote_song_info["result"]["url"]
            page = requests.get(song_url)
            page.raise_for_status()
            html = BeautifulSoup(page.text, "html.parser")
            lyrics_div = html.find("div", class_="lyrics")
            if lyrics_div:
                lyrics = lyrics_div.get_text()
            else:
                lyrics = html.find("div", class_="Lyrics__Container").get_text()
            release_date = remote_song_info["result"].get("release_date_for_display", "Unknown")
            return lyrics, song_url, release_date
    except requests.RequestException as e:
        print(f"Error fetching lyrics for {song_title} by {artist_name}: {e}")
    except Exception as e:
        print(f"Unexpected error: {e}")
    return None, None, None