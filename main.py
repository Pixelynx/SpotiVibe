import os
from flask import Flask, render_template, request, redirect, url_for, session
from spotify_api import get_spotify_client, get_artist_id, get_artist_tracks, get_spotify_oauth
from dotenv import load_dotenv

load_dotenv()  # Load environment variables

app = Flask(__name__)
app.secret_key = os.urandom(24)

def calculate_total_duration(tracks):
    total_duration_ms = sum(track['duration_ms'] for track in tracks)
    return total_duration_ms / (1000 * 60 * 60)  # Convert to hours

@app.route('/')
def index():
    return render_template('search.html')

@app.route('/search', methods=['POST'])
def search():
    artist_name = request.form['artist']
    
    # Check if user is authenticated
    if 'token_info' not in session:
        return redirect('/login')
    
    sp = get_spotify_client()
    
    artist_id = get_artist_id(sp, artist_name)
    if not artist_id:
        return f"Artist {artist_name} not found.", 404

    tracks = get_artist_tracks(sp, artist_id)
    total_duration_hours = calculate_total_duration(tracks)
    
    return render_template('results.html', 
                           artist_name=artist_name, 
                           total_duration=total_duration_hours)

@app.route('/login')
def login():
    sp_oauth = get_spotify_oauth()
    auth_url = sp_oauth.get_authorize_url()
    return redirect(auth_url)

@app.route('/callback')
def callback():
    sp_oauth = get_spotify_oauth()
    session.clear()
    code = request.args.get('code')
    token_info = sp_oauth.get_access_token(code)
    session["token_info"] = token_info
    return redirect('/search')

if __name__ == "__main__":
    app.run(port=3000, debug=True)