from flask import session
import spotipy
from spotipy.oauth2 import SpotifyOAuth
import os
from dotenv import load_dotenv

load_dotenv()

def get_spotify_oauth():
    return SpotifyOAuth(
        client_id=os.getenv("SPOTIPY_CLIENT_ID"),
        client_secret=os.getenv("SPOTIPY_CLIENT_SECRET"),
        redirect_uri=os.getenv("SPOTIPY_REDIRECT_URI"),
        scope="user-library-read"
    )

def get_spotify_client():
    token_info = session.get('token_info', None)
    if not token_info:
        raise Exception("User not authenticated")
    return spotipy.Spotify(auth=token_info['access_token'])

# def authenticate():
#     client_credentials_manager = SpotifyClientCredentials(client_id='YOUR_CLIENT_ID', client_secret='YOUR_CLIENT_SECRET')
#     sp = spotipy.Spotify(client_credentials_manager=client_credentials_manager)
#     return sp

def get_artist_id(sp, artist_name):
    results = sp.search(q='artist:' + artist_name, type='artist')
    items = results['artists']['items']
    if items:
        return items[0]['id']
    return None

def get_artist_tracks(sp, artist_id):
    tracks = []
    album_types = ['album', 'single', 'compilation']
    
    for album_type in album_types:
        offset = 0
        while True:
            results = sp.artist_albums(artist_id, album_type=album_type, limit=50, offset=offset)
            albums = results['items']
            
            if not albums:
                break
            
            for album in albums:
                album_tracks = sp.album_tracks(album['id'])
                tracks.extend(album_tracks['items'])
            
            offset += len(albums)
            if len(albums) < 50:
                break
    
    # Get tracks where the artist is featured
    search_results = sp.search(q=f'artist:{sp.artist(artist_id)["name"]}', type='track', limit=50)
    tracks.extend(search_results['tracks']['items'])
    
    return tracks
