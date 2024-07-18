from flask import Flask, request, redirect, session, render_template
import spotipy
from spotipy.oauth2 import SpotifyOAuth
from dotenv import load_dotenv
import os
from spotify_api import *  # Import your Spotify API functions

load_dotenv()  # Load environment variables

app = Flask(__name__)
app.secret_key = os.urandom(24)

sp_oauth = SpotifyOAuth(
    client_id=os.getenv("SPOTIPY_CLIENT_ID"),
    client_secret=os.getenv("SPOTIPY_CLIENT_SECRET"),
    redirect_uri=os.getenv("SPOTIPY_REDIRECT_URI"),
    scope="user-library-read"
)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/login')
def login():
    auth_url = sp_oauth.get_authorize_url()
    return redirect(auth_url)

@app.route('/callback')
def callback():
    session.clear()
    code = request.args.get('code')
    token_info = sp_oauth.get_access_token(code)
    session["token_info"] = token_info
    return redirect('/search')

@app.route('/search')
def search():
    if 'token_info' not in session:
        return redirect('/login')
    
    sp = spotipy.Spotify(auth=session['token_info']['access_token'])
    # Here you can implement your search functionality
    # For example:
    # results = sp.search(q='artist:' + artist_name, type='artist')
    # return render_template('results.html', results=results)
    return "Search functionality to be implemented"

if __name__ == '__main__':
    app.run(port=3000, debug=True)