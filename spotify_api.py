import spotipy
from spotipy.oauth2 import SpotifyClientCredentials

def authenticate():
    client_credentials_manager = SpotifyClientCredentials(client_id='YOUR_CLIENT_ID', client_secret='YOUR_CLIENT_SECRET')
    sp = spotipy.Spotify(client_credentials_manager=client_credentials_manager)
    return sp

def get_artist_id(sp, artist_name):
    results = sp.search(q='artist:' + artist_name, type='artist')
    items = results['artists']['items']
    if items:
        return items[0]['id']
    return None